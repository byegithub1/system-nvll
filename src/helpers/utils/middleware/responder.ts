import { load } from '$std/dotenv/mod.ts'
import { Cookie, setCookie } from '$std/http/cookie.ts'

const env: Record<string, string> = await load()

/**
 * @description Sends a response based on the provided content type and server data.
 * @param {string} contentType - The content type of the response.
 * @param {ServerData} data - The server data to be sent in the response.
 * @returns {Response} A Response object with the appropriate data and status code.
 */
export default function responder(contentType: string, data: ServerData, pathname: string = '/entrance'): Response {
	const responseData: ServerData = { ...data }

	if (data.success && data.data) responseData.data = data.data
	if (!data.success && data.errors) responseData.errors = data.errors
	if (data.feedback) responseData.feedback = data.feedback
	if (contentType.includes('application/x-www-form-urlencoded')) {
		const headers: Headers = new Headers()

		setCookie(headers, {
			name: 'data',
			value: encodeURIComponent(JSON.stringify(responseData)),
			domain: env['APP_ENV'].startsWith('dev') ? 'localhost' : 'nvll.me',
			path: pathname,
			sameSite: 'Strict' as Cookie['sameSite'],
			secure: true,
			httpOnly: true,
			maxAge: 60,
		})

		headers.set('location', pathname)
		return new Response(null, { status: 303, headers })
	}
	return Response.json(responseData, { status: data.code })
}
