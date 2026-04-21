export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.BW_MxpMg.js",app:"_app/immutable/entry/app.BaIKbj11.js",imports:["_app/immutable/entry/start.BW_MxpMg.js","_app/immutable/chunks/DZ3_yuGQ.js","_app/immutable/chunks/hfJXQnt3.js","_app/immutable/chunks/DrqcUCxq.js","_app/immutable/entry/app.BaIKbj11.js","_app/immutable/chunks/hfJXQnt3.js","_app/immutable/chunks/Btp5oWBm.js","_app/immutable/chunks/B_yGBcYg.js","_app/immutable/chunks/D6bJp_Au.js","_app/immutable/chunks/DrqcUCxq.js","_app/immutable/chunks/BgH1lGg1.js","_app/immutable/chunks/DtdioBPB.js","_app/immutable/chunks/D9jdMdAB.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
