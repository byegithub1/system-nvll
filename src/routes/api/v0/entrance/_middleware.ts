import responder from '../../../../helpers/utils/responder.ts'
import SystemKv from '../../../../helpers/database/system-kv.ts'
import payloadExtractor from '../../../../helpers/utils/payload.ts'
import validator from '../../../../helpers/utils/validations/validator.ts'
import captchaValidator from '../../../../helpers/utils/captchas/validator.ts'
import CaptchaValidationSchema from '../../../../helpers/utils/validations/captcha.ts'
import EntranceValidationSchema from '../../../../helpers/utils/validations/entrance.ts'

import { ZodSchema } from 'zod'
import { FreshContext } from '$fresh/server.ts'
import { data } from '../../../../helpers/utils/responses.ts'

const SUPPORTED_CT: readonly string[] = ['application/x-www-form-urlencoded']

type SupportedContentType = typeof SUPPORTED_CT[number]

/**
 * @description Handles the incoming request and returns a response based on the request method.
 * @param {Request} request - The incoming request object.
 * @param {FreshContext} ctx - The fresh context object with the system context.
 * @returns {Promise<Response>} A promise that resolves to a Response object.
 */
export async function handler(request: Request, ctx: FreshContext): Promise<Response> {
	const system_id: string = SystemKv.id(ctx)
	const contentType: SupportedContentType | null = request.headers.get('Content-Type') as SupportedContentType | null

	switch (request.method) {
		case 'OPTIONS': {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Credentials': 'true',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Allow-Methods': 'HEAD, OPTIONS, POST',
				},
			})
		}
		case 'POST': {
			if (!contentType || !SUPPORTED_CT.includes(contentType)) return new Response('-ERR unsupported or missing content-type', { status: 400 })

			try {
				const payload: HttpPayload = await payloadExtractor(request, ctx, SUPPORTED_CT)

				if (typeof payload !== 'object' || Object.keys(payload).length <= 0) return new Response('-ERR no data provided', { status: 400 })

				const withCaptcha: boolean = 'captcha' in payload
				const validationSchema: ZodSchema = withCaptcha ? CaptchaValidationSchema : EntranceValidationSchema

				if (withCaptcha) Object.assign(payload, JSON.parse(payload.captcha as string))

				const validation: ReturnType<typeof data> = validator(validationSchema, payload)

				if (validation.success && validation.data?.email) {
					Object.assign(validation, await captchaValidator(system_id, validation))

					if (validation.success) {
						ctx.state.remoteIp = validation.data.remoteIp
						ctx.state.email = validation.data.email
						ctx.state.resend = ctx.url.searchParams.get('resend')

						Object.assign(validation, await (await ctx.next()).json())
					}
				}

				return responder(contentType, validation)
			} catch (error) {
				return new Response(`-ERR processing request: ${error instanceof Error ? error.message : 'unknown error'}`, { status: 500 })
			}
		}
		default: {
			return new Response('-ERR 405 method not allowed', { status: 405 })
		}
	}
}
