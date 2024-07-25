import { JSX } from 'preact'
import { asset } from '$fresh/runtime.ts'
import { useEffect, useState } from 'preact/hooks'

export default function BackButton(): JSX.Element {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	return mounted
		? (
			<button class='button-secondary' onClick={() => window.history.back()}>
				<img src={asset('/assets/svg/arrow-left.svg')} alt='Back' /> Back
			</button>
		)
		: (
			<noscript>
				<a href='/'>
					<button class='button-secondary'>
						<img src={asset('/assets/svg/arrow-left.svg')} alt='Back' /> Home
					</button>
				</a>
			</noscript>
		)
}
