import SystemKv from '../db.ts'
import data from '../middleware/data.ts'

declare global {
	interface CaptchaWorkerData {
		challenge: string
		difficulty: number
		timestamp: number
		nonce: string
		hash?: string
	}
}

interface CaptchaSolution {
	valid: boolean
	hash?: string
}

export default async function captchaPow(payload: ServerData): Promise<ServerData> {
	const postRequestData: ServerData = { ...payload }
	const request: CaptchaSchema = payload.data as unknown as CaptchaSchema

	const history: Deno.KvEntryMaybe<unknown> = await SystemKv.get(['system_nvll', 'captchas', request.remoteIp])
	const historyData: CaptchaSchema = history.value as CaptchaSchema

	const calculatedData: CaptchaSchema = { ...historyData, ...request }

	const signUpAction: boolean = calculatedData.action.includes('entrance/sign-up')
	const signInAction: boolean = calculatedData.action.includes('entrance/sign-in')

	const requiredCaptcha: boolean = signUpAction || (signInAction && calculatedData.attempts % 2 === 0)

	if (requiredCaptcha && (!calculatedData.captcha || !calculatedData.result)) {
		return data({
			...postRequestData,
			success: false,
			code: signUpAction ? 404 : 429,
			message: '-ERR captcha required',
			errors: { captcha: 'captcha required' },
			data: {
				...calculatedData,
				captcha: true,
			},
		})
	}

	if (!requiredCaptcha) {
		calculatedData.attempts = (calculatedData.attempts || 0) + 1
		await SystemKv.set(['system_nvll', 'captchas', request.remoteIp], calculatedData)
		return data({
			...postRequestData,
			success: true,
			data: {
				...calculatedData,
				captcha: false,
			},
		})
	}

	const solution: CaptchaSolution = await verifySolution(request.result as string, historyData)

	if (!solution.valid) {
		return data({
			...postRequestData,
			success: false,
			message: '-ERR invalid captcha solution',
			errors: { captcha: 'invalid captcha solution' },
		})
	}

	calculatedData.attempts = (calculatedData.attempts || 0) + 1
	await SystemKv.set(['system_nvll', 'captchas', request.remoteIp], calculatedData)

	return data({
		...postRequestData,
		success: true,
		code: 202,
		message: '+OK captcha verified successfully',
		data: {
			...calculatedData,
			captcha: false,
		},
	})
}

/**
 * @description Verifies a proof-of-work solution against a given challenge and history data.
 * @param {string} result - The result of the proof-of-work solution.
 * @param {CaptchaSchema} historyData - The history data containing the challenge and difficulty.
 * @return {Promise<CaptchaSolution>} A promise that resolves to an object indicating whether the solution is valid and the expected hash.
 */
async function verifySolution(result: string, historyData: CaptchaSchema): Promise<CaptchaSolution> {
	try {
		const { timestamp, challenge, difficulty }: CaptchaSchema = historyData
		const { nonce, hash }: CaptchaWorkerData = JSON.parse(atob(result as string))

		// Verify the hash
		const encoder: TextEncoder = new TextEncoder()
		const data: Uint8Array = encoder.encode(`${timestamp}:${challenge}${nonce}`)
		const hashBuffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', data)
		const expectedHash: string = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('')

		return { valid: expectedHash === hash && expectedHash.startsWith('0'.repeat(difficulty)), hash: expectedHash }
	} catch (_error) {
		return { valid: false, hash: undefined }
	}
}
