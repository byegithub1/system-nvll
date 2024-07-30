import { Payload } from 'djwt'
import { FreshContext } from '$fresh/server.ts'
import { AppContext } from './src/routes/_middleware.ts'

declare global {
	interface SystemState {
		context: AppContext
	}

	interface SentinelData {
		headers: Headers
		rateLimited: boolean
	}

	interface MiddlewareStaticProps {
		response: Response
		pathname: string
		remoteIp: string
		method: string
		startTime: number
	}

	interface MiddlewareRouteProps {
		request: Request
		ctx: FreshContext<SystemState>
		url: URL
		remoteIp: string
		startTime: number
	}

	interface HttpPayload {
		[key: string]: unknown
	}

	interface JwtToken extends Payload {
		email: string
		authType: string
		exp: number
		aud: string
		iss: string
	}

	interface CaptchaWorkerData {
		challenge: string
		difficulty: number
		timestamp: number
		nonce: string
		hash?: string
	}

	type TxEmailTemplateData = Record<string, unknown>

	type Schemas = ServerDataSchema | SystemSchema | TrafficSchema | UserSchema | CaptchaSchema

	interface ServerDataSchema {
		success: boolean
		code: number
		type: string
		message: string
		data?: Record<string, unknown>
		errors?: {
			[key: string]: {
				issue: string
				value: unknown
			}
		}
		feedback?: string
	}

	interface AfterServerDataSchema {
		success: boolean
		code: number
		type?: string
		message?: string
		data?: Record<string, unknown>
		errors?: {
			[key: string]: {
				issue: string
				value: unknown
			}
		}
		feedback?: string
	}

	interface SystemSchema {
		ulid: string
		keys: {
			hmac: string
		}
	}

	interface TrafficSchema {
		request: string
		purpose: string
		status: string
		remoteIp: string
		endpoint: string
		method: string
		processing: boolean
		timestamp: number
	}

	interface UserSchema {
		ulid: string
		username: string
		email: string
		im_address: string
		scram_sha256: {
			s: string
			p: string
			i: number
			b: number
			reservation: {
				rsv: string
				created_at: number
			}
		}
		messages: {
			im: {
				inbox: Array<{ id: number; data: string; uidl: string }>
				trash: Array<{ id: number; data: string; uidl: string }>
				error_count: number
				consecutive_success_count: number
			}
		}
		is_active: boolean
		access_token: string
		refresh_token: string
		remoteIp: string
		created_at: number
		updated_at: number
	}

	interface CaptchaSchema {
		ulid: string
		remoteIp: string
		email: string
		captcha: boolean
		action: string
		difficulty: {
			signIn: number
			signUp: number
		}
		challenge: string
		attempts: number
		timestamp: number
		result?: string
	}
}
