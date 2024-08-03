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

			{mounted && (
				<ol class='flex items-center w-full text-sm font-medium text-center text-gray-500'>
					<li class='flex items-center text-blue-600 whitespace-nowrap'>
						<span class="flex items-center after:content-['/'] after:mx-2 after:text-gray-200">
							<svg
								class='w-3.5 h-3.5 me-1.5 sm:me-2.5'
								aria-hidden='true'
								xmlns='http://www.w3.org/2000/svg'
								fill='currentColor'
								viewBox='0 0 20 20'
							>
								<path d='M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z' />
							</svg>
							Account Setup
						</span>
					</li>
					<li class='flex items-center whitespace-nowrap'>
						<span class="flex items-center after:content-['/'] after:mx-2 after:text-gray-200">
							<span class='me-1.5 sm:me-2.5'>2</span>
							Captcha Challenge
						</span>
					</li>
					<li class='flex items-center whitespace-nowrap'>
						<span class='flex items-center'>
							<span class='me-1.5 sm:me-2.5'>3</span>
							Verification
						</span>
					</li>
				</ol>
			)}

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
