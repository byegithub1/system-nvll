import Clipboard from '../../islands/clipboard.tsx'
import Quote from '../../components/landing/quote.tsx'
import Services from '../../components/landing/services.tsx'
import Newsletter from '../../components/landing/newsletter.tsx'

import { JSX } from 'preact/jsx-runtime'
import { asset } from '$fresh/runtime.ts'

export default function Home(): JSX.Element {
	return (
		<>
			<main class='landing' id='landing'>
				<div class='image'>
					<img src={asset('/assets/png/system-nvll-optimized.png')} alt='System NVLL' loading='lazy' />
					<div class='overlay'></div>
				</div>

				<div class='content'>
					<div class='content-main'>
						<div class='alert-info' role='alert'>
							<span class='font-bold'>OFFLINE</span> - Will rise to the surface when unseen.
						</div>
						<h1>System NVLL</h1>
						<h3>Non-Violable Liberty Layers</h3>
						<p class='main-description'>
							Privacy-oriented public service that emphasizes total anonymity. Perfect balance between privacy and protection that transcends
							the boundaries of liberty and counter-surveillance.
						</p>
						<div class='protocol'>
							<h3>Customized and Secure POP3/SMTP</h3>
							<p>
								Built it from scratch programmatically and also adapt similar uses to standard protocols integrated with APIs. Access the
								inbox easily with OpenSSL s_client:
							</p>
							<div class='code-block-wrapper'>
								<div class='header'>
									<div class='file-name'>
										<div class='icon-wrapper'>
											<img src={asset('/assets/svg/terminal.svg')} alt='Terminal' loading='lazy' />
										</div>
										<span>Terminal</span>
									</div>
									<div class='actions'>
										<Clipboard content='openssl s_client -connect system.nvll.me:1995 -tls1_3 -crlf -ign_eof' />
									</div>
								</div>
								<pre>openssl s_client -connect system.nvll.me:1995 -tls1_3 -crlf -ign_eof</pre>
							</div>
						</div>

						<div class='nvll-bridge'>
							<h3>Built-in Bridge</h3>
							<p>
								Encrypting and decrypting by default as messages enter and leave your computer, NVLL bridge uses a unique password that is
								different from your login password and never leaves your computer.
							</p>
							<table>
								<thead>
									<tr>
										<th scope='col'>Bytes</th>
										<th scope='col'>Date</th>
										<th scope='col'>File</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>14946</td>
										<td>2024-Jun-04</td>
										<td>
											<a href='#'>nvll-bridge-3.0.14-linux-x64</a>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div class='content-copyright'>
						<div class='content-year'>
							<h2>
								&copy;<span>{new Date().getFullYear()}</span>
							</h2>
							<p>NVLL</p>
						</div>

						<div class='author'>
							<small>
								<span>Created by&nbsp;</span>
								<a href='mailto:re@nvll.me' target='_blank' rel='noopener noreferrer nofollow'>rvnrstnsyh</a>
							</small>
						</div>
					</div>
				</div>
			</main>
			<section>
				<Quote />
				<Services />
				<Newsletter />
			</section>
		</>
	)
}
