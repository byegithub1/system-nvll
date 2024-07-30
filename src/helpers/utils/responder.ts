import { Cookie, setCookie } from '$std/http/cookie.ts'

/**
 * @description Sends a response based on the provided content type and server data.
 * @param {string} contentType - The content type of the response.
 * @param {ServerDataSchema} data - The server data to be sent in the response.
 * @param {string} [pathname='/entrance'] - The pathname of the response. Defaults to '/entrance'.
 * @return {Response} A Response object with the appropriate data and status code.
 */
export default function responder(contentType: string, data: ServerDataSchema, pathname: string = '/entrance'): Response {
	const responseData: ServerDataSchema = { ...data }

	if (data.success && data.data) responseData.data = data.data
	if (!data.success && data.errors) responseData.errors = data.errors
	if (data.feedback) responseData.feedback = data.feedback
	if (contentType.includes('application/x-www-form-urlencoded')) {
		const headers: Headers = new Headers()

		setCookie(headers, {
			name: 'data',
			value: encodeURIComponent(JSON.stringify(responseData)),
			path: pathname,
			sameSite: 'Strict' as Cookie['sameSite'],
			secure: true,
			httpOnly: true,
			maxAge: 60,
		})

		headers.set('location', pathname)
		headers.set('X-Purpose', data.type || 'unclear')
		return new Response(null, { status: 303, headers })
	}
	return Response.json(responseData, { status: data.code })
}
