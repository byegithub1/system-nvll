import { JSX } from 'preact'

export default function Newsletter(): JSX.Element {
	return (
		<section class='newsletter' id='newsletter'>
			<h2>
				<span>Announcements Straight</span>
				<br />
				<span>To Your Inbox</span>
			</h2>
			<h3>Subscribe to the Systems NVLL newsletter</h3>

			<form>
				<input type='email' id='email' name='email' placeholder='Enter your email address' required autoComplete='on' />
				<button type='submit'>Subscribe</button>
			</form>
		</section>
	)
}
