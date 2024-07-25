import BackButton from '../../islands/entrance/back-button.tsx'
import { JSX } from 'preact'
import { asset } from '$fresh/runtime.ts'
import IslandsCaptchForm from '../../islands/entrance/captcha-form.tsx'

interface Props {
	props: AfterServerData
}

export default function Captcha({ props }: Props): JSX.Element {
	const username = props?.data?.email ? (props.data.email as string).split('@')[0] : null

	return (
		<main class='entrance'>
			<section class='captcha'>
				<div class='wrapper'>
					<header>
						<img src={asset('/assets/png/nvll-no-pad.png')} alt='NVLL' />
						<h3>Proof of Work CAPTCHA | SIGN UP</h3>
						<p>Hello {username}, We apologize for this.</p>
						<p>To minimize spam accounts, you must complete the proof of work challenge.</p>
						<p>Your browser does all the work in the background. The solution will be automatically entered once found.</p>
					</header>
					<IslandsCaptchForm props={props} />
					<div class='back-wrapper'>
						<BackButton />
					</div>
				</div>
			</section>
		</main>
	)
}
