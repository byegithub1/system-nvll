import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'

export default function Quote(): JSX.Element {
	return (
		<section class='quote' id='quote'>
			<div class='wrapper'>
				<h2>Unsupervised Freedom</h2>
				<blockquote>
					<img src={asset('/assets/svg/quote.svg')} alt='Quote' loading='lazy' />
					<div class='text'>
						<p>
							<em>
								Government and authoritative entities monitor our every day lives, decree laws that violate our freedom. That&apos;s why
								System NVLL offers you to live the dream where there are no prying eyes, no binding constraints, no bureaucratic red tape,
								and the liberty of choosing what you really want. - Incognite Team
							</em>
						</p>
					</div>
				</blockquote>
			</div>
		</section>
	)
}
