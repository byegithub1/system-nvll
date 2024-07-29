import { FreshContext } from '$fresh/server.ts'

/**
 * @description Extracts the payload from the request based on the content type.
 * @param {Request} request - The incoming request object.
 * @param {FreshContext} ctx - The fresh context object.
 * @param {readonly string[]} supportedContentTypes - The list of supported content types.
 * @returns {Promise<HttpPayload>} A Promise that resolves to the extracted payload, or an empty object if the content type is not supported.
 */
export default async function payloadExtractor(request: Request, ctx: FreshContext, supportedContentTypes: readonly string[]): Promise<HttpPayload> {
	switch (request.headers.get('Content-Type') as typeof supportedContentTypes[number] | null) {
		case 'application/x-www-form-urlencoded': {
			try {
				const formData: FormData = await request.formData()
				const payload: Record<string, unknown> = Object.fromEntries(formData.entries())
				return {
					remoteIp: request.headers.get('X-Forwarded-For') || ctx.remoteAddr.hostname,
					...payload,
				}
			} catch (_error) {
				return {}
			}
		}
		case 'application/json': {
			try {
				return {
					remoteIp: request.headers.get('X-Forwarded-For') || ctx.remoteAddr.hostname,
					...await request.json() as HttpPayload,
				}
			} catch (_error) {
				return {}
			}
		}
		default: {
			return {}
		}
	}
}
