/**
 * @description Calculates the hash for a given CaptchaWorkerData object and returns the result in base64.
 * @param {CaptchaWorkerData} data - The CaptchaWorkerData object containing challenge, timestamp, nonce, and difficulty.
 * @returns {Promise<string>} A Promise that resolves to a base64 encoded string of the WorkerResult.
 */
async function calculateHash(data: CaptchaWorkerData): Promise<string> {
	let currentNonce: bigint = BigInt(data.nonce)
	let hashesComputed: number = 0

	const { challenge, difficulty, timestamp }: CaptchaWorkerData = data
	const targetPrefix: string = '0'.repeat(difficulty)
	const encoder: TextEncoder = new TextEncoder()
	const staticPart = encoder.encode(`${timestamp}:${challenge}`)
	const combinedArray = new Uint8Array(staticPart.length + 21)

	combinedArray.set(staticPart)

	while (true) {
		const nonceStr = currentNonce.toString()
		const noncePart = encoder.encode(nonceStr)

		combinedArray.set(noncePart, staticPart.length)

		const buffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', combinedArray.subarray(0, staticPart.length + noncePart.length))
		const hash: string = Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('')

		if (hash.startsWith(targetPrefix)) return btoa(JSON.stringify({ ...data, nonce: nonceStr, hash } as CaptchaWorkerData))

		currentNonce++
		hashesComputed++

		if (hashesComputed % 1000 === 0) {
			self.postMessage({ type: 'hashrate', hashesComputed })
			await new Promise((resolve) => setTimeout(resolve, 0))
		}
	}
}

self.addEventListener('message', async (event: MessageEvent<CaptchaWorkerData>): Promise<void> => {
	self.postMessage({ type: 'result', base64Result: await calculateHash(event.data) })
})
