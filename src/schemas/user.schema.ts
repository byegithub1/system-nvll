import { model, Schema } from 'mongoose'
import { encodeHex } from '$std/encoding/hex.ts'

/**
 *  !-- USER MODEL (schema)
 * @description user database schema.
 */
const UserSchema: Schema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		im_address: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		scram_sha256: {
			s: {
				type: String,
				required: true,
				unique: true,
			},
			p: {
				type: String,
				default: 'inactive',
			},
			i: {
				type: Number,
				required: true,
				default: 4096,
			},
			b: {
				type: Number,
				default: 32,
			},
			reservation: {
				rsv: {
					type: String,
				},
				createdAt: {
					type: Date,
				},
			},
		},
		messages: {
			im: {
				inbox: {
					type: Array,
					default: [],
				},
				trash: {
					type: Array,
					default: [],
				},
				error_count: {
					type: Number,
					default: 0,
				},
				consecutive_success_count: {
					type: Number,
					default: 0,
				},
			},
		},
		is_active: {
			type: Boolean,
			required: true,
			default: false,
		},
		access_token: {
			type: String,
			default: 'inactive',
		},
		refresh_token: {
			type: String,
			default: 'inactive',
		},
	},
	{ timestamps: true, versionKey: false },
)

/**
 *  !-- EMAIL HASHING (schema method)
 *
 * @desc hash the user's email before entering it into the database.
 * @return next
 */
UserSchema.pre<UserSchema>('save', async function (next): Promise<void> {
	if (!this.isModified('email')) return next()
	const message: string = `system-nvll-user:${this.email}`
	const buffer: Uint8Array = new TextEncoder().encode(message)
	this.email = encodeHex(await crypto.subtle.digest('SHA-256', buffer))
	next()
})

/**
 *  !-- EMAIL VERIFY (schema method)
 *
 * @desc verify user emails.
 * @return promise error | boolean
 */
UserSchema.methods.isValidEmail = async function (email: string): Promise<boolean> {
	const message: string = `system-nvll-user:${email}`
	const buffer: Uint8Array = new TextEncoder().encode(message)
	const hash: string = encodeHex(await crypto.subtle.digest('SHA-256', buffer))

	return hash === this.email
}

export default model<UserSchema>('User', UserSchema)
