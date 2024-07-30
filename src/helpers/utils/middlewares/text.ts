import { sentinel } from '../sentinel.ts'

export default function text({ response, pathname, remoteIp, method, startTime }: MiddlewareStaticProps): Response {
	const headers: Headers = new Headers(response.headers)
	const responseTime: string = `${(performance.now() - startTime).toFixed(2)}ms`
	const { headers: securedHeaders, rateLimited }: SentinelData = sentinel(
		pathname,
		headers,
		remoteIp,
		method,
		response.status,
		responseTime,
	)

	if (rateLimited) return new Response(null, { status: 429, headers: securedHeaders })

	securedHeaders.set('Content-Type', 'text/plain; charset=utf-8')
	securedHeaders.set('X-Response-Time', responseTime)

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: securedHeaders,
	})
}
