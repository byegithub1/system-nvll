import Navbar from '../../components/landing/navbar.tsx'
import Footer from '../../components/landing/footer.tsx'
import NoScriptAlert from '../../components/noscript-alert.tsx'

import { JSX } from 'preact'
import { PageProps } from '$fresh/server.ts'

export default function Layout({ Component }: PageProps): JSX.Element {
	return (
		<section class='page-container'>
			<NoScriptAlert />
			<Navbar />
			<div class='content-wrapper'>
				<Component />
			</div>
			<div class='container-image-overlay'></div>
			<Footer />
		</section>
	)
}
