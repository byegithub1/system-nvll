import OceansCaptchaForm from '../../oceans/entrance/captcha-form.tsx'

import { JSX } from 'preact/jsx-runtime'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'preact/hooks'

interface Props {
	props: AfterServerDataSchema
}

interface State {
	mounted: boolean
	base64Result: string
	message: string
	findingSolution: boolean
	searchTime: number
	hashrate: number
}

const initialState: State = {
	mounted: false,
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
	const [state, dispatch] = useReducer<State, Action>(reducer, initialState)

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
		dispatch({ type: 'SET_STATE', payload: { mounted: true } })
		return () => {
			if (workerRef.current) {
				workerRef.current.terminate()
				workerRef.current = null
			}
		}
	}, [])

	return { state, dispatch, findNonce }
}

export default function IslandCaptchForm({ props }: Props): JSX.Element {
	const captchaData: CaptchaSchema = useMemo<CaptchaSchema>(() => props?.data as unknown as CaptchaSchema || {}, [props?.data])
	const currentDifficulty: number = captchaData.action === '/api/v0/entrance/sign-up' ? captchaData.difficulty.signUp : captchaData.difficulty.signIn
	const { state, dispatch, findNonce } = useWorker(captchaData)
	const handleInputChange = useCallback((event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
		dispatch({ type: 'SET_STATE', payload: { base64Result: event.currentTarget.value, message: '' } })
	}, [dispatch])

	return state.mounted
		? (
			<>
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
									readOnly={state.findingSolution}
									autoComplete='off'
								/>
							</div>
						</div>
						{props.errors?.captcha && (
							<div className='alert-danger' role='alert'>
								<span className='font-bold'>-ERR</span> {props.errors.captcha.issue}
							</div>
						)}
						{!state.base64Result && !state.findingSolution && (
							<button className='button-primary' type='button' onClick={findNonce} title='Find Solution'>
								Find Solution
							</button>
						)}
						{state.base64Result && (
							<button className='button-primary' type='submit' title='Verify'>
								Verify
							</button>
						)}
					</div>
				</form>

				<div className='alert-info mt-7' role='alert'>
					<span className='font-bold'>HINT</span>&nbsp; Avoid forcing it. The difficulty level will increase each time a captcha is successfully
					validated. If no captcha is generated and solved within 60 minutes, the difficulty will reset.
				</div>
			</>
		)
		: (
			<noscript>
				<OceansCaptchaForm props={props} />
			</noscript>
		)
}
