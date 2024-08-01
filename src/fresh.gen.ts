// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_landing_layout from './routes/(landing)/_layout.tsx'
import * as $_landing_index from './routes/(landing)/index.tsx'
import * as $_app from './routes/_app.tsx'
import * as $_middleware from './routes/_middleware.ts'
import * as $api_v0_entrance_middleware from './routes/api/v0/entrance/_middleware.ts'
import * as $api_v0_entrance_sign_in from './routes/api/v0/entrance/sign-in.ts'
import * as $api_v0_entrance_sign_up from './routes/api/v0/entrance/sign-up.ts'
import * as $api_v0_traffic_jam_index from './routes/api/v0/traffic-jam/index.ts'
import * as $entrance_layout from './routes/entrance/_layout.tsx'
import * as $entrance_index from './routes/entrance/index.tsx'
import * as $clipboard from './islands/clipboard.tsx'
import * as $entrance_back_button from './islands/entrance/back-button.tsx'
import * as $entrance_captcha_form from './islands/entrance/captcha-form.tsx'
import * as $entrance_entrance_form from './islands/entrance/entrance-form.tsx'
import { type Manifest } from '$fresh/server.ts'

const manifest = {
	routes: {
		'./routes/(landing)/_layout.tsx': $_landing_layout,
		'./routes/(landing)/index.tsx': $_landing_index,
		'./routes/_app.tsx': $_app,
		'./routes/_middleware.ts': $_middleware,
		'./routes/api/v0/entrance/_middleware.ts': $api_v0_entrance_middleware,
		'./routes/api/v0/entrance/sign-in.ts': $api_v0_entrance_sign_in,
		'./routes/api/v0/entrance/sign-up.ts': $api_v0_entrance_sign_up,
		'./routes/api/v0/traffic-jam/index.ts': $api_v0_traffic_jam_index,
		'./routes/entrance/_layout.tsx': $entrance_layout,
		'./routes/entrance/index.tsx': $entrance_index,
	},
	islands: {
		'./islands/clipboard.tsx': $clipboard,
		'./islands/entrance/back-button.tsx': $entrance_back_button,
		'./islands/entrance/captcha-form.tsx': $entrance_captcha_form,
		'./islands/entrance/entrance-form.tsx': $entrance_entrance_form,
	},
	baseUrl: import.meta.url,
} satisfies Manifest

export default manifest
