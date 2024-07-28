import OceansSignInForm from '../../oceans/entrance/sign-in-form.tsx'

import { JSX } from 'preact'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'preact/hooks'

interface Props {
	props: AfterServerData
}

interface State {
	base64Result: string
	message: string
	findingSolution: boolean
	searchTime: number
	hashrate: number
}

const initialState: State = {
	base64Result: '',
	message: '',
	findingSolution: false,
	searchTime: 0,
	hashrate: 0,
}

type Action =
	| { type: 'SET_STATE'; payload: Partial<State> }
	| { type: 'RESET' }
	| { type: 'UPDATE_HASHRATE'; payload: number }

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'SET_STATE':
			return { ...state, ...action.payload }
		case 'RESET':
			return initialState
		case 'UPDATE_HASHRATE':
			return { ...state, hashrate: action.payload }
		default:
			return state
	}
}

const useWorker = (captchaData: CaptchaSchema) => {
	const [state, dispatch] = useReducer(reducer, initialState)

	const workerRef = useRef<Worker | null>(null)
	const startTimeRef = useRef<number>(0)

	const findNonce = useCallback(() => {
		if (typeof window === 'undefined') return

		startTimeRef.current = performance.now()
		workerRef.current = new Worker(new URL('/workers/pow.js', import.meta.url).href, { type: 'module' })
		workerRef.current.postMessage({
			challenge: captchaData.challenge,
			difficulty: captchaData.action === '/api/v0/entrance/sign-up' ? captchaData.difficulty.signUp : captchaData.difficulty.signIn,
			timestamp: captchaData.timestamp,
			nonce: '0',
		})

		workerRef.current.onmessage = (event: MessageEvent) => {
			if (event.data.type === 'hashrate') {
				const currentTime: number = performance.now()
				const elapsedTime: number = currentTime - startTimeRef.current
				const hashrate: number = Math.round((event.data.hashesComputed / elapsedTime) * 1000)
				dispatch({ type: 'UPDATE_HASHRATE', payload: hashrate })
			} else if (event.data.type === 'result') {
				const endTime: number = performance.now()
				const searchTime: number = endTime - startTimeRef.current

				dispatch({
					type: 'SET_STATE',
					payload: {
						base64Result: event.data.base64Result,
						findingSolution: false,
						searchTime,
					},
				})

				if (workerRef.current) {
					workerRef.current.terminate()
					workerRef.current = null
				}
			}
		}

		dispatch({ type: 'SET_STATE', payload: { findingSolution: true, message: '' } })
	}, [captchaData])

	useEffect(() => {
		return () => {
			if (workerRef.current) {
				workerRef.current.terminate()
				workerRef.current = null
			}
		}
	}, [])

	return { state, dispatch, findNonce }
}

export default function IslandsCaptchForm({ props }: Props): JSX.Element {
	const captchaData: CaptchaSchema = useMemo(() => props?.data as unknown as CaptchaSchema || {}, [props?.data])
	const { state, dispatch, findNonce } = useWorker(captchaData)

	const handleInputChange = useCallback((event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
		dispatch({ type: 'SET_STATE', payload: { base64Result: event.currentTarget.value, message: '' } })
	}, [])

	const currentDifficulty: number = captchaData.action === '/api/v0/entrance/sign-up' ? captchaData.difficulty.signUp : captchaData.difficulty.signIn

	if (typeof window === 'undefined') {
		return (
			<noscript>
				<OceansSignInForm />
			</noscript>
		)
	}

	return (
		<form method='POST' action={captchaData.action}>
			<input type='hidden' name='captcha' value={JSON.stringify(captchaData)} />
			<div className='wrapper'>
				<div className='captcha-wrapper'>
					<label htmlFor='captcha'>
						Challenge: <span>{captchaData.timestamp}:{captchaData.challenge}</span>
					</label>
					<div className='relative'>
						<input
							type='text'
							id='captcha'
							name='result'
							placeholder={state.findingSolution
								? `Looking for a solution, please wait... (${state.hashrate} h/s)`
								: `Enter solution, difficulty level is ${currentDifficulty}`}
							value={state.base64Result}
							onChange={handleInputChange}
							autoComplete='off'
						/>
					</div>
				</div>
				{!state.base64Result && !state.findingSolution && (
					<button className='button-primary' type='button' onClick={findNonce}>
						Find Solution
					</button>
				)}
				{state.base64Result && (
					<button className='button-primary' type='submit'>
						Verify
					</button>
				)}
			</div>
		</form>
	)
}
