import { z } from 'zod'

export const schema = z.object({
	ulid: z.string().ulid(),
	remoteIp: z.string().ip(),
	email: z.string().email().nullish(),
	captcha: z.boolean(),
	action: z.string(),
	difficulty: z.number().positive(),
	challenge: z.string(),
	attempts: z.number().positive(),
	timestamp: z.number().positive(),
	result: z.string(),
})

export type CaptchaValidationSchema = z.infer<typeof schema>

export default schema
