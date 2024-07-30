import creator from './creator.ts'

/**
 * @description Generates an access and refresh token for a given user.
 * @param {string} system_id - The system id.
 * @param {UserSchema} user - The user for whom the tokens are being generated.
 * @returns {Promise<{ accessToken: string; refreshToken: string }>} A promise that resolves
 * to an object containing the access and refresh tokens.
 */
export default async function tokenFactory(system_id: string, user: UserSchema): Promise<{ accessToken: string; refreshToken: string }> {
	return {
		accessToken: await creator(system_id, { email: user.email, authType: 'access' }, 3) as string,
		refreshToken: await creator(system_id, { email: user.email, authType: 'refresh' }, 60) as string,
	}
}
