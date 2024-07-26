import handleWebSocket from '../helpers/socket/index.ts'

import SystemKv, { ulid } from '../helpers/utils/db.ts'

import { FreshContext } from '$fresh/server.ts'
import { encodeHex } from '$std/encoding/hex.ts'
import { sentinel } from '../helpers/utils/sentinel.ts'

export class AppContext {
	public readonly system_id: string

	private static instance: AppContext
	private ready: boolean = false

	/**
	 * @description Presumably this involves connecting to a database or doing some heavy computation
	 * @param {string} system_id The system id.
	 */
	private constructor(system_id: string) {
		this.system_id = system_id
	}

	/**
	 * @description Initializes the AppContext instance if it hasn't been already.
	 * @param {string} system_id The system id.
	 * @returns {Promise<AppContext>} A promise that resolves to the AppContext instance.
	 */
	public static async initialize(system_id: string): Promise<AppContext> {
		if (!AppContext.instance) {
			AppContext.instance = new AppContext(system_id)
			await AppContext.instance.setup()
		}
		return AppContext.instance
	}

	/**
	 * @description Returns the initialized AppContext instance.
	 * @throws {Error} If the AppContext instance is not initialized or not ready.
	 * @returns {AppContext} The initialized AppContext instance.
	 */
	public static newInstance(): AppContext {
		if (!AppContext.instance || !AppContext.instance.ready) throw new Error('-ERR app context is not initialized')
		return AppContext.instance
	}

	/**
	 * @description Initializes the AppContext instance.
	 * @throws {Error} If the initialization fails.
	 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
	 */
	private async setup(): Promise<void> {
		if (this.ready) return

		console.log('System NVLL initialization...')
		try {
			const system: Deno.KvCommitResult = await SystemKv.set(['system_nvll', 'systems', this.system_id], {
				ulid: ulid(),
				keys: {
					// Rotates the HMAC SHA-512 key every application start or restart.
					hmac: encodeHex(crypto.getRandomValues(new Uint8Array(64))),
				},
			} as SystemSchema)

			if (system.ok) console.log('+OK hmac sha-512 key rotated')

			console.log('+OK database established')

			await new Promise((resolve) => setTimeout(resolve, 2000))

			console.clear()
			console.log('+OK system ready')

			this.ready = true
		} catch (error) {
			console.error('-ERR', error instanceof Error ? error.message : String(error))
			throw error // Re-throw to allow caller to handle initialization failure
		} finally {
			console.log('.')
		}
	}
}

/**
 * @description Middleware for handling requests.
 * @param {Request} request - The incoming request object.
 * @param {FreshContext<SystemState>} ctx - The fresh context object with the system state.
 * @returns {Promise<Response>} - A promise that resolves to a Response object.
 */
export async function handler(request: Request, ctx: FreshContext<SystemState>): Promise<Response> {
	try {
		ctx.state.context = AppContext.newInstance()

		let response: Response

		const url: URL = new URL(request.url)
		const clientIP: string = request.headers.get('X-Forwarded-For') || ctx.remoteAddr.hostname

		// Handle 404 Not Found.
		if (ctx.destination === 'notFound') return new Response('-ERR 404 not found', { status: 404 })

		// Handle WebSockets.
		if (request.headers.get('upgrade')?.toLowerCase() === 'websocket') return handleWebSocket(request)

		const startTime: number = performance.now()

		// Handle static files.
		if (ctx.destination === 'static') {
			// Handle workers.
			if (url.pathname.startsWith('/workers/') && url.pathname.endsWith('.js')) {
				response = await ctx.next()

				const headers: Headers = new Headers(response.headers)
				const responseTime: string = `${(performance.now() - startTime).toFixed(2)}ms`
				const { headers: securedHeaders, rateLimited }: { headers: Headers; rateLimited: boolean } = sentinel(
					url.pathname,
					headers,
					clientIP,
					request.method,
					response.status,
					responseTime,
				)

				if (rateLimited) return new Response(null, { status: 429, headers: securedHeaders })

				headers.set('Content-Type', 'application/javascript' as const)
				headers.set('X-Response-Time', responseTime)

				return new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers: securedHeaders,
				})
			}
			return await ctx.next()
		}

		// Handle routes.
		if (ctx.destination !== 'route') return await ctx.next()

		response = await ctx.next()

		const responseTime: string = `${(performance.now() - startTime).toFixed(2)}ms`
		const { headers: securedHeaders, rateLimited }: { headers: Headers; rateLimited: boolean } = sentinel(
			url.pathname,
			new Headers(response.headers),
			clientIP,
			request.method,
			response.status,
			responseTime,
		)

		if (rateLimited) return new Response(null, { status: 429, headers: securedHeaders })

		securedHeaders.set('X-Response-Time', responseTime)

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: securedHeaders,
		})
	} catch (error) {
		return new Response(`-ERR internal server error: ${error.message}`, { status: 500 })
	}
}
