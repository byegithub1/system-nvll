import type { Signal } from '@preact/signals'

import { useState } from 'preact/hooks'
import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'

interface Props {
	password: Signal<Input>
}

interface Input {
	value: string
	message: string
}

export default function IslandSignInPasswordInput({ password }: Props): JSX.Element {
	const [showPassword, setShowPassword] = useState<boolean>(false)

	return (
		<div class='password-wrapper'>
			<label htmlFor='password'>
				Password {password.value.message && <span class='error'>{password.value.message}</span>}
			</label>
			<div class='relative'>
				<input
					type={showPassword ? 'text' : 'password'}
					id='password'
					name='password'
					value={password.value.value}
					onInput={(event) => password.value = { value: event.currentTarget.value, message: '' }}
					autoComplete='off'
				/>
				<div class='icon-wrapper'>
					<img
						src={asset(
							showPassword
								? `/assets/svg/eye-open${password.value.message ? '-red' : ''}.svg`
								: `/assets/svg/eye-closed${password.value.message ? '-red' : ''}.svg`,
						)}
						alt='Password'
						loading='lazy'
					/>
				</div>
			</div>

			<div class='input-footer'>
				<button class='text-primary' type='button' onClick={() => setShowPassword(!showPassword)}>
					{showPassword ? 'Hide' : 'Show'}
				</button>
				<span>&nbsp;-&nbsp;</span>
				<a href='/entrance/recovery/password'>Forgot password?</a>
			</div>
		</div>
	)
}
