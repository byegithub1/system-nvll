/**
 * @description Sends a server data response as a JSON object.
 * @param {ServerData} data - The server data to send as a response.
 * @returns {Response} The response object.
 */
export default function sendResponse(data: ServerData): Response {
	return Response.json(data, { status: data.code })
}
