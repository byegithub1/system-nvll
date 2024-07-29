import handlebars, { HelperDelegate } from 'handlebars'

import { dirname, fromFileUrl, join } from '$std/path/mod.ts'

/**
 * @description Asynchronously renders the verify email template with the provided payload and returns the rendered HTML.
 * @param {Object} payload - An object containing the username, email, and token to be rendered in the template.
 * @param {string} payload.username - The username to be rendered in the template.
 * @param {string} payload.email - The email to be rendered in the template.
 * @param {string} payload.token - The token to be rendered in the template.
 * @return {Promise<string>} A Promise that resolves to the rendered HTML as a string.
 */
const render = async (payload: { username: string; email: string; token: string }): Promise<string> => {
	const currentDir: string = dirname(fromFileUrl(import.meta.url))
	const templatePath: string = join(currentDir, '..', 'sign-in-tx', 'template.hbs')
	const html: string = await Deno.readTextFile(templatePath)
	const template: HelperDelegate = handlebars.compile(html)
	const url: string = `https://system.nvll.me/api/v0/user/verify/${payload.token}`

	return template({ ...payload, url })
}

export default render
