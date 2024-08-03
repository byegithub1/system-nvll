import SystemKv from '../../helpers/database/system-kv.ts'
import Captcha from '../../components/entrance/captcha.tsx'
import captchaCreator from '../../helpers/utils/captchas/creator.ts'
import IslandSignInForm from '../../islands/entrance/sign-in/form.tsx'
import IslandSignInHeader from '../../islands/entrance/sign-in/header.tsx'

import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'
import { getCookies } from '$std/http/cookie.ts'
import { FreshContext, Handlers, PageProps } from '$fresh/server.ts'

export const handler: Handlers<AfterServerDataSchema> = {
	/**
	 * @description Asynchronously handles a GET request to retrieve captcha data and render the server data.
	 * @param {Request} request - the incoming request object
	 * @param {FreshContext} ctx - the fresh context object
	 * @return {Promise<Response>} a promise that resolves to the rendered server data
	 */
	async GET(request: Request, ctx: FreshContext): Promise<Response> {
		const cookies: Record<string, string> = getCookies(request.headers)
		const serverData: AfterServerDataSchema = cookies.data ? JSON.parse(decodeURIComponent(cookies.data)) : { success: true, code: 200 }
		const remoteIp: string = request.headers.get('X-Forwarded-For') ?? ctx.remoteAddr.hostname ?? (serverData.data?.remoteIp as string)
		const action: string = serverData.code === 404 ? '/api/v0/entrance/sign-up' : '/api/v0/entrance/sign-in'
		const newCaptcha: CaptchaSchema = await captchaCreator(remoteIp, serverData.data?.email as string, action)

		await SystemKv.set(['system_nvll', 'captchas', remoteIp], newCaptcha)

		serverData.data = { ...newCaptcha }

		return ctx.render(serverData)
	},
}

export default function SignIn({ data }: PageProps<AfterServerDataSchema>): JSX.Element {
	switch (data.code) {
		case 404:
		case 429: {
			return <Captcha props={data} />
		}
		case 202: {
			return (
				<main class='sign-in'>
					<section class='sign-in'>
						<div class='wrapper'>
							<header>
								<a href='/'>
									<img src={asset('/assets/png/nvll-no-pad.png')} alt='NVLL' />
								</a>
								<h3>{data.message}</h3>
								<p>Hello {(data.data?.email as string).split('@')[0]}, please check your inbox or spam folder.</p>
							</header>
							<form method='POST' action={`/api/v0/entrance/sign-in?resend=${data.data?.ulid}`}>
								<input type='hidden' name='email' value={data.data?.email as string} />
								<button class='button-primary' type='submit' title='Resend'>Resend</button>
							</form>
						</div>
					</section>
				</main>
			)
		}
		default: {
			return (
				<main class='sign-in'>
					<section class='sign-in'>
						<div class='wrapper'>
							<IslandSignInHeader />
							<IslandSignInForm />
						</div>
					</section>
				</main>
			)
		}
	}
}
