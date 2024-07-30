import sendTxEmail from '../../../../helpers/utils/emails/send-tx-email.ts'
import signUpTxEmailTemplate from '../../../../helpers/utils/emails/templates/sign-up-tx/render.ts'

import SystemKv, { ulid } from '../../../../helpers/database/system-kv.ts'

import { encodeHex } from '$std/encoding/hex.ts'
import { FreshContext, Handlers } from '$fresh/server.ts'
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
		const { remoteIp, email } = ctx.state as { remoteIp: string; email: string }
		const system_id: string = SystemKv.id(ctx)

		try {
			const emailHash: string = encodeHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${system_id}:${email}`)))
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
				username: email.split('@')[0],
				email: emailHash,
				im_address: `${email.split('@')[0]}@nvll.me`,
				scram_sha256: {
					s: encodeHex(crypto.getRandomValues(new Uint8Array(24))),
					p: 'inactive',
					i: 8192 * Math.abs(crypto.getRandomValues(new Int8Array(1))[0]),
					b: 32,
					reservation: {
						rsv: 'created by system',
						created_at: Math.floor(Date.now() / 1000),
					},
				},
				messages: {
					im: {
						inbox: [],
						trash: [],
						error_count: 0,
						consecutive_success_count: 0,
					},
				},
				is_active: false,
				access_token: '',
				refresh_token: '',
				remoteIp: remoteIp,
				created_at: Math.floor(Date.now() / 1000),
				updated_at: Math.floor(Date.now() / 1000),
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
			await SystemKv.set(['system_nvll', 'users', newUser.email], newUser)

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
