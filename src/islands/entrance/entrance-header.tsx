import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'
import { useEffect, useState } from 'preact/hooks'

const popoverClasses = (): string => {
	return [
		'popover',
		'absolute',
		'z-30',
		'invisible',
		'inline-block',
		'text-sm',
		'text-gray-500',
		'transition-opacity',
		'duration-300',
		'bg-white',
		'rounded-lg',
		'shadow-lg',
		'opacity-0',
		'w-72',
	].join(' ')
}

export default function IslandEntranceHeader(): JSX.Element {
	const [mounted, setMounted] = useState<boolean>(false)
	const [popover, setPopover] = useState<boolean>(false)

	const wikiHref: string = 'https://en.wikipedia.org/wiki/Salted_Challenge_Response_Authentication_Mechanism'

	useEffect(() => {
		setMounted(true)
		setTimeout(() => setPopover(true), 500)

		return () => {
			setPopover(false)
			setMounted(false)
		}
	}, [])

	return (
		<header>
			<a href='/'>
				<img class='nvll-logo' src={asset('/assets/png/nvll-no-pad.png')} alt='NVLL' />
			</a>
			<h3 class='flex'>
				Entrance | SIGN {mounted ? 'IN/UP' : 'IN'}
				{mounted && (
					<img
						class={`information ${popover ? 'z-0 opacity-100' : '-z-10 opacity-0'}`}
						src={asset('/assets/svg/question-mark.svg')}
						alt='Information'
						data-popover-target='popover-entrance-information'
						data-popover-placement='bottom-end'
					/>
				)}
			</h3>

			{mounted && (
				<div class={popoverClasses()} data-popover id='popover-entrance-information' role='tooltip'>
					<div class='wrapper'>
						<h4>
							With&nbsp;
							<a href={wikiHref} target='_blank' rel='noopener noreferrer nofollow'>
								SCRAM SHA-256
							</a>
							&nbsp;Authentication
						</h4>
						<p>
							We do not permit the transfer of sensitive data including passwords, between clients and servers.
						</p>
						<h4>When JavaScript is Disabled (SIGN IN)</h4>
						<p>
							You can still authenticate even if JavaScript is disabled. Instead of using a password, we only ask for your email or IM
							address.
						</p>
						<p>
							We <b>never</b> store user passwords.
						</p>
					</div>
					<div data-popper-arrow></div>
				</div>
			)}

			{mounted ? <p>Enter your account details; if they aren't recognized, we'll automatically create a new account for you.</p> : (
				<noscript>
					<p>We'll send a code to your inbox. No need for passwords -- Like Harry Houdini's magic!✨</p>
				</noscript>
			)}
		</header>
	)
}
