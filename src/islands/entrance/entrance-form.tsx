import OceansEntranceForm from '../../oceans/entrance/entrance-form.tsx'
import { JSX } from 'preact'
import { asset } from '$fresh/runtime.ts'
import { useCallback, useEffect, useState } from 'preact/hooks'

interface Props {
	props: AfterServerData
}

export default function IslandsEntranceForm({ props }: Props): JSX.Element {
	const [mounted, setMounted] = useState(false)
	const [socket, setSocket] = useState<WebSocket | null>(null)

	useEffect(() => {
		const protocol: string = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
		const client: WebSocket = new WebSocket(`${protocol}//${window.location.host}`)

		client.onopen = () => console.log('+OK ws opened')
		client.onmessage = (event: MessageEvent<string>) => {
			const payload = JSON.parse(event.data)
			if (payload.connection && payload.status) {
				console.log(payload.connection)
			}
		}
		client.onclose = (_event: Event) => console.log('+OK ws closed')
		client.onerror = (event: Event) => console.error('-ERR ws error:', event)

		setSocket(client)
		setMounted(true)

		return () => {
			console.log('+OK ws cleanup connection')
			client.close()
		}
	}, [])

	const _sendMessage = useCallback(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send('Uncomplicate JavaScript')
		} else {
			console.error('-ERR ws error:', socket?.readyState)
		}
	}, [socket])

	return mounted
		? (
			<>
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
						<button class='button-primary' type='submit' title='Continue with Email'>
							Continue with Email
						</button>
					</div>
				</form>
				<div class='divider-text'>OR</div>
				<a href='/entrance/scram'>
					<button class='button-primary' title='Use a Password (Advanced)'>Use a Password (Advanced)</button>
				</a>
			</>
		)
		: (
			<noscript>
				<OceansEntranceForm props={props} />
			</noscript>
		)
}
