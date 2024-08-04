import text from '../helpers/utils/middlewares/text.ts'
import route from '../helpers/utils/middlewares/route.ts'
import socket from '../helpers/utils/middlewares/socket.ts'
import worker from '../helpers/utils/middlewares/worker.ts'

import SystemKv, { ulid } from '../helpers/database/system-kv.ts'

import { FreshContext } from '$fresh/server.ts'
import { schnorr } from '@noble/curves/secp256k1'
import { randomBytes } from '@noble/ciphers/webcrypto'
import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils'

export class AppContext {
	public readonly system_id: string
	public pubkeys: Map<string, string> = new Map()

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
			const cache: Deno.KvEntry<SystemSchema> = await SystemKv.get(['system_nvll', 'systems', this.system_id]) as Deno.KvEntry<SystemSchema>
			console.log('+OK database established')
			if (!cache.value) {
				const newSystem: SystemSchema = {
					ulid: ulid(),
					keys: {
						hmac: bytesToHex(crypto.getRandomValues(randomBytes(32))),
						schnorr: bytesToHex(schnorr.utils.randomPrivateKey()),
					},
				}

				const system: Deno.KvCommitResult = await SystemKv.set(['system_nvll', 'systems', this.system_id], newSystem)

				if (system.ok) {
					console.log('+OK hmac sha-512 key rotated')
					console.log('+OK schnorr secp256k1 key rotated')
				}

				this.pubkeys.set('hmac', newSystem.keys.hmac)
				this.pubkeys.set('schnorr', bytesToHex(schnorr.getPublicKey(hexToBytes(newSystem.keys.schnorr))))
			} else {
				this.pubkeys.set('hmac', cache.value.keys.hmac)
				this.pubkeys.set('schnorr', bytesToHex(schnorr.getPublicKey(hexToBytes(cache.value.keys.schnorr))))
			}

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
 * @description Handles incoming requests and returns a response.
 * @param {Request} request - The incoming request object.
 * @param {FreshContext<SystemState>} ctx - The context object containing system state.
 * @return {Promise<Response>} A promise that resolves to the response object.
 */
export async function handler(request: Request, ctx: FreshContext<SystemState>): Promise<Response> {
	try {
		ctx.state.context = AppContext.newInstance()

		const url: URL = new URL(request.url)
		const remoteIp: string = request.headers.get('X-Forwarded-For') || ctx.remoteAddr.hostname
		const startTime: number = performance.now()

		// Handle 404 Not Found
		if (ctx.destination === 'notFound') return new Response('-ERR 404 not found', { status: 404 })

		// Handle WebSockets
		if (request.headers.get('upgrade')?.toLowerCase() === 'websocket') return socket(request)

		// Handle static files and workers
		if (ctx.destination === 'static') {
			const response: Response = await ctx.next()
			const workerPathname: boolean = url.pathname.startsWith('/workers/')
			const jsFile: boolean = url.pathname.endsWith('.js')
			const ascFile: boolean = url.pathname.endsWith('.asc')
			const txtFile: boolean = url.pathname.endsWith('.txt')

			const staticProps: MiddlewareStaticProps = {
				response,
				pathname: url.pathname,
				remoteIp,
				method: request.method,
				startTime,
			}

			if (txtFile || ascFile) return text(staticProps)
			if (workerPathname && jsFile) return worker(staticProps)

			return response
		}

		// Handle routes
		if (ctx.destination === 'route') return await route({ request, ctx, url, remoteIp, startTime } as MiddlewareRouteProps)

		// Default fallback
		return ctx.next()
	} catch (error) {
		return new Response(`-ERR internal server error: ${error.message}`, { status: 500 })
	}
}
