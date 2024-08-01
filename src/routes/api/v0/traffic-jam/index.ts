import SystemKv from '../../../../helpers/database/system-kv.ts'

import { FreshContext, Handlers } from '$fresh/server.ts'

export const handler: Handlers<AfterServerDataSchema> = {
	/**
	 * @description Asynchronously handles a GET request to retrieve traffic jam data.
	 * @param {Request} request - the incoming request object
	 * @param {FreshContext} ctx - the fresh context object
	 * @return {Promise<Response>} a promise that resolves to a Response object containing the traffic jam data
	 */
	async GET(request: Request, ctx: FreshContext): Promise<Response> {
		const url = new URL(request.url)

		const remoteIpQuery: string = url.searchParams.get('remoteIp') as string
		const activeQuery: boolean = url.searchParams.get('active') === 'true'
		const historyQuery: boolean = url.searchParams.get('history') === 'true'

		const remoteIp: string = remoteIpQuery || request.headers.get('X-Forwarded-For') || ctx.remoteAddr.hostname
		const traffic = await SystemKv.get(['system_nvll', 'traffics', remoteIp]) as Deno.KvEntry<AfterServerDataSchema>

		const serverData: AfterServerDataSchema = {
			success: true,
			code: 200,
			type: 'request',
			message: '+OK no active traffic jam found',
			data: {
				actives: [],
				histories: [],
			},
		}

		if (traffic && traffic.value && traffic.value.data?.histories) {
			const trafficHistories: TrafficSchema[] = traffic.value.data.histories as TrafficSchema[]

			if (activeQuery && historyQuery) {
				Object.assign(serverData, {
					data: {
						actives: trafficHistories.filter((history: TrafficSchema) => history.processing),
						histories: trafficHistories.filter((history: TrafficSchema) => !history.processing),
					},
				})
			} else if (activeQuery) {
				Object.assign(serverData, { data: { actives: trafficHistories.filter((history: TrafficSchema) => history.processing) } })
			} else if (historyQuery) {
				Object.assign(serverData, { data: { histories: trafficHistories.filter((history: TrafficSchema) => !history.processing) } })
			} else {
				Object.assign(serverData, { data: { actives: trafficHistories.filter((history: TrafficSchema) => history.processing) } })
			}
		}

		return Response.json(serverData)
	},
}
