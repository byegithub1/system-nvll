import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'

export default function Navbar(): JSX.Element {
	return (
		<section class='navbar' id='navbar'>
			<header>
				<div class='wrapper'>
					<div class='left'>
						<a href='/'>
							<img src={asset('/assets/svg/nvll-no-pad.svg')} alt='System NVLL' loading='lazy' />
							<span class='subtitle'></span>
						</a>
					</div>
					<div class='right'>
						<a href='mailto:support@nvll.me' class='support'>
							ask@nvll.me
						</a>
						<a href='/entrance/sign-in' class='entrance'>
							<button class='button-primary' type='button' title='SIGN IN'>
								SIGN IN
							</button>
						</a>
					</div>
				</div>
			</header>

			<footer>
				<div class='wrapper'>
					<ul>
						<li>
							<a href='#services'>Services</a>
						</li>
						<li>
							<a href='#'>Documents</a>
						</li>
						<li>
							<a href='#'>Community</a>
						</li>
						<li>
							<a href='#'>Contact</a>
						</li>
					</ul>
				</div>
			</footer>
		</section>
	)
}
