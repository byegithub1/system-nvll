import Notification from '../components/notifications.tsx'

import { JSX } from 'preact/jsx-runtime'
import { type PageProps } from '$fresh/server.ts'

export default function App({ Component }: PageProps): JSX.Element {
	const css: JSX.HTMLAttributes<HTMLLinkElement>[] = [
		{
			rel: 'stylesheet',
			type: 'text/css',
			href: '/index.css',
		},
		{
			rel: 'stylesheet',
			type: 'utf-8',
			href: '/assets/cdn/css/bite.min.css',
		},
	]

	const script: JSX.HTMLAttributes<HTMLScriptElement>[] = [
		{
			type: 'text/javascript',
			src: '/assets/cdn/js/bite.min.js',
		},
	]

	return (
		// <!DOCTYPE html>
		<html lang='en'>
			<head>
				<meta charset='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<title>System NVLL</title>
				<meta name='description' content='Non-Violable Liberty Layers' />
				{css.reverse().map((link) => <link {...link} />)}
			</head>
			<body>
				<Component />
				<Notification />
				{script.reverse().map((link) => <script {...link} />)}
			</body>
		</html>
	)
}
