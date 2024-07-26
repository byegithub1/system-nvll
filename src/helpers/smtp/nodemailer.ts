import Mail from 'nodemailer/lib/mailer'

import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer'

import { load } from '$std/dotenv/mod.ts'

const env: Record<string, string> = await load()

const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport({
	host: env['SMTP_HOSTNAME'] as string,
	port: env['SMTP_PORT'] as string,
	secure: env['SMTP_SECURE'] as unknown as boolean,
	auth: {
		user: env['SMTP_USER'] as string,
		pass: env['SMTP_PASSWORD'] as string,
	},
} as SentMessageInfo)

/**
 * @description Sends an email using the configured transporter.
 * @param {Mail.Options} mailOptions
 * The email options, including from, to, subject, and body.
 * @returns {Promise<boolean>}
 * A promise that resolves to a boolean indicating if the email was sent
 * successfully.
 */
const send = (mailOptions: Mail.Options): Promise<boolean> => {
	return new Promise((resolve, _reject): void => {
		transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
			if (error) {
				console.log(error)
				resolve(false)
			} else {
				console.log(info)
				resolve(true)
			}
		})
	})
}

export { send }
