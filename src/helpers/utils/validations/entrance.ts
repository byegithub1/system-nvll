import { z } from 'zod'

export const schema = z.object({
	remoteIp: z.string().ip(),
	email: z.string().email(),
})

export type EntranceValidationSchema = z.infer<typeof schema>

export default schema
