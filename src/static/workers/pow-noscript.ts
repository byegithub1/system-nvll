export default async function calculateHash(difficulty: number, challenge: string, timestamp: string): Promise<void> {
	let currentNonce: bigint = BigInt(0)
	let hashesComputed: number = 0

	const startTime = Date.now()
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
			const result = { difficulty, challenge, timestamp, nonce: nonceStr, hash: String.fromCharCode.apply(null, hashResult as unknown as number[]) }
			return console.log(btoa(JSON.stringify(result)))
		}

		currentNonce++
		hashesComputed++

		if (hashesComputed % 1e4 === 0) {
			const hashRate = hashesComputed / ((Date.now() - startTime) / 1e4)
			console.clear()
			console.log(`Looking for a solution, please wait... (${Math.floor(hashRate)} h/s)`)
			await new Promise<void>((resolve) => setTimeout(resolve, 0))
		}
	}
}
