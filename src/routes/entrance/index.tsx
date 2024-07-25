import Captcha from '../../components/entrance/captcha.tsx'
import BackButton from '../../islands/entrance/back-button.tsx'
import IslandSignInForm from '../../islands/entrance/sign-in-form.tsx'

import SystemKv, { ulid } from '../../helpers/utils/db.ts'

import { JSX } from 'preact'
import { asset } from '$fresh/runtime.ts'
import { getCookies } from '$std/http/cookie.ts'
import { encodeBase64Url } from '$std/encoding/base64url.ts'
import { FreshContext, Handlers, PageProps } from '$fresh/server.ts'

/**
 * @description Creates captcha data based on the provided remote IP, server data, and optional history data.
 * @param {string} remoteIp - The remote IP address.
 * @param {AfterServerData} serverData - The server data.
 * @param {CaptchaSchema} [historyData] - Optional history data.
 * @return {CaptchaSchema} The created captcha data.
 */
const createCaptchaData = (remoteIp: string, serverData: AfterServerData, historyData?: CaptchaSchema): CaptchaSchema => {
	return {
		ulid: historyData?.ulid || ulid(),
		remoteIp: historyData?.remoteIp || remoteIp,
		email: serverData.data?.email as string,
		captcha: !!(serverData.code === 404 || (historyData?.attempts && (historyData?.attempts as number) % 2 === 0)),
		action: serverData.code === 404 ? '/api/v0/entrance/sign-up' : '/api/v0/entrance/sign-in',
		difficulty: historyData?.difficulty || serverData.code === 404 ? 1 : 1,
		challenge: encodeBase64Url(crypto.getRandomValues(new Uint8Array(24))),
		attempts: historyData?.attempts || 1,
		timestamp: Math.floor(Date.now() / 1000),
	}
}

export const handler: Handlers<AfterServerData> = {
	/**
	 * @description Asynchronously handles a GET request.
	 * @param {Request} request - The incoming request object.
	 * @param {FreshContext} ctx - The context object for the request.
	 * @return {Promise<Response>} A promise that resolves to the response object.
	 */
	async GET(request: Request, ctx: FreshContext): Promise<Response> {
		const remoteIp: string = request.headers.get('X-Forwarded-For') || ctx.remoteAddr.hostname
		const cookies: Record<string, string> = getCookies(request.headers)
		const serverData: AfterServerData = cookies.data ? JSON.parse(decodeURIComponent(cookies.data)) : { success: true, code: 200 }

		const history: Deno.KvEntryMaybe<unknown> = await SystemKv.get(['system_nvll', 'captchas', remoteIp])
		const historyData: CaptchaSchema = history.value as CaptchaSchema
		const captchaData: CaptchaSchema = createCaptchaData(remoteIp, serverData, historyData)

		await SystemKv.set(['system_nvll', 'captchas', remoteIp], captchaData)

		serverData.data = { ...captchaData }

		return ctx.render(serverData)
	},
}

export default function Entrance({ data }: PageProps<AfterServerData>): JSX.Element {
	switch (data.code) {
		case 404:
		case 429: {
			return <Captcha props={data} />
		}
		case 202: {
			return (
				<main class='entrance'>
					<section class='login'>
						<div class='wrapper'>
							<header>
								<img src={asset('/assets/png/nvll-no-pad.png')} alt='NVLL' />
								<h3>{data.message}</h3>
								<p>Hello {(data.data?.email as string).split('@')[0]}, please check your inbox or spam folder.</p>
							</header>
							<form method='POST' action={`${data?.data?.action as string}?resend=${data.data?.ulid}`}>
								<input type='hidden' name='email' value={data.data?.email as string} />
								<button class='button-primary' type='submit'>Resend</button>
							</form>
						</div>
					</section>
				</main>
			)
		}
		default: {
			return (
				<main class='entrance'>
					<section class='login'>
						<div class='wrapper'>
							<header>
								<img src={asset('/assets/png/nvll-no-pad.png')} alt='NVLL' />
								<h3>Entrance | SIGN IN/UP</h3>
								<p>We'll send a code to your inbox. No need for passwords -- Like Harry Houdini's magic!✨</p>
							</header>
							<IslandSignInForm props={data} />
							<div class='divider-text'>OR</div>
							<a href='/entrance/scram'>
								<button class='button-primary'>Use a Password (Advanced)</button>
							</a>
							<div class='back-wrapper'>
								<BackButton />
							</div>
						</div>
					</section>
				</main>
			)
		}
	}
}
