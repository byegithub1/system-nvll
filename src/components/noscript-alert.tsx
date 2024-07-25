import { JSX } from 'preact'

export default function NoScriptAlert(): JSX.Element {
	return (
		<noscript>
			<section class='noscript-alert' id='noscript-alert'>
				<div class='wrapper'>
					<div class='content'>
						<small>
							<span>INFO</span> - Disabling JavaScript increases security but reduces user experience and functionality.
						</small>
					</div>
				</div>
			</section>
		</noscript>
	)
}
