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
		client: {start:"_app/immutable/entry/start.D0F05TJs.js",app:"_app/immutable/entry/app.Cn7XSEsf.js",imports:["_app/immutable/entry/start.D0F05TJs.js","_app/immutable/chunks/CTWUUApG.js","_app/immutable/chunks/BjACUF_B.js","_app/immutable/chunks/DwnobRmM.js","_app/immutable/entry/app.Cn7XSEsf.js","_app/immutable/chunks/BjACUF_B.js","_app/immutable/chunks/DyTKe8Zr.js","_app/immutable/chunks/DKpjXpuC.js","_app/immutable/chunks/Ch-Ba-QP.js","_app/immutable/chunks/DwnobRmM.js","_app/immutable/chunks/CNjIbsoJ.js","_app/immutable/chunks/CJnVQyF8.js","_app/immutable/chunks/DPAUWUKz.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
				id: "/assessment",
				pattern: /^\/assessment\/?$/,
				params: [],
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
			
			return {  };
		},
		server_assets: {}
	}
}
})();
