import { JSX } from 'preact'
import { asset } from '$fresh/runtime.ts'

export default function Services(): JSX.Element {
	return (
		<section class='services' id='services'>
			<div class='service-one'>
				<div class='content'>
					<p>System / Services / OTC</p>
					<h3>One Time Conversation</h3>
					<p>Improve the way you communicate peer-to-peer using proper privacy and security.</p>

					<ul class='list'>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>No need to register</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>Completely unknown</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>Real time online</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>End-to-end encryption</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>ECDH Curve25519</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>Secure Web Socket</p>
						</li>
					</ul>
				</div>

				<div class='image'>
					<img class='z otc' src={asset('/assets/gif/2keyencryption_v5-infinite-optimized.gif')} alt='Key Encryption' loading='lazy' />

					<div class='arrow left'>
						<img src={asset('/assets/svg/arrow-vertical.svg')} alt='Arrow Vertical' loading='lazy' />
					</div>

					<div class='arrow bottom'>
						<img src={asset('/assets/svg/arrow-horizontal.svg')} alt='Arrow Horizontal' loading='lazy' />
					</div>
				</div>
			</div>

			<div class='discover'>
				<p>Services</p>
			</div>

			<div class='service-two'>
				<div class='image'>
					<img class='z im' src={asset('/assets/gif/email-one-optimized.gif')} alt='Email' loading='lazy' />

					<div class='arrow top'>
						<img src={asset('/assets/svg/arrow-horizontal.svg')} alt='Arrow Horizontal' loading='lazy' />
					</div>

					<div class='arrow right'>
						<img src={asset('/assets/svg/arrow-vertical.svg')} alt='Arrow Vertical' loading='lazy' />
					</div>
				</div>

				<div class='content'>
					<p>System / Services / IM</p>
					<h3>Internal Messenger</h3>
					<p>Feel the taste of the most delicious Japense drinks here.</p>

					<ul class='list'>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>Authenticated</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>Completely unknown</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>Email based</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>POP3/SMTP TLS 1.3</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>Integrated with API</p>
						</li>
						<li>
							<div class='icon'>
								<img src={asset('/assets/svg/check.svg')} alt='Check' loading='lazy' />
							</div>
							<p>NVLL bridge</p>
						</li>
					</ul>
				</div>
			</div>
		</section>
	)
}
