import SystemKv from '../db.ts'
import data from '../middleware/data.ts'
import { encodeHex } from '$std/encoding/hex.ts'

interface CaptchaSolution {
	valid: boolean
	hash?: string
}

export default async function captchaPow(system_id: string, payload: ServerData): Promise<ServerData> {
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
			errors: { captcha: 'no stored captcha found' },
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
			errors: { captcha: 'captcha required' },
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
			errors: { captcha: 'invalid captcha solution' },
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

async function verifySolution(result: string, captchaData: CaptchaSchema): Promise<CaptchaSolution> {
	if (!result) return { valid: false }

	try {
		const { timestamp, challenge, difficulty, action } = captchaData
		const { nonce, hash }: { nonce: string; hash: string } = JSON.parse(atob(result))

		if (!timestamp || !challenge || !difficulty || !nonce || !hash) return { valid: false }

		const encoder = new TextEncoder()
		const data = encoder.encode(`${timestamp}:${challenge}${nonce}`)
		const hashBuffer = await crypto.subtle.digest('SHA-256', data)
		const expectedHash = Array.from(new Uint8Array(hashBuffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')

		const currentDifficulty = action === '/api/v0/entrance/sign-up' ? difficulty.signUp : difficulty.signIn
		return {
			valid: expectedHash === hash && expectedHash.startsWith('0'.repeat(currentDifficulty)),
			hash: expectedHash,
		}
	} catch (_error) {
		return { valid: false }
	}
}
