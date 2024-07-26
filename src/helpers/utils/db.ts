import { load } from '$std/dotenv/mod.ts'
import { monotonicFactory, ULID } from 'ulid'
import { FreshContext } from '$fresh/server.ts'

declare global {
	type Schemas = SystemSchema | UserSchema | CaptchaSchema
}

const env: Record<string, string> = await load()
const url: string | undefined = env['APP_ENV'].startsWith('dev') ? env['DENO_KV_ACCESS_URL'] : undefined
const kv: Deno.Kv = await Deno.openKv(url)
export const ulid: ULID = monotonicFactory()

export default class SystemKv {
	static id(ctx: FreshContext) {
		const context: SystemState['context'] = ctx.state.context as SystemState['context']
		return context.system_id
	}

	/**
	 * @description Asynchronously sets a value in the database using the specified key.
	 * @param {Deno.KvKey} key - The key used to set the value.
	 * @param {Schemas} value - The value to set.
	 * @returns {Promise<Deno.KvCommitResult>} - A Promise that resolves to the result of the commit operation.
	 */
	static async set(key: Deno.KvKey, value: Schemas): Promise<Deno.KvCommitResult> {
		return await kv.set(key, value)
	}

	/**
	 * @description Asynchronously retrieves a value from the database using the specified key.
	 * @param {Deno.KvKey} key - The key used to retrieve the value.
	 * @returns {Promise<Deno.KvEntryMaybe<unknown>>} - A Promise that resolves to the value associated
	 * with the specified key, or undefined if the key does not exist.
	 */
	static async get(key: Deno.KvKey): Promise<Deno.KvEntryMaybe<unknown>> {
		return await kv.get<string>(key)
	}

	/**
	 * @description Asynchronously lists all keys in the database with the specified prefix.
	 * @param {string[]} prefix - The prefix used to filter the keys.
	 * @returns {Deno.KvListIterator<string>} - A Promise that resolves to an iterator of strings,
	 * where each string is a key in the database that matches the specified prefix.
	 */
	static list(prefix: string[]): Deno.KvListIterator<string> {
		return kv.list<string>({ prefix })
	}

	/**
	 * @description Asynchronously deletes a value from the database using the specified key.
	 * @param {Deno.KvKey} key - The key used to delete the value.
	 * @returns {Promise<void>} - A Promise that resolves once the deletion operation is complete.
	 */
	static async del(key: Deno.KvKey): Promise<void> {
		return await kv.delete(key)
	}
}
