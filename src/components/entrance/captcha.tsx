import IslandsCaptchForm from '../../islands/entrance/captcha-form.tsx'

import { JSX } from 'preact'
import { asset } from '$fresh/runtime.ts'

interface Props {
	props: AfterServerDataSchema
}

export default function Captcha({ props }: Props): JSX.Element {
	const username: string | null = props?.data?.email ? (props.data.email as string).split('@')[0] : null

	return (
		<main class='entrance'>
			<section class='captcha'>
				<div class='wrapper'>
					<header>
						<img src={asset('/assets/png/nvll-no-pad.png')} alt='NVLL' />
						<h3>Proof of Work CAPTCHA | SIGN {props.code === 404 ? 'UP' : 'IN'}</h3>
						<p>Hello {username}, we apologize for this.</p>
						{props.code === 404
							? (
								<p>
									To minimize the number of accounts created for spam. You must complete the proof of work challenge.
									<br />
									<br />
									<span>
										Your browser does all the work in the background. Once a solution is found, it will automatically be entered into
										the text input below.
									</span>
								</p>
							)
							: (
								<p>
									We know you're human and we're not limiting you, we're just giving you traffic lights. It's likely you've done this
									before so you're asked to complete this challenge.
								</p>
							)}
					</header>
					<IslandsCaptchForm props={props} />
				</div>
			</section>
		</main>
	)
}
