import config from './config.ts'
import hmacKey from './hmac-key.ts'

import { verify } from 'djwt'

/**
 * @description Decodes a JSON Web Token (JWT) using the cached HMAC key.
 * @param {string} system_id The system id.
 * @param {JwtToken} token The JWT to decode.
 * @returns {Promise<JwtToken | Error>} The decoded JWT payload, or an error if the token is invalid or expired.
 */
export default async function decoder(system_id: string, token: string): Promise<JwtToken | Error> {
	try {
		return (await verify(token, await hmacKey(system_id) as CryptoKey, { audience: config.audience as string })) as JwtToken
	} catch (error) {
		return error instanceof Error && error.message.includes('expired') ? new Error('-ERR token expired') : new Error('-ERR invalid token')
	}
}
