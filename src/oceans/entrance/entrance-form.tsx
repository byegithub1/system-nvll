import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'

interface Props {
	props: AfterServerDataSchema
}

export default function OceansSignInForm({ props }: Props): JSX.Element {
	return (
		<form method='POST' action='/api/v0/entrance/sign-in'>
			<div class='wrapper'>
				<div class='email-wrapper'>
					<label htmlFor='email'>
						Email or IM address {props?.errors?.email && (
							<span class='error'>
								<span>-ERR</span> {props.errors.email.issue}
							</span>
						)}
					</label>
					<div class='relative'>
						<input
							type='email'
							id='email'
							name='email'
							placeholder='username@nvll.me'
							value={props?.errors?.email?.value as string}
							required
							autoComplete='on'
						/>
						<div class='icon-wrapper'>
							<img
								src={asset(`${props?.errors?.email ? '/assets/svg/email-red.svg' : '/assets/svg/email.svg'}`)}
								alt='Email'
								loading='lazy'
							/>
						</div>
					</div>
				</div>
				<button class='button-primary' type='submit' title={'Continue with Email'}>
					Continue with Email
				</button>
			</div>
		</form>
	)
}
