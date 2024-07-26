import * as smtp from '../../smtp/nodemailer.ts'

import Mail from 'nodemailer/lib/mailer'
import createToken from './create-token.ts'

import { load } from '$std/dotenv/mod.ts'

const env: Record<string, string> = await load({ envPath: '.env', export: true })

// EmailTemplate interface with generic constraint
interface EmailTemplate<T extends TxEmailTemplateData = TxEmailTemplateData> {
	render: (data: T) => Promise<string>
	subject: string
	attachments?: Mail.Attachment[]
}

// EmailOptions interface with generic constraint
interface EmailOptions<T extends TxEmailTemplateData> {
	template: EmailTemplate<T>
	templateData: T
	to: string
	from?: string
}

/**
 * @description Sends a customized email using the provided template and data.
 * @param {string} system_id - The system id.
 * @param {UserSchema} user - The user object for whom the email is being sent.
 * @param {EmailOptions<T>} options - The options for customizing the email.
 * @returns {Promise<void>} A promise that resolves once the email is sent.
 */
export default async function sendTxEmail<T extends TxEmailTemplateData>(system_id: string, user: UserSchema, options: EmailOptions<T>): Promise<void> {
	const { template, templateData, to, from = env['SMTP_USER'] as string } = options

	// Generate access token if not provided in templateData
	if (!('token' in templateData)) {
		const { accessToken }: { accessToken: string } = await createToken(system_id, user)
		;(templateData as T & { token: string }).token = accessToken
	}

	const renderedTemplate: string = await template.render(templateData)
	const emailData: Mail.options = {
		from,
		to,
		subject: template.subject,
		html: renderedTemplate,
		attachments: template.attachments || [],
	}

	if (!env['APP_ENV'].startsWith('dev')) { if (!(await smtp.send(emailData))) throw new Error('-ERR failed to send email') }
}
