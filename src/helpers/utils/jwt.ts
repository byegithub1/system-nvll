import SystemKv from './db.ts'

import { FreshContext } from '$fresh/server.ts'
import { create, getNumericDate, Header, verify } from 'djwt'

const JWT_CONFIG: Record<string, unknown> = {
	algorithm: 'HS512' as AlgorithmIdentifier,
	audience: 'whatever' as const,
	issuer: 'system-nvll' as const,
}

let cachedHmacKey: CryptoKey | null = null

/**
 * @description Asynchronously reads the HMAC key file from disk and caches the result.
 * @param {string} system_id The system id.
 * @returns {Promise<CryptoKey>} A Promise that resolves to a CryptoKey object representing the HMAC key.
 */
export async function hmacKey(system_id: string): Promise<CryptoKey> {
	if (cachedHmacKey) return cachedHmacKey

	const system: Deno.KvEntryMaybe<unknown> = await SystemKv.get(['system_nvll', 'systems', system_id])
	const data: SystemSchema = system.value as SystemSchema
	const keyBuffer: ArrayBuffer = new TextEncoder().encode(data.keys.hmac).buffer

	cachedHmacKey = await crypto.subtle.importKey(
		'raw',
		keyBuffer,
		{ name: 'HMAC', hash: 'SHA-512' } as KeyAlgorithm,
		false,
		['sign'] as KeyUsage[],
	)

	return cachedHmacKey
}

/**
 * @description Generates a JSON Web Token (JWT) for the given payload.
 * @param {string} system_id The system id. (string)
 * @param {Partial<JwtToken>} payload A partial implementation of the `JwtToken` interface. (Partial<JwtToken>)
 * @param {number} expiresIn The number of seconds until the JWT expires. (number, optional, default: 60)
 * @returns {Promise<string>} A string representing the generated JWT. (Promise<string>)
 */
export async function newToken(system_id: string, payload: Partial<JwtToken>, expiresIn: number = 60): Promise<string> {
	const exp: number = getNumericDate(expiresIn * 60)
	const key: CryptoKey = await hmacKey(system_id) as CryptoKey
	return await create(
		{ alg: JWT_CONFIG.algorithm, typ: 'JWT' } as Header,
		{ ...payload, exp, aud: JWT_CONFIG.audience as string, iss: JWT_CONFIG.issuer as string } as JwtToken,
		key,
	) as string
}

/**
 * @description Decodes a JSON Web Token (JWT) using the cached HMAC key.
 * @param {string} system_id The system id.
 * @param {JwtToken} token The JWT to decode.
 * @returns {Promise<JwtToken | Error>} The decoded JWT payload, or an error if the token is invalid or expired.
 */
export async function decodeToken(system_id: string, token: string): Promise<JwtToken | Error> {
	try {
		return (await verify(token, await hmacKey(system_id) as CryptoKey, { audience: JWT_CONFIG.audience as string })) as JwtToken
	} catch (error) {
		return error instanceof Error && error.message.includes('expired') ? new Error('-ERR token expired') : new Error('-ERR invalid token')
	}
}

/**
 * @description Verifies a JSON Web Token (JWT) in the Authorization header and returns the decoded payload if valid.
 * @param {Request} request - The incoming request.
 * @param {FreshContext} ctx - The Fresh context.
 * @returns {Promise<Response | undefined} A Promise that resolves to a Response if the token is invalid or expired, or undefined if the token is valid.
 */
export async function verifyToken(request: Request, ctx: FreshContext): Promise<Response | undefined> {
	const app: SystemState['context'] = ctx.state.context as SystemState['context']

	try {
		const token: string | undefined = request.headers.get('Authorization')?.split(' ')[1]
		if (!token) {
			return new Response(JSON.stringify({ error: '-ERR token not found' }), { status: 401 })
		}

		const decodedToken: JwtToken | Error = await decodeToken(app.system_id, token)
		if (decodedToken instanceof Error) {
			return new Response(JSON.stringify({ error: decodedToken.message }), { status: 401 })
		}

		const { email, authType } = decodedToken as JwtToken
		if (authType !== 'access') {
			return new Response(JSON.stringify({ error: '-ERR invalid token type' }), { status: 401 })
		}

		const user: Deno.KvEntryMaybe<unknown> = await SystemKv.get(['system_nvll', 'users', email])
		if (!user.value) {
			return new Response(JSON.stringify({ error: '-ERR forbidden access' }), { status: 403 })
		}

		ctx.state.user = user
		return await ctx.next()
	} catch (_error) {
		return new Response(JSON.stringify({ error: '-ERR internal server error' }), { status: 500 })
	}
}
