import saslprep from 'saslprep'
import sendTxEmail from '../../../../helpers/utils/emails/send-tx-email.ts'
import signUpTxEmailTemplate from '../../../../helpers/utils/emails/templates/sign-up-tx/render.ts'

import SystemKv, { ulid } from '../../../../helpers/database/system-kv.ts'

import { sha256 } from '@noble/hashes/sha256'
import { pbkdf2Async } from '@noble/hashes/pbkdf2'
import { FreshContext, Handlers } from '$fresh/server.ts'
import { encodeBase64Url } from '$std/encoding/base64url.ts'
import { dirname, fromFileUrl, join } from '$std/path/mod.ts'
import { data, json } from '../../../../helpers/utils/responses.ts'

interface SignUpTxEmailData extends TxEmailTemplateData {
	username: string
	email: string
	token: string
}

export const handler: Handlers = {
	/**
	 * @description Handles the POST request for signing up.
	 * @param {Request} _request - The incoming request object.
	 * @param {FreshContext} ctx - The fresh context object with the system context.
	 * @returns {Promise<Response>} A promise that resolves to a Response object.
	 */
	async POST(_request: Request, ctx: FreshContext): Promise<Response> {
		const { remoteIp, email, password } = ctx.state as { remoteIp: string; email: string; password: string }
		const system_id: string = SystemKv.id(ctx)
		const currentTimestamp: number = Math.trunc(Date.now() / 1000)

		try {
			const emailHash: string = encodeBase64Url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${system_id}:${email}`)))
			const user: Deno.KvEntryMaybe<unknown> = await SystemKv.get(['system_nvll', 'users', emailHash])

			if (user.value) {
				return json(data({
					success: false,
					code: 400,
					type: 'sign-up',
					message: '-ERR user already exists',
				}))
			}

			const newUser: UserSchema = {
				ulid: ulid(),
				name: {
					value: '',
					updated_at: currentTimestamp,
				},
				username: email.split('@')[0],
				email: {
					value: emailHash,
					verified: false,
					updated_at: currentTimestamp,
				},
				im_address: {
					value: `${email.split('@')[0]}@nvll.me`,
					updated_at: currentTimestamp,
				},
				zero_access: await zeroAccess(password),
				messages: {
					im: {
						inbox: [],
						trash: [],
						error_count: 0,
						consecutive_success_count: 0,
					},
				},
				access_token: '',
				refresh_token: '',
				remoteIp: remoteIp,
				created_at: currentTimestamp,
				updated_at: currentTimestamp,
			}

			await sendTxEmail<SignUpTxEmailData>(system_id, newUser, {
				template: {
					render: signUpTxEmailTemplate,
					subject: 'Verify Your Email',
					attachments: [{
						filename: 'nvll.png',
						path: join(dirname(fromFileUrl(import.meta.url)), '..', '..', '..', '..', 'static', 'assets', 'png', 'nvll-no-pad.png'),
						cid: 'unique@nvll',
					}],
				},
				templateData: {
					username: email.split('@')[0],
					email,
					token: '', // This will be filled by sendTxEmail if left empty
				},
				to: email,
			})
			await SystemKv.set(['system_nvll', 'users', newUser.email.value], newUser)

			return json(data({
				success: true,
				code: 202,
				type: 'sign-up',
				message: '+OK verification email sent',
			}))
		} catch (error: unknown) {
			return json(data({
				success: false,
				code: 500,
				type: 'sign-up',
				message: `-ERR ${error instanceof Error ? error.message : 'unknown error'}`,
			}))
		}
	},
}

/**
 * @description Generates Scram credentials for a given password.
 * @param {string} password - The password for the credentials.
 * @return {Promise<UserSchema['zero_access']>} The created Scram credentials.
 */
async function zeroAccess(password: string): Promise<UserSchema['zero_access']> {
	const timestamp: number = Math.trunc(Date.now() / 1000)
	const salt: Uint8Array = crypto.getRandomValues(new Uint8Array(32))
	const normalizedPassword: string = saslprep(password)
	const iterations: number = 8192 * Math.abs(crypto.getRandomValues(new Int8Array(1))[0])
	const saltedPassword: Uint8Array = await pbkdf2Async(sha256, normalizedPassword, salt, { c: iterations, dkLen: 32 })

	return {
		s: encodeBase64Url(salt),
		p: encodeBase64Url(saltedPassword),
		i: iterations,
		b: 32,
		reservation: {
			rsv: 'created by system',
			created_at: timestamp,
		},
		updated_at: timestamp,
	} as UserSchema['zero_access']
}
