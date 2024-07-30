/**
 * @description Handles WebSocket requests and upgrades the request to a WebSocket connection.
 * @param {Request} request - The incoming WebSocket request.
 * @returns {Response} A Response object representing the upgraded WebSocket connection.
 */
export default function socket(request: Request): Response {
	try {
		const { socket, response }: { socket: WebSocket; response: Response } = Deno.upgradeWebSocket(request)

		socket.onopen = () => {
			socket.send(JSON.stringify({ connection: '+OK ws established', status: true }))
		}
		socket.onmessage = (event: MessageEvent<string>): void => {
			// Handle incoming messages.
			console.log('+OK ws received message:', event.data)
		}
		socket.onclose = (_event: Event): void => {
			// Handle connection close.
		}
		socket.onerror = (event: Event): void => console.error('+ERR ws error:', event)

		return response
	} catch (error) {
		return new Response(`-ERR ws upgrade failed: ${error.message}`, { status: 400 })
	}
}
