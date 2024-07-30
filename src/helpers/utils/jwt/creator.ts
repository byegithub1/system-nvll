import config from './config.ts'
import hmacKey from './hmac-key.ts'

import { create, getNumericDate, Header } from 'djwt'

/**
 * @description Generates a JSON Web Token (JWT) for the given payload.
 * @param {string} system_id The system id. (string)
 * @param {Partial<JwtToken>} payload A partial implementation of the `JwtToken` interface. (Partial<JwtToken>)
 * @param {number} expiresIn The number of seconds until the JWT expires. (number, optional, default: 60)
 * @returns {Promise<string>} A string representing the generated JWT. (Promise<string>)
 */
export default async function creator(system_id: string, payload: Partial<JwtToken>, expiresIn: number = 60): Promise<string> {
	const exp: number = getNumericDate(expiresIn * 60)
	const key: CryptoKey = await hmacKey(system_id) as CryptoKey
	return await create(
		{ alg: config.algorithm, typ: 'JWT' } as Header,
		{ ...payload, exp, aud: config.audience as string, iss: config.issuer as string } as JwtToken,
		key,
	) as string
}
