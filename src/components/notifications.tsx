import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'

export default function Notifications(): JSX.Element {
	return (
		<main class='notifications'>
			<section class='popup' id='popup'>
				<div class='wrapper'>
					<header>
						<div class='title'>
							<img src={asset('/assets/svg/cookie.svg')} alt='Cookie' loading='lazy' />
							<span>
								<a href='https://en.wikipedia.org/wiki/HTTP_cookie' target='_blank' rel='noopener noreferrer nofollow'>HTTP Cookie</a>{' '}
								Policy
							</span>
						</div>
					</header>
					<p>
						We use cookies for no reason.
					</p>
					<button class='button-primary' type='button' title='Understood'>
						Understood
					</button>
				</div>
			</section>
			<noscript>
				<section class='popup' id='popup'>
					<div class='wrapper'>
						<header>
							<div class='title'>
								<img src={asset('/assets/svg/noscript.svg')} alt='NoScript' loading='lazy' />
								<span>
									JavaScript Disabled
								</span>
							</div>
						</header>
						<p>
							Increases security but reduces user experience and functionality.
						</p>
						<button class='button-primary' type='button' title='Understood'>
							Understood
						</button>
					</div>
				</section>
			</noscript>
		</main>
	)
}
