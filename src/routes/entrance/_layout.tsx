import { JSX } from 'preact/jsx-runtime'
import { PageProps } from '$fresh/server.ts'

export default function Layout({ Component }: PageProps): JSX.Element {
	return (
		<section class='page-container'>
			<div class='content-wrapper'>
				<Component />
			</div>
			<div class='container-image-overlay'></div>
		</section>
	)
}
