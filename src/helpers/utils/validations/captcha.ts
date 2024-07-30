import { z } from 'zod'

export const schema = z.object({
	ulid: z.string().ulid(),
	remoteIp: z.string().ip(),
	email: z.string().email().nullish(),
	captcha: z.boolean(),
	action: z.string(),
	difficulty: z.object({
		signIn: z.number().int().positive(),
		signUp: z.number().int().positive(),
	}),
	challenge: z.string(),
	attempts: z.number().int().nonnegative(),
	timestamp: z.number().positive(),
	result: z.string().optional(),
})

export type CaptchaValidationSchema = z.infer<typeof schema>

export default schema
