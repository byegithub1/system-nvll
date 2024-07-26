import SystemKv from '../../../../helpers/utils/db.ts'
import data from '../../../../helpers/utils/middleware/data.ts'
import sendTxEmail from '../../../../helpers/utils/handler/send-tx-email.ts'
import sendResponse from '../../../../helpers/utils/handler/send-response.ts'
import signInTxEmailTemplate from '../../../../helpers/smtp/templates/sign-in-tx/render.ts'

import { encodeHex } from '$std/encoding/hex.ts'
import { FreshContext, Handlers } from '$fresh/server.ts'
import { dirname, fromFileUrl, join } from '$std/path/mod.ts'

interface SignInTxEmailData extends TxEmailTemplateData {
	username: string
	email: string
	token: string
}

export const handler: Handlers = {
	/**
	 * @description Handles the POST request for signing in.
	 * @param {Request} _request - The incoming request object.
	 * @param {FreshContext} ctx - The fresh context object with the system context.
	 * @returns {Promise<Response>} A promise that resolves to a Response object.
	 */
	async POST(_request: Request, ctx: FreshContext): Promise<Response> {
		const { email, resend } = ctx.state as { email: string; resend: string }
		const system_id: string = SystemKv.id(ctx)

		try {
			const emailHash: string = encodeHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${system_id}:${email}`)))
			const user: Deno.KvEntryMaybe<unknown> = await SystemKv.get(['system_nvll', 'users', emailHash])
			const userData: UserSchema | undefined = user.value as UserSchema

			if (!userData) return sendResponse(data({ success: false, code: 404, message: '-ERR user not found' }))
			if (emailHash !== userData.email) return sendResponse(data({ success: false, code: 401, message: '-ERR wrong credentials given' }))

			await sendTxEmail<SignInTxEmailData>(system_id, userData, {
				template: {
					render: signInTxEmailTemplate,
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

			return sendResponse(data({ success: true, code: 202, message: `+OK ${resend ? "we've resent it" : 'verification email has been sent'}` }))
		} catch (error: unknown) {
			return sendResponse(data({ success: false, code: 500, message: `-ERR ${error instanceof Error ? error.message : 'unknown error'}` }))
		}
	},
}
