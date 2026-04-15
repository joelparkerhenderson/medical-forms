export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.DCci0dw-.js",app:"_app/immutable/entry/app.D8M5YK8a.js",imports:["_app/immutable/entry/start.DCci0dw-.js","_app/immutable/chunks/iPSuiUv5.js","_app/immutable/chunks/BJjQH1xc.js","_app/immutable/chunks/l1ghm2BZ.js","_app/immutable/chunks/D2qP5oba.js","_app/immutable/entry/app.D8M5YK8a.js","_app/immutable/chunks/BJjQH1xc.js","_app/immutable/chunks/D_rTd1hy.js","_app/immutable/chunks/D8mrjy7l.js","_app/immutable/chunks/D2qP5oba.js","_app/immutable/chunks/CyEHCTcm.js","_app/immutable/chunks/DeR8T30c.js","_app/immutable/chunks/BC_GyKR0.js","_app/immutable/chunks/l1ghm2BZ.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/assessment/[step=step]",
				pattern: /^\/assessment\/([^/]+?)\/?$/,
				params: [{"name":"step","matcher":"step","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/report",
				pattern: /^\/report\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			const { match: step } = await import ('./entries/matchers/step.js')
			return { step };
		},
		server_assets: {}
	}
}
})();
