import data from './data.ts'

import { z } from 'zod'

/**
 * @description Validates the payload against the provided schema and returns a strongly typed ServerData object.
 * @param {T} schema - The Zod schema to validate against.
 * @param {HttpPayload} payload - The data to be validated.
 * @returns {ServerData} - A strongly typed ServerData object with the validation result.
 */
export function validator<T extends z.ZodTypeAny>(schema: T, payload: HttpPayload): ServerData {
	const result: z.SafeParseReturnType<T, HttpPayload> = schema.safeParse(payload)

	if (result.success) {
		return data({
			success: true,
			code: 200,
			type: 'request',
			message: '+OK all fields are valid',
			data: { ...payload, ...result.data },
		})
	} else {
		const errors: Record<string, string> = result.error.issues.reduce((acc, issue) => {
			acc[issue.path.join('.')] = issue.message
			return acc
		}, {} as Record<string, string>)

		return data({
			success: false,
			code: 400,
			type: 'error',
			message: '-ERR validation failed',
			errors,
		})
	}
}
