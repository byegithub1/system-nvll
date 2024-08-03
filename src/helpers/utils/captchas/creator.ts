import SystemKv, { ulid } from '../../database/system-kv.ts'

import { encodeBase64Url } from '$std/encoding/base64url.ts'

interface CaptchaBaseSchema {
	ulid: string
	email: string
	challenge: string
	timestamp: number
}

const DEFAULT_DIFFICULTY: CaptchaSchema['difficulty'] = { signIn: 4, signUp: 5 }
const DEFAULT_RESET_TIME: number = 60 * 60 // 60 minutes in seconds

/**
 * @description Creates a new captcha for the given remote IP and email address.
 * @param {string} remoteIp - The IP address of the remote client.
 * @param {string} email - The email address associated with the captcha.
 * @param {string} [action='/api/v0/entrance/sign-in'] - The action associated with the captcha.
 * @return {Promise<CaptchaSchema>} A promise that resolves to the created captcha.
 */
export default async function creator(remoteIp: string, email: string, action: string = '/api/v0/entrance/sign-in'): Promise<CaptchaSchema> {
	const history = await SystemKv.get(['system_nvll', 'captchas', remoteIp]) as Deno.KvEntryMaybe<CaptchaSchema>
	const captchaBaseData: CaptchaBaseSchema = {
		ulid: ulid(),
		email,
		challenge: encodeBase64Url(crypto.getRandomValues(new Uint8Array(24))),
		timestamp: Math.trunc(Date.now() / 1000),
	}

	return {
		...(history.value ?? { remoteIp, captcha: true, attempts: 1 }),
		...captchaBaseData,
		action,
		difficulty: !history.value || captchaBaseData.timestamp - history.value.timestamp > DEFAULT_RESET_TIME
			? DEFAULT_DIFFICULTY
			: history.value.difficulty,
	}
}
