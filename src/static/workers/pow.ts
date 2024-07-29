interface HashRateMessage {
	type: 'hashrate'
	hashesComputed: number
}

interface ResultMessage {
	type: 'result'
	base64Result: string
}

/**
 * @description Calculates the hash of a given CaptchaWorkerData object using the SHA-256 algorithm.
 * @param {CaptchaWorkerData} data - The CaptchaWorkerData object containing the challenge, timestamp, nonce, and difficulty.
 * @return {Promise<string>} A promise that resolves to a base64-encoded JSON string containing the original data, nonce, and hash.
 */
async function calculateHash(data: CaptchaWorkerData): Promise<string> {
	let currentNonce: bigint = BigInt(data.nonce)
	let hashesComputed: number = 0

	const { challenge, difficulty, timestamp } = data
	const targetPrefix: string = '0'.repeat(difficulty)
	const encoder: TextEncoder = new TextEncoder()
	const staticPart: Uint8Array = encoder.encode(`${timestamp}:${challenge}`)
	const combinedArray: Uint8Array = new Uint8Array(staticPart.length + 21)

	combinedArray.set(staticPart)

	const hashBuffer: Uint8Array = new Uint8Array(32)
	const hexChars: string = '0123456789abcdef'
	const hashResult: Uint8Array = new Uint8Array(64)

	while (true) {
		const nonceStr: string = currentNonce.toString()
		const noncePart: Uint8Array = encoder.encode(nonceStr)

		combinedArray.set(noncePart, staticPart.length)

		await crypto.subtle.digest('SHA-256', combinedArray.subarray(0, staticPart.length + noncePart.length))
			.then((arrayBuffer: ArrayBuffer) => {
				hashBuffer.set(new Uint8Array(arrayBuffer))
				for (let i: number = 0; i < 32; i++) {
					const byte: number = hashBuffer[i]
					hashResult[i * 2] = hexChars.charCodeAt(byte >> 4)
					hashResult[i * 2 + 1] = hexChars.charCodeAt(byte & 15)
				}
			})

		if (String.fromCharCode.apply(null, hashResult.subarray(0, difficulty) as unknown as number[]) === targetPrefix) {
			return btoa(JSON.stringify({ ...data, nonce: nonceStr, hash: String.fromCharCode.apply(null, hashResult as unknown as number[]) }))
		}

		currentNonce++
		hashesComputed++

		if (hashesComputed % 1e4 === 0) {
			self.postMessage({ type: 'hashrate', hashesComputed } as HashRateMessage)
			await new Promise<void>((resolve) => setTimeout(resolve, 0))
		}
	}
}

self.addEventListener('message', async (event: MessageEvent<CaptchaWorkerData>): Promise<void> => {
	const result: string = await calculateHash(event.data)
	self.postMessage({ type: 'result', base64Result: result } as ResultMessage)
})
