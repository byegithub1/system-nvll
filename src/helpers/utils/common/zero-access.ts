import saslprep from 'saslprep'

import { sha256 } from '@noble/hashes/sha256'
import { pbkdf2Async } from '@noble/hashes/pbkdf2'
import { randomBytes } from '@noble/ciphers/webcrypto'
import { encodeBase64Url } from '$std/encoding/base64url.ts'

/**
 * @description Generates Scram credentials for a given password.
 * @param {string} password - The password for the credentials.
 * @return {Promise<UserSchema['zero_access']>} The created Scram credentials.
 */
export default async function zeroAccess(password: string): Promise<UserSchema['zero_access']> {
	const timestamp: number = Math.trunc(Date.now() / 1000)
	const salt: Uint8Array = randomBytes(32)
	const normalizedPassword: string = saslprep(password)
	const iterations: number = 8192 * Math.abs(crypto.getRandomValues(new Int8Array(1))[0])
	const saltedPassword: Uint8Array = await pbkdf2Async(sha256, normalizedPassword, salt, { c: iterations, dkLen: 32 })

	return {
		s: encodeBase64Url(salt),
		p: encodeBase64Url(saltedPassword),
		i: iterations,
		b: 32,
		reservation: {
			rsv: 'created by system',
			created_at: timestamp,
		},
		updated_at: timestamp,
	} as UserSchema['zero_access']
}
