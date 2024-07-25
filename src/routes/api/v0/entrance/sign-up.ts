import * as smtp from '../../../../helpers/smtp/nodemailer.ts'

import Mail from 'nodemailer/lib/mailer'
import SystemKv from '../../../../helpers/utils/db.ts'
import UserSchema from '../../../../schemas/user.schema.ts'
import newUserHbs from '../../../../helpers/smtp/templates/render.ts'

import { load } from '$std/dotenv/mod.ts'
import { HelperDelegate } from 'handlebars'
import { encodeHex } from '$std/encoding/hex.ts'
import { FreshContext, Handlers } from '$fresh/server.ts'
import { dirname, fromFileUrl, join } from '$std/path/mod.ts'
import { newToken } from '../../../../helpers/utils/jwt.ts'

const env: Record<string, string> = await load()

export const handler: Handlers = {
	/**
	 * @description Handles the POST request for signing in.
	 * @param {Request} _request - The incoming request object.
	 * @param {FreshContext} ctx - The fresh context object with the system context.
	 * @returns {Promise<Response>} A promise that resolves to a Response object.
	 */
	async POST(_request: Request, ctx: FreshContext): Promise<Response> {
		const email: string = ctx.state.email as string

		try {
			const result: ServerData = await processEmail(SystemKv.id(ctx), email)
			return Response.json(result, { status: result.code })
		} catch (error: unknown) {
			return Response.json({
				success: false,
				code: 500,
				type: 'error',
				message: `-ERR ${error instanceof Error ? error.message : 'unknown error'}`,
			}, { status: 500 })
		}
	},
}

/**
 * @description Creates a ServerData object with the given properties.
 * @param {boolean} success - Indicates whether the operation was successful.
 * @param {number} code - The HTTP status code.
 * @param {string} message - The message to be displayed.
 * @param {string | undefined} feedback - Additional feedback to be included.
 * @returns {ServerData} The ServerData object.
 */
function sendData(success: boolean, code: number, message: string, feedback?: string): ServerData {
	return { success, code, message, feedback } as ServerData
}

/**
 * @description Processes the email by hashing it, finding the corresponding user, and sending a verification email if needed.
 * @param {string} system_id The system id.
 * @param {string} email - The email to be processed.
 * @return {Promise<string>} A promise that resolves to a JSON string containing the token.
 */
async function processEmail(system_id: string, email: string): Promise<ServerData> {
	const data: Uint8Array = new TextEncoder().encode(`system-nvll-user:${email}`)
	const emailHash: string = encodeHex(await crypto.subtle.digest('SHA-256', data))
	const user: UserSchema | null = await UserSchema.findOne({ email: emailHash })

	if (!user) return sendData(false, 404, '-ERR user not found')
	if (!user.isValidEmail(email)) return sendData(false, 401, '-ERR wrong credentials given')
	if (!user.is_active) {
		// send verification email for inactive user.
		await sendVerificationEmail(system_id, user, email)
	} else {
		// send verification email for active user.
		await sendVerificationEmail(system_id, user, email)
	}

	return sendData(true, 202, '+OK verification email sent')
}

/**
 * @description Sends a verification email to the user with the provided token.
 * @param {string} system_id The system id.
 * @param {User} user - The user object for whom the email is being sent.
 * @param {string} email - The email address where the verification email is sent.
 * @return {Promise<void>} A promise that resolves once the verification email is sent.
 */
async function sendVerificationEmail(system_id: string, user: UserSchema, email: string): Promise<void> {
	const token: string = (await createToken(system_id, user)).accessToken
	const template: HelperDelegate = await newUserHbs({ username: email.split('@')[0], email, token })
	const emailData: Mail.options = {
		from: env['SMTP_USER'] as string,
		to: email,
		subject: 'Verify Your Email',
		html: template,
		attachments: [{
			filename: 'nvll.png',
			path: join(dirname(fromFileUrl(import.meta.url)), '..', '..', '..', '..', 'static', 'assets', 'png', 'nvll-no-pad.png'),
			cid: 'unique@nvll',
		}],
	}

	// Sending emails only in production mode.
	if (!env['APP_ENV'].startsWith('dev')) {
		if (!(await smtp.send(emailData))) throw new Error('failed to send email')
	}
}

/**
 * @description Generates an access and refresh token for a given user.
 * @param {string} system_id The system id.
 * @param {User} user - The user for whom the tokens are being generated.
 * @return {Promise<{ accessToken: string; refreshToken: string }>} A promise that resolves
 * to an object containing the access and refresh tokens.
 */
async function createToken(system_id: string, user: UserSchema): Promise<{ accessToken: string; refreshToken: string }> {
	return {
		accessToken: await newToken(system_id, { im_address: user.im_address, authType: 'access' }, 3), // expires in 3 minutes
		refreshToken: await newToken(system_id, { im_address: user.im_address, authType: 'refresh' }, 60), // expires in 60 minutes
	}
}
