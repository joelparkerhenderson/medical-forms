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
		client: {start:"_app/immutable/entry/start.83NJdW5Z.js",app:"_app/immutable/entry/app.BaW1rkPN.js",imports:["_app/immutable/entry/start.83NJdW5Z.js","_app/immutable/chunks/BYrPbvVM.js","_app/immutable/chunks/CxeElP0J.js","_app/immutable/chunks/CndKReDo.js","_app/immutable/entry/app.BaW1rkPN.js","_app/immutable/chunks/CxeElP0J.js","_app/immutable/chunks/HC0Ztl_k.js","_app/immutable/chunks/DObo01QL.js","_app/immutable/chunks/sbm1G0EF.js","_app/immutable/chunks/CndKReDo.js","_app/immutable/chunks/DmK6GFaM.js","_app/immutable/chunks/BXv6O3JF.js","_app/immutable/chunks/BWaboC4Q.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
