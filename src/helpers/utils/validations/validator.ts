import { z } from 'zod'
import { data } from '../responses.ts'

/**
 * @description Validates the payload against the provided schema and returns a strongly typed ServerDataSchema object.
 * @param {T} schema - The Zod schema to validate against.
 * @param {HttpPayload} payload - The data to be validated.
 * @returns {ServerDataSchema} - A strongly typed ServerDataSchema object with the validation result.
 */
export default function validator<T extends z.ZodTypeAny>(schema: T, payload: HttpPayload): ServerDataSchema {
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
		const errors: ServerDataSchema['errors'] = result.error.issues.reduce<ServerDataSchema['errors']>((acc, issue) => {
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
