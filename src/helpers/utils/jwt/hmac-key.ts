import SystemKv from '../../database/system-kv.ts'

let cachedHmacKey: CryptoKey | null = null

/**
 * @description Asynchronously reads the HMAC key file from disk and caches the result.
 * @param {string} system_id The system id.
 * @returns {Promise<CryptoKey>} A Promise that resolves to a CryptoKey object representing the HMAC key.
 */
export default async function hmacKey(system_id: string): Promise<CryptoKey> {
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
