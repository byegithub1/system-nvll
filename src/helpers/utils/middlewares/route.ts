import SystemKv, { ulid } from '../../database/system-kv.ts'

import { sentinel } from '../sentinel.ts'
import { FreshContext } from '$fresh/server.ts'

const PROTECTED_METHODS: Set<string> = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])
const OPEN_METHODS: Set<string> = new Set(['GET', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'])

export default async function route(
	request: Request,
	ctx: FreshContext<SystemState>,
	url: URL,
	remoteIp: string,
	startTime: number,
): Promise<{ response: Response; rateLimited: boolean }> {
	const newTraffic: TrafficSchema = {
		ulid: ulid(),
		endpoint: ctx.url.pathname,
		method: request.method,
		processing: true,
		timestamp: Math.floor(Date.now() / 1000),
	}
	const trafficJam: boolean = PROTECTED_METHODS.has(newTraffic.method) || !OPEN_METHODS.has(newTraffic.method)

	if (trafficJam) {
		const traffic = await SystemKv.get(['system_nvll', 'traffics', remoteIp]) as Deno.KvEntryMaybe<TrafficSchema>
		if (traffic?.value?.processing) {
			const responseTime: string = `${(performance.now() - startTime).toFixed(2)}ms`
			const { headers: securedHeaders, rateLimited }: SentinelData = sentinel(
				url.pathname,
				new Headers(),
				remoteIp,
				request.method,
				200,
				responseTime,
			)
			if (rateLimited) return { response: new Response(null, { status: 429, headers: securedHeaders }), rateLimited: true }
			return {
				response: new Response("-OK please be patient, we're still processing your request", { status: 200, headers: securedHeaders }),
				rateLimited: false,
			}
		}
		await SystemKv.set(['system_nvll', 'traffics', remoteIp], newTraffic)
	}

	let response: Response

	try {
		response = await ctx.next()
	} finally {
		if (trafficJam) {
			newTraffic.processing = false
			await SystemKv.set(['system_nvll', 'traffics', remoteIp], newTraffic, 60000)
		}
	}

	const responseTime: string = `${(performance.now() - startTime).toFixed(2)}ms`
	const { headers: securedHeaders, rateLimited }: SentinelData = sentinel(
		url.pathname,
		new Headers(response.headers),
		remoteIp,
		request.method,
		response.status,
		responseTime,
	)

	if (rateLimited) return { response: new Response(null, { status: 429, headers: securedHeaders }), rateLimited: true }

	securedHeaders.set('X-Response-Time', responseTime)

	return {
		response: new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: securedHeaders,
		}),
		rateLimited: false,
	}
}
