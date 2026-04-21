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
		client: {start:"_app/immutable/entry/start.C1SneW2s.js",app:"_app/immutable/entry/app.Dn6DgtLn.js",imports:["_app/immutable/entry/start.C1SneW2s.js","_app/immutable/chunks/BDMUWu1c.js","_app/immutable/chunks/CFV5pu-f.js","_app/immutable/chunks/DQWL13gh.js","_app/immutable/entry/app.Dn6DgtLn.js","_app/immutable/chunks/CFV5pu-f.js","_app/immutable/chunks/BrJxxioc.js","_app/immutable/chunks/C2L2a6Mz.js","_app/immutable/chunks/CKxIo9mM.js","_app/immutable/chunks/DQWL13gh.js","_app/immutable/chunks/ByCdUkuf.js","_app/immutable/chunks/C9dakLFz.js","_app/immutable/chunks/C0TfAkmy.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/assessment/[step=step]",
				pattern: /^\/assessment\/([^/]+?)\/?$/,
				params: [{"name":"step","matcher":"step","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/report",
				pattern: /^\/report\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/report/pdf",
				pattern: /^\/report\/pdf\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/report/pdf/_server.ts.js'))
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
