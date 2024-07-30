import SystemKv from '../../database/system-kv.ts'

import { data } from '../responses.ts'
import { encodeHex } from '$std/encoding/hex.ts'

interface CaptchaSolution {
	valid: boolean
	hash?: string
}

/**
 * @description Validates a captcha request by checking if a stored captcha exists for the given IP address.
 * If a stored captcha is found, it checks if a captcha solution is required based on the user's status.
 * If a captcha solution is required, it verifies the provided solution.
 * If the solution is valid, it updates the stored captcha with the new difficulty and attempts.
 * If the solution is invalid, it returns an error response.
 * @param {string} system_id - The system ID used to hash the email.
 * @param {ServerData} payload - The server data containing the captcha request.
 * @return {Promise<ServerData>} The server data response containing the validation result.
 */
export default async function validator(system_id: string, payload: ServerData): Promise<ServerData> {
	const request: CaptchaSchema = payload.data as unknown as CaptchaSchema
	const emailHash: string = encodeHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${system_id}:${request.email}`)))
	const [user, storedCaptcha] = await Promise.all([
		SystemKv.get(['system_nvll', 'users', emailHash]),
		SystemKv.get(['system_nvll', 'captchas', request.remoteIp]),
	])

	if (!storedCaptcha.value) {
		return data({
			...payload,
			success: false,
			code: 400,
			message: '-ERR no stored captcha found',
			errors: { captcha: { issue: 'no stored captcha found', value: request.remoteIp } },
		})
	}

	const calculatedData: CaptchaSchema = { ...(storedCaptcha.value as CaptchaSchema), ...request }
	const requiredCaptcha = !user.value || (user.value && calculatedData.attempts !== 0 && calculatedData.attempts % 2 === 0)

	if (requiredCaptcha && (!calculatedData.captcha || !calculatedData.result)) {
		return data({
			...payload,
			success: false,
			code: user.value ? 429 : 404,
			message: '-ERR captcha required',
			errors: { email: { issue: 'captcha required', value: request.email } },
			data: { ...calculatedData, captcha: true },
		})
	}

	if (!requiredCaptcha) {
		calculatedData.attempts = (calculatedData.attempts || 0) + 1
		await SystemKv.set(['system_nvll', 'captchas', calculatedData.remoteIp], calculatedData)
		return data({
			...payload,
			success: true,
			data: { ...calculatedData, captcha: false },
		})
	}

	const solution: CaptchaSolution = await verifySolution(request.result as string, calculatedData)

	if (!solution.valid) {
		return data({
			...payload,
			success: false,
			code: user.value ? 429 : 404,
			message: '-ERR invalid captcha solution',
			errors: { captcha: { issue: 'invalid captcha solution', value: request.result } },
			data: { ...calculatedData, captcha: true },
		})
	}

	calculatedData.attempts = (calculatedData.attempts || 0) + 1
	calculatedData.action === '/api/v0/entrance/sign-up'
		? calculatedData.difficulty.signUp += calculatedData.attempts % 2
		: calculatedData.difficulty.signIn += calculatedData.attempts % 2

	delete calculatedData.result

	await SystemKv.set(['system_nvll', 'captchas', calculatedData.remoteIp], calculatedData)
	return data({
		...payload,
		success: true,
		code: 202,
		message: '+OK captcha verified successfully',
		data: { ...calculatedData, captcha: false },
	})
}

/**
 * @description Verifies the solution of a captcha by comparing the expected hash with the provided hash.
 * @param {string} result - The result of the captcha solution.
 * @param {CaptchaSchema} captchaData - The captcha data containing the timestamp, challenge, difficulty, and action.
 * @return {Promise<CaptchaSolution>} A promise that resolves to a CaptchaSolution object indicating the validity of the captcha solution and the expected hash.
 */
async function verifySolution(result: string, captchaData: CaptchaSchema): Promise<CaptchaSolution> {
	if (!result) return { valid: false }

	try {
		const { timestamp, challenge, difficulty, action } = captchaData as CaptchaSchema
		const { nonce, hash }: { nonce: string; hash: string } = JSON.parse(atob(result))

		if (!timestamp || !challenge || !difficulty || !nonce || !hash) return { valid: false }

		const encoder: TextEncoder = new TextEncoder()
		const data: ArrayBuffer = encoder.encode(`${timestamp}:${challenge}${nonce}`)
		const hashBuffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', data)
		const expectedHash: string = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('')
		const currentDifficulty = action === '/api/v0/entrance/sign-up' ? difficulty.signUp : difficulty.signIn

		return { valid: expectedHash === hash && expectedHash.startsWith('0'.repeat(currentDifficulty)), hash: expectedHash }
	} catch (_error) {
		return { valid: false }
	}
}
