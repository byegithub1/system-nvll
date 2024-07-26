import handlebars, { HelperDelegate } from 'handlebars'

import { dirname, fromFileUrl, join } from '$std/path/mod.ts'

/**
 * @description Renders the verify email template with the provided payload and returns the rendered HTML.
 * @param payload - The payload containing the data to be rendered in the template.
 * @returns A Promise that resolves to the rendered HTML as a strongly typed object.
 */
const verifyRegister = async (payload: { username: string; email: string; token: string }): Promise<string> => {
	const currentDir: string = dirname(fromFileUrl(import.meta.url))
	const templatePath: string = join(currentDir, '..', 'sign-in-tx', 'template.hbs')
	const html: string = await Deno.readTextFile(templatePath)
	const template: HelperDelegate = handlebars.compile(html)
	const url: string = `https://system.nvll.me/api/v0/user/verify/${payload.token}`

	return template({ ...payload, url })
}

export default verifyRegister
