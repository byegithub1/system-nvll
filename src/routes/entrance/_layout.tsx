import NoScriptAlert from '../../components/noscript-alert.tsx'

import { JSX } from 'preact'
import { PageProps } from '$fresh/server.ts'

export default function Layout({ Component }: PageProps): JSX.Element {
	return (
		<section class='page-container'>
			<NoScriptAlert />
			<div class='content-wrapper'>
				<Component />
			</div>
			<div class='container-image-overlay'></div>
		</section>
	)
}
