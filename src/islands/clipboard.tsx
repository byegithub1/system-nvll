import { JSX } from 'preact'
import { useState } from 'preact/hooks'
import { asset, IS_BROWSER } from '$fresh/runtime.ts'

export default function Clipboard(props: { content: string }): JSX.Element {
	const [copied, setCopied] = useState(false)
	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(props.content)
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 1500)
			})
			.catch((error) => console.error('Failed to copy text: ', error.message))
	}

	return IS_BROWSER
		? (
			<button type='button' onClick={handleCopyToClipboard}>
				<img class={copied ? 'hidden' : 'block'} src={asset('/assets/svg/copy.svg')} alt='Copy' loading='lazy' />
				<img class={copied ? 'block' : 'hidden'} src={asset('/assets/svg/copy-check.svg')} alt='Copy Check' loading='lazy' />
			</button>
		)
		: (
			<noscript>
				<button disabled>
					<img src={asset('/assets/svg/copy.svg')} alt='Copy' />
				</button>
			</noscript>
		)
}
