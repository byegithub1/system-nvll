/**
 * @description Wraps the provided data into a ServerData object.
 * @param params - The data to be wrapped.
 * @returns A ServerData object with the provided data and default values for missing properties.
 */
export default function data(params: Partial<ServerData>): ServerData {
	const data: ServerData = {
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
