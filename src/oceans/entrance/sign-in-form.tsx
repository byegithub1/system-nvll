import { JSX } from 'preact'
import { asset } from '$fresh/runtime.ts'

export default function OceansSignInForm(): JSX.Element {
	return (
		<form method='POST' action='/api/v0/entrance/sign-in'>
			<div class='wrapper'>
				<div class='email-wrapper'>
					<label htmlFor='email'>Email or IM address</label>
					<div class='relative'>
						<input type='email' id='email' name='email' placeholder='username@nvll.me' required autoComplete='on' />
						<div class='icon-wrapper'>
							<img src={asset('/assets/svg/email.svg')} alt='Email' loading='lazy' />
						</div>
					</div>
				</div>
				<button class='button-primary' type='submit'>
					Continue with Email
				</button>
			</div>
		</form>
	)
}
