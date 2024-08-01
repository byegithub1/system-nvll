import { JSX } from 'preact/jsx-runtime'

interface Props {
	props: AfterServerDataSchema
}

export default function OceansCaptchaForm({ props }: Props): JSX.Element {
	const difficulty: CaptchaSchema['difficulty'] = props.data?.difficulty as CaptchaSchema['difficulty']
	const currentDifficulty: number = props.data?.action === '/api/v0/entrance/sign-up' ? difficulty.signUp : difficulty.signIn

	return (
		<form method='POST' action={props.data?.action as string}>
			<input type='hidden' name='captcha' value={JSON.stringify(props.data)} />
			<div className='wrapper'>
				<div className='captcha-wrapper'>
					<label htmlFor='captcha'>
						Challenge: <span>{props.data?.timestamp}:{props.data?.challenge}</span>
					</label>
					<div className='relative'>
						<input
							type='text'
							id='captcha'
							name='result'
							placeholder={`Enter solution, difficulty level is ${currentDifficulty}`}
							value={props.errors?.captcha?.value as string}
							required
							autoComplete='off'
						/>
					</div>
				</div>
				{props.errors?.captcha && (
					<div className='alert-danger' role='alert'>
						<span className='font-bold'>-ERR</span> {props.errors.captcha.issue}
					</div>
				)}
				<button className='button-primary' type='submit' title='Verify'>
					Verify
				</button>
			</div>

			<div className='alert-danger mt-7' role='alert'>
				<span className='font-bold'>WARNING</span>&nbsp; JavaScript seems to be disabled in your browser, which means web workers cannot be used.
				Please call this&nbsp;
				<a href='/workers/pow-noscript.js' target='_blank' rel='noopener noreferrer nofollow'>function</a>&nbsp;instead to find the captcha
				solution manually. You can use a JavaScript runtime like Node.js or Deno on your machine.
			</div>
			<div className='alert-info' role='alert'>
				<span className='font-bold'>HINT</span>&nbsp; Avoid forcing it. The difficulty level will increase each time a captcha is successfully
				validated. If no captcha is generated and solved within 60 minutes, the difficulty will reset.
			</div>
		</form>
	)
}
