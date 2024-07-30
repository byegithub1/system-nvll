import decoder from './decoder.ts'
import SystemKv from '../../database/system-kv.ts'

import { FreshContext } from '$fresh/server.ts'

/**
 * @description Verifies a JSON Web Token (JWT) in the Authorization header and returns the decoded payload if valid.
 * @param {Request} request - The incoming request.
 * @param {FreshContext} ctx - The Fresh context.
 * @returns {Promise<Response | undefined} A Promise that resolves to a Response if the token is invalid or expired, or undefined if the token is valid.
 */
export default async function verifyToken(request: Request, ctx: FreshContext): Promise<Response | undefined> {
	const app: SystemState['context'] = ctx.state.context as SystemState['context']

	try {
		const token: string | undefined = request.headers.get('Authorization')?.split(' ')[1]
		if (!token) {
			return new Response(JSON.stringify({ error: '-ERR token not found' }), { status: 401 })
		}

		const decodedToken: JwtToken | Error = await decoder(app.system_id, token)
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
