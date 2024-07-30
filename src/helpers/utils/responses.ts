/**
 * @description Wraps the provided data into a ServerDataSchema object.
 * @param {Partial<ServerDataSchema>} params - The data to be wrapped.
 * @return {ServerDataSchema} A ServerDataSchema object with the provided data and default values for missing properties.
 */
export function data(params: Partial<ServerDataSchema>): ServerDataSchema {
	const data: ServerDataSchema = {
		success: params.success ?? false,
		code: params.code ?? 500,
		type: params.type ?? 'request',
		message: params.message ?? '',
		data: params.data,
		errors: params.errors,
		feedback: params.feedback,
	}

	return data
}

/**
 * @description Sends a server data response as a JSON object.
 * @param {ServerDataSchema} data - The server data to send as a response.
 * @returns {Response} The response object.
 */
export function json(data: ServerDataSchema): Response {
	return Response.json(data, { status: data.code })
}
