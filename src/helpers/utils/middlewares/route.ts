import SystemKv from '../../database/system-kv.ts'

import { uuidv7 } from '../uuidv7.ts'
import { data } from '../responses.ts'
import { sentinel } from '../sentinel.ts'
import { load } from '$std/dotenv/mod.ts'

const env: Record<string, string> = await load({ envPath: '.env', export: true })

const PROTECTED_METHODS: ReadonlySet<string> = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])
const OPEN_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'])

/**
 * @description Asynchronously handles a route request.
 * @param {MiddlewareRouteProps} request - The request object containing the request, context, URL, remote IP, and start time.
 * @return {Promise<Response>} A promise that resolves to a Response object.
 */
export default async function route({ request, ctx, url, remoteIp, startTime }: MiddlewareRouteProps): Promise<Response> {
	const authorization: string | null = request.headers.get('Authorization')

	const unauthorizedResponse = () =>
		new Response('-ERR 401 unauthorized', {
			status: 401,
			headers: { 'WWW-Authenticate': 'Basic realm="Restricted"' },
		})

	if (env['APP_ENV'].startsWith('dev')) {
		if (!authorization) return unauthorizedResponse()

		try {
			const [username, password]: string[] = atob(authorization.split(' ')[1]).split(':')
			if (username !== 'preview' || password !== 'allow-me') return unauthorizedResponse()
		} catch (_error) {
			return unauthorizedResponse()
		}
	}

	const method: string = request.method
	const trafficJam: boolean = PROTECTED_METHODS.has(method) || !OPEN_METHODS.has(method)

	let serverData: ServerDataSchema | undefined

	if (trafficJam) {
		const traffic = await SystemKv.get(['system_nvll', 'traffics', remoteIp]) as Deno.KvEntry<ServerDataSchema>
		const trafficHistories = traffic.value?.data?.histories as TrafficSchema[] || []
		const existingTraffic: TrafficSchema | undefined = trafficHistories.find((history: TrafficSchema): boolean => {
			const endpointMatch: boolean = history.endpoint === ctx.url.pathname
			const methodMatch: boolean = history.method === method
			const stillProcessing: boolean = history.processing
			const unsolved: boolean = history.status !== 'solved'

			return endpointMatch && methodMatch && (stillProcessing || unsolved)
		})

		if (existingTraffic) {
			const responseTime: string = `${(performance.now() - startTime).toFixed(2)}ms`
			const { headers, rateLimited }: SentinelData = sentinel(url.pathname, new Headers(), remoteIp, method, 102, responseTime)

			if (rateLimited) return new Response(null, { status: 429, headers })

			headers.set('location', '/api/v0/traffic-jam')

			return new Response(null, { status: 303, headers })
		} else {
			// add new traffic.
			const newTraffic: TrafficSchema = {
				request: uuidv7(),
				purpose: 'unclear',
				status: 'pending',
				remoteIp,
				endpoint: ctx.url.pathname,
				method,
				processing: true,
				timestamp: Math.trunc(Date.now() / 1000),
			}

			serverData = data({
				success: true,
				code: 102,
				type: 'request',
				message: '+OK active traffic jam found',
				data: { histories: [...trafficHistories, newTraffic] },
			})

			await SystemKv.set(['system_nvll', 'traffics', remoteIp], serverData)
		}
	}

	let response: Response

	try {
		response = await ctx.next()
	} catch (error) {
		response = new Response(`-ERR internal server error: ${error instanceof Error ? error.message : 'unknown error'}`, { status: 500 })
	}

	if (trafficJam && serverData) {
		const traffic: Deno.KvEntry<ServerDataSchema> = await SystemKv.get(['system_nvll', 'traffics', remoteIp]) as Deno.KvEntry<ServerDataSchema>
		const trafficHistories: TrafficSchema[] = traffic.value?.data?.histories as TrafficSchema[] || []
		const serverDataHistories: TrafficSchema[] = serverData?.data?.histories as TrafficSchema[] || []

		if (trafficHistories.length > 0 && serverDataHistories.length > 0) {
			const lastAddedRequest: string = serverDataHistories[serverDataHistories.length - 1].request
			const currentRequestIndex: number = trafficHistories.findIndex((history: TrafficSchema): boolean => history.request === lastAddedRequest)

			if (currentRequestIndex !== -1) {
				trafficHistories[currentRequestIndex] = {
					...trafficHistories[currentRequestIndex],
					purpose: response.headers.get('X-Purpose') || 'unclear',
					status: 'solved',
					processing: false,
				}

				const hasActiveTrafficJams: boolean = trafficHistories.some((history: TrafficSchema): boolean => history.processing)
				const updatedTrafficValue: ServerDataSchema = {
					...traffic.value,
					success: !hasActiveTrafficJams,
					code: hasActiveTrafficJams ? 102 : 200,
					message: hasActiveTrafficJams ? '+OK active traffic jam found' : '+OK no active traffic jam found',
					data: { histories: trafficHistories },
				}

				await SystemKv.set(['system_nvll', 'traffics', remoteIp], updatedTrafficValue, 24 * 60 * 60 * 1000) // expire in 24 hours
			}
		}
	}

	const responseTime: string = `${(performance.now() - startTime).toFixed(2)}ms`
	const { headers, rateLimited }: SentinelData = sentinel(url.pathname, response.headers, remoteIp, method, response.status, responseTime)

	if (rateLimited) return new Response(null, { status: 429, headers })

	headers.set('X-Response-Time', responseTime)

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	})
}
