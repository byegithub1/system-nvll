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

export default function IslandSignInForm(): JSX.Element {
	const [mounted, setMounted] = useState<boolean>(false)
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [submitted, setSubmitted] = useState<boolean>(false)

	const username = useSignal<InputText>({ value: '', message: '' })
	const recovery = useSignal<InputText>({ value: '', message: '' })
	const password = useSignal<InputText>({ value: '', message: '' })

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

		const usernameRegex: RegExp = /^[a-z0-9.-]+$/
		const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

		const usernameTest: SafeParseReturnType<string, string> = z.string().min(4).regex(usernameRegex).safeParse(username.value.value)
		const recoveryTest: SafeParseReturnType<string, string> = z.string().email().safeParse(recovery.value.value)
		const passwordTest: SafeParseReturnType<string, string> = z.string().regex(passwordRegex).safeParse(password.value.value)

		if (!usernameTest.success) {
			username.value = {
				value: username.value.value,
				message: `${JSON.parse(usernameTest.error.message)[0]?.message.toLowerCase()}`,
			}
		}

		if (!recoveryTest.success) {
			recovery.value = {
				value: recovery.value.value,
				message: `${JSON.parse(recoveryTest.error.message)[0]?.message.toLowerCase()}`,
			}
		}

		if (!passwordTest.success) {
			password.value = {
				value: password.value.value,
				message: `${JSON.parse(passwordTest.error.message)[0]?.message.toLowerCase()}`,
			}
			return
		}

		setSubmitted(true)

		if (socket && socket.readyState === WebSocket.OPEN) {
			const data = {
				referrer: 'entrance',
				username: username.value.value,
				recovery: recovery.value.value,
				password: password.value.value,
			}
			socket.send(JSON.stringify(data))
		} else {
			console.error('-ERR ws error:', socket?.readyState)
		}
	}, [socket, username, recovery, password])

	if (!mounted) return <noscript></noscript>

	return (
		<form onSubmit={submitHandler}>
			<div class='wrapper'>
				<div class='username-wrapper'>
					<label htmlFor='username'>
						Username (IM address) {username.value.message && <span class='error'>{username.value.message}</span>}
					</label>
					<div class='relative'>
						<input
							type='text'
							id='username'
							name='username'
							value={username.value.value}
							onInput={(event) => username.value = { value: event.currentTarget.value, message: '' }}
							autoComplete='off'
						/>
						<div class='icon-wrapper'>
							<span class={`text-sm ${username.value.message ? 'text-red-800' : 'text-gray-100'}`}>@nvll.me</span>
						</div>
					</div>
					<div class='input-footer'>
						<p>Immutable name</p>
					</div>
				</div>

				<div class='recovery-wrapper'>
					<label htmlFor='recovery'>
						Email Recovery {recovery.value.message && <span class='error'>{recovery.value.message}</span>}
					</label>
					<div class='relative'>
						<input
							type='email'
							id='recovery'
							name='recovery'
							placeholder='e.g. chernobyl@outlook.com'
							value={recovery.value.value}
							onInput={(event) => recovery.value = { value: event.currentTarget.value, message: '' }}
							autoComplete='on'
						/>
						<div class='icon-wrapper'>
							<img
								src={asset(`${recovery.value.message ? '/assets/svg/email-red.svg' : '/assets/svg/email.svg'}`)}
								alt='Email'
								loading='lazy'
							/>
						</div>
					</div>
				</div>

				<IslandSignInPasswordInput password={password} />

				<button class='button-primary' type='submit' title='SIGN UP' disabled={submitted}>
					{submitted
						? (
							<img
								class='button-spinner'
								src={asset('/assets/svg/button-spinner.svg')}
								alt='Email'
								loading='lazy'
							/>
						)
						: 'SIGN UP'}
				</button>

				<div class='text-center px-4 py-2'>
					<p class='text-sm'>
						Already have an account? <a href='/entrance/sign-in'>Sign in</a>
					</p>
				</div>
			</div>
		</form>
	)
}
