const RATE_LIMIT = 1000
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 60 minutes
const RATE_LIMIT_METHOD_EXCLUDE = ['HEAD', 'OPTIONS']
const RATE_LIMIT_CLIENTS = new Map<string, { count: number; timestamp: number }>()

/**
 * @description Rate limiting function.
 * @param clientIP - The client's IP address.
 * @param method - The HTTP method.
 * @returns An object with a `limited` boolean indicating if the client is rate limited and a `count`
 * number indicating the number of requests the client has made in the rate limiting window.
 */
function rateLimit(clientIP: string, method: string): { limited: boolean; count: number } {
	if (RATE_LIMIT_METHOD_EXCLUDE.includes(method)) return { limited: false, count: 0 }

	const now: number = Date.now()
	const clientData: { count: number; timestamp: number } | undefined = RATE_LIMIT_CLIENTS.get(clientIP)

	if (now - (clientData?.timestamp ?? now) > RATE_LIMIT_WINDOW) {
		const newClientData: { count: number; timestamp: number } = { count: 1, timestamp: now }
		RATE_LIMIT_CLIENTS.set(clientIP, newClientData)
		return { limited: false, count: newClientData.count }
	} else {
		const updatedClientData: { count: number; timestamp: number } = { count: (clientData?.count ?? 0) + 1, timestamp: now }
		RATE_LIMIT_CLIENTS.set(clientIP, updatedClientData)
		return { limited: updatedClientData.count > RATE_LIMIT, count: updatedClientData.count }
	}
}

/**
 * @description Applies various security headers to the response headers and logs the request.
 * @param pathname - The pathname of the request.
 * @param headers - The headers of the response.
 * @param clientIP - The IP address of the client.
 * @param method - The HTTP method of the request.
 * @param status - The status code of the response.
 * @param responseTime - The response time of the request.
 * @returns An object with the updated headers and a boolean indicating if the client is rate limited.
 */
export function sentinel(
	pathname: string,
	headers: Headers,
	clientIP: string,
	method: string,
	status: number,
	responseTime: string,
): { headers: Headers; rateLimited: boolean } {
	const { limited, count }: { limited: boolean; count: number } = rateLimit(clientIP, method)

	headers.set('Access-Control-Allow-Origin', 'https://nvll.me, https://system-nvll.deno.dev' as const)
	// Prevent caching of sensitive information
	headers.set('Cache-Control', 'no-store, max-age=0' as const)
	// Clear-Site-Data (use with caution, as it clears all site data)
	// headers.set('Clear-Site-Data', '"cache", "cookies", "storage"' as const)
	// Content Security Policy (strict)
	headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; script-src-attr 'none'; upgrade-insecure-requests; base-uri 'self'; form-action 'self'; connect-src 'self' https:; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; frame-ancestors 'self'; object-src 'none';" as const,
	)
	// Cross-Origin Embedder Policy
	headers.set('Cross-Origin-Embedder-Policy', 'require-corp' as const)
	// Cross-Origin Opener Policy
	headers.set('Cross-Origin-Opener-Policy', 'same-origin' as const)
	// Cross-Origin Resource Policy
	headers.set('Cross-Origin-Resource-Policy', 'same-origin' as const)
	// Expect-CT (Certificate Transparency)
	headers.set('Expect-CT', 'max-age=86400, enforce' as const)
	headers.set('Expires', '0' as const)
	// Origin-Agent-Cluster allows web applications to isolate their origins from other processes
	headers.set('Origin-Agent-Cluster', '?1' as const)
	// Permissions Policy (formerly Feature-Policy)
	headers.set(
		'Permissions-Policy',
		'accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()' as const,
	)
	headers.set('Pragma', 'no-cache' as const)
	// Referrer Policy
	headers.set('Referrer-Policy', 'no-referrer' as const)
	// HTTP Strict Transport Security (2 years, subdomains, preload)
	headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload' as const)
	// Timing-Allow-Origin
	headers.set('Timing-Allow-Origin', 'same-origin' as const)
	// Prevent MIME type sniffing
	headers.set('X-Content-Type-Options', 'nosniff' as const)
	// X-DNS-Prefetch-Control header helps control DNS prefetching
	headers.set('X-DNS-Prefetch-Control', 'off' as const)
	// X-Download-Options header is specific to Internet Explorer 8
	headers.set('X-Download-Options', 'noopen' as const)
	// Prevent clickjacking
	headers.set('X-Frame-Options', 'SAMEORIGIN' as const)
	// X-Permitted-Cross-Domain-Policies header specifies policy for loading cross-domain content
	headers.set('X-Permitted-Cross-Domain-Policies', 'none' as const)
	// Request rate limiting
	headers.set('X-Rate-Limit', `${count}/${RATE_LIMIT}` as const)
	headers.set('X-Rate-Limit-Remaining', `${Math.max(0, RATE_LIMIT - count)}` as const)
	// XSS Protection
	headers.set('X-XSS-Protection', '1; mode=block' as const)

	headers.delete('Server' as const)
	headers.delete('X-Powered-By' as const)
	headers.delete('X-AspNet-Version' as const)
	headers.delete('X-AspNetMvc-Version' as const)

	console.log(`${new Date().toISOString()}; ${clientIP}; ${method}:${status}; ${responseTime}; protected; ${pathname}`)

	return { headers, rateLimited: limited }
}
