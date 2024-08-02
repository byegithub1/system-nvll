import type { Signal } from '@preact/signals'

import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'
import { useCallback, useState } from 'preact/hooks'

interface Props {
	password: Signal<Password>
}

interface Password {
	value: string
	message: string
}

interface Requirement {
	length: boolean
	lowercase: boolean
	uppercase: boolean
	number: boolean
	special: boolean
}

interface PasswordRequirement {
	key: keyof Requirement
	text: string
}

function IslandPasswordInput({ password }: Props): JSX.Element {
	const [requirement, setRequirement] = useState<Requirement>({
		length: false,
		lowercase: false,
		uppercase: false,
		number: false,
		special: false,
	})

	const passwordRequirements: PasswordRequirement[] = [
		{ key: 'length', text: 'Minimum number of characters is 8.' },
		{ key: 'lowercase', text: 'Should contain lowercase.' },
		{ key: 'uppercase', text: 'Should contain uppercase.' },
		{ key: 'number', text: 'Should contain numbers.' },
		{ key: 'special', text: 'Should contain special characters.' },
	]

	const validatePassword = useCallback((value: string) => {
		setRequirement({
			length: value.length >= 8,
			lowercase: /[a-z]/.test(value),
			uppercase: /[A-Z]/.test(value),
			number: /\d/.test(value),
			special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
		})
		password.value = { value, message: '' }
	}, [])

	return (
		<div class='password-wrapper'>
			<label htmlFor='password'>
				Password {password.value.message && <span class='error'>{password.value.message}</span>}
			</label>
			<div class='relative'>
				<input
					type='password'
					id='password'
					name='password'
					value={password.value.value}
					onInput={(event) => validatePassword(event.currentTarget.value)}
					autoComplete='off'
				/>
				<div class='icon-wrapper'>
					<img
						src={asset(password.value.message ? '/assets/svg/key-minimalistic-red.svg' : '/assets/svg/key-minimalistic.svg')}
						alt='Password'
						loading='lazy'
					/>
				</div>
			</div>
			<ul class='requirements'>
				{passwordRequirements.map(({ key, text }) => (
					<li key={key} class={`${requirement[key] ? 'text-green-700' : 'text-red-800'}`}>
						{requirement[key]
							? <img src={asset('/assets/svg/password-check.svg')} alt='Check' />
							: <img src={asset('/assets/svg/password-uncheck.svg')} alt='Uncheck' />}
						{text}
					</li>
				))}
			</ul>
		</div>
	)
}

export default IslandPasswordInput
