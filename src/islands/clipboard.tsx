import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'
import { useEffect, useState } from 'preact/hooks'

export default function Clipboard(props: { content: string }): JSX.Element {
	const [mounted, setMounted] = useState<boolean>(false)
	const [copied, setCopied] = useState<boolean>(false)

	/**
	 * @description Copies the content of the props to the clipboard and sets the copied state to true for 1.5 seconds.
	 * @return {void} This function does not return anything.
	 */
	const handleCopyToClipboard = (): void => {
		navigator.clipboard.writeText(props.content)
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 1500)
			})
			.catch((error) => console.error('Failed to copy text: ', error.message))
	}

	useEffect(() => {
		setMounted(true)
	}, [])

	return mounted
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
