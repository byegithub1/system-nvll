import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'

export default function Footer(): JSX.Element {
	return (
		<footer class='footer'>
			<img class='logo' src={asset('/assets/svg/nvll-no-pad.svg')} alt='System NVLL' loading='lazy' />

			<ul class='nav'>
				<li>
					<a href='#services'>Services</a>
				</li>
				<li>
					<a href='#support'>Support</a>
				</li>
			</ul>

			<div class='eth-address' role='alert'>
				<a href='https://explorer.zksync.io/address/0x0000047189d70937321EEc75E5F222A0F4000094' target='_blank' rel='noopener noreferrer nofollow'>
					<img src={asset('/assets/svg/info-white.svg')} alt='Info' loading='lazy' />
					<span class='sr-only'>Info</span>
					<div>
						<span>ETH Ethereum (ERC20):&nbsp;</span>
						0x0000047189d70937321EEc75E5F222A0F4000094
					</div>
				</a>
			</div>

			<ul class='social'>
				<li class='github'>
					<a href='https://github.com/rvnrstnsyh/system-nvll' target='_blank' rel='noopener noreferrer nofollow'>
						<img src={asset('/assets/svg/github.svg')} alt='GitHub' loading='lazy' />
					</a>
				</li>
				<li class='email'>
					<a href='mailto:re@nvll.me'>
						<img src={asset('/assets/svg/email-at.svg')} alt='Email' loading='lazy' />
					</a>
				</li>
			</ul>
		</footer>
	)
}
