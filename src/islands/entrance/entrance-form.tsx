import IslandPasswordInput from './password-input.tsx'
import OceansEntranceForm from '../../oceans/entrance/entrance-form.tsx'

import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'
import { useSignal } from '@preact/signals'
import { SafeParseReturnType, z } from 'zod'
import { useCallback, useEffect, useState } from 'preact/hooks'

interface Props {
	props: AfterServerDataSchema
}

interface Input {
	value: string
	message: string
}

export default function IslandEntranceForm({ props }: Props): JSX.Element {
	const [mounted, setMounted] = useState<boolean>(false)
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [remembered, setRemembered] = useState<boolean>(false)
	const [submitted, setSubmitted] = useState<boolean>(false)

	const email = useSignal<Input>({ value: '', message: '' })
	const password = useSignal<Input>({ value: '', message: '' })

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
				message: `-ERR ${JSON.parse(emailTest.error.message)[0]?.message.toLowerCase()}`,
			}
		}

		if (!regex.test(password.value.value)) {
			return password.value = {
				value: password.value.value,
				message: '-ERR password not accepted',
			}
		}

		setSubmitted(true)

		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send('Uncomplicate JavaScript')
		} else {
			console.error('-ERR ws error:', socket?.readyState)
		}
	}, [socket])

	return mounted
		? (
			<form onSubmit={submitHandler}>
				<div class='wrapper'>
					<div class='email-wrapper'>
						<label htmlFor='email'>
							Email or IM address {email.value.message && <span class='error'>{email.value.message}</span>}
						</label>
						<div class='relative'>
							<input
								type='email'
								id='email'
								name='email'
								placeholder='username@nvll.me'
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
					</div>

					<IslandPasswordInput password={password} />

					<div class='remembered-wrapper'>
						<header>
							<input
								id='remember-me-checkbox'
								aria-describedby='remember-me-checkbox-text'
								type='checkbox'
								value=''
								checked={remembered}
								onChange={(event) => setRemembered(event.currentTarget.checked)}
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
							: 'SIGN'}
					</button>

					<div class='divider-text'>Recovery</div>
					<a href='/entrance/recovery'>
						<button class='button-primary' title='Forgot email or password?'>Forgot email or password?</button>
					</a>
				</div>
			</form>
		)
		: (
			<noscript>
				<OceansEntranceForm props={props} />
			</noscript>
		)
}
