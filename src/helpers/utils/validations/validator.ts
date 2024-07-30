import { z } from 'zod'
import { data } from '../responses.ts'

/**
 * @description Validates the payload against the provided schema and returns a strongly typed ServerData object.
 * @param {T} schema - The Zod schema to validate against.
 * @param {HttpPayload} payload - The data to be validated.
 * @returns {ServerData} - A strongly typed ServerData object with the validation result.
 */
export default function validator<T extends z.ZodTypeAny>(schema: T, payload: HttpPayload): ServerData {
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
		const errors: ServerData['errors'] = result.error.issues.reduce<ServerData['errors']>((acc, issue) => {
			const fieldKey: string = issue.path.join('.')
			return {
				...acc,
				[fieldKey]: {
					issue: issue.message.toLowerCase(),
					value: payload[fieldKey],
				},
			}
		}, {})

		return data({
			success: false,
			code: 400,
			type: 'error',
			message: '-ERR validation failed',
			errors,
		})
	}
}
