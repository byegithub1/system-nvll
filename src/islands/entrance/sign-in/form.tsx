import IslandSignInPasswordInput from './password-input.tsx'

import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'
import { useSignal } from '@preact/signals'
import { SafeParseReturnType, z } from 'zod'
import { useCallback, useEffect, useState } from 'preact/hooks'

interface InputText {
	value: string
	message: string
}

interface InputCheckbox {
	value: boolean
	message: string
}

export default function IslandSignInForm(): JSX.Element {
	const [mounted, setMounted] = useState<boolean>(false)
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [submitted, setSubmitted] = useState<boolean>(false)

	const email = useSignal<InputText>({ value: '', message: '' })
	const password = useSignal<InputText>({ value: '', message: '' })
	const remember = useSignal<InputCheckbox>({ value: false, message: '' })

	useEffect(() => {
		const protocol: string = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
		const client: WebSocket = new WebSocket(`${protocol}//${window.location.host}`)

		client.onopen = (): void => console.log('+OK ws opened')
		client.onmessage = (event: MessageEvent<string>): void => {
			const payload = JSON.parse(event.data)
			if (payload.connection && payload.status) {
				console.log(payload.connection)
			}
		}
		client.onclose = (_event: Event): void => console.log('+OK ws closed')
		client.onerror = (event: Event): void => console.error('-ERR ws error:', event)

		setSocket(client)
		setMounted(true)

		return () => {
			console.log('+OK ws cleanup connection')
			client.close()
			setMounted(false)
		}
	}, [])

	const submitHandler = useCallback((event: JSX.TargetedEvent<HTMLFormElement>) => {
		event.preventDefault()

		const regex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
		const emailTest: SafeParseReturnType<string, string> = z.string().email().safeParse(email.value.value)

		if (!emailTest.success) {
			email.value = {
				value: email.value.value,
				message: `${JSON.parse(emailTest.error.message)[0]?.message.toLowerCase()}`,
			}
		}

		if (!regex.test(password.value.value)) {
			return password.value = {
				value: password.value.value,
				message: 'not accepted',
			}
		}

		setSubmitted(true)

		if (socket && socket.readyState === WebSocket.OPEN) {
			const data = {
				referrer: 'entrance',
				email: email.value.value,
				password: password.value.value,
				remember: remember.value.value,
			}
			socket.send(JSON.stringify(data))
		} else {
			console.error('-ERR ws error:', socket?.readyState)
		}
	}, [socket])

	if (!mounted) return <noscript></noscript>

	return (
		<form onSubmit={submitHandler}>
			<div class='wrapper'>
				<div class='email-wrapper'>
					<label htmlFor='email'>
						Username or IM address {email.value.message && <span class='error'>{email.value.message}</span>}
					</label>
					<div class='relative'>
						<input
							type='text'
							id='email'
							name='email'
							placeholder='e.g. chernobyl, chernobyl@nvll.me'
							value={email.value.value}
							onInput={(event) => email.value = { value: event.currentTarget.value, message: '' }}
							autoComplete='on'
						/>
						<div class='icon-wrapper'>
							<img
								src={asset(`${email.value.message ? '/assets/svg/email-red.svg' : '/assets/svg/email.svg'}`)}
								alt='Email'
								loading='lazy'
							/>
						</div>
					</div>
					<div class='input-footer'>
						<a href='/entrance/recovery/address'>Forgot address?</a>
					</div>
				</div>

				<IslandSignInPasswordInput password={password} />

				<div class='remembered-wrapper'>
					<header>
						<input
							id='remember-me-checkbox'
							aria-describedby='remember-me-checkbox-text'
							type='checkbox'
							checked={remember.value.value as boolean}
							onChange={(event) => remember.value = { value: event.currentTarget.checked, message: '' }}
						/>
					</header>
					<div class='content'>
						<label for='remember-me-checkbox'>Keep me signed in</label>
						<p id='remember-me-checkbox-text'>
							Recommended on trusted devices. <a href='#'>Why?</a>
						</p>
					</div>
				</div>

				<button class='button-primary' type='submit' title='Continue with Email' disabled={submitted}>
					{submitted
						? (
							<img
								class='button-spinner'
								src={asset('/assets/svg/button-spinner.svg')}
								alt='Email'
								loading='lazy'
							/>
						)
						: 'SIGN IN'}
				</button>

				<div class='text-center px-4 py-2'>
					<p class='text-sm'>
						New to NVLL? <a href='/entrance/sign-up'>Create account</a>
					</p>
				</div>
			</div>
		</form>
	)
}
