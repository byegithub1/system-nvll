import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'
import { useEffect, useState } from 'preact/hooks'

export default function IslandSignInHeader(): JSX.Element {
	const [mounted, setMounted] = useState<boolean>(false)

	useEffect(() => {
		setMounted(true)

		return () => {
			setMounted(false)
		}
	}, [])

	return (
		<header>
			<a href='/'>
				<img class='nvll-logo' src={asset('/assets/png/nvll-no-pad.png')} alt='NVLL' />
			</a>

			{mounted
				? (
					<>
						<h3 class='flex'>Entrance | SIGN UP</h3>
						<p>To continue enter your account details</p>
					</>
				)
				: (
					<noscript>
						<div className='alert-info' role='alert'>
							<span className='font-bold'>Please enable JavaScript and reload this page to continue</span>&nbsp; We use end-to-end and
							zero-access encryption to ensure your security. Data transfer between the server and client must always be encrypted;
							client-side JavaScript is required for this process.
						</div>
					</noscript>
				)}
		</header>
	)
}
