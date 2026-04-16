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
		client: {start:"_app/immutable/entry/start.DilFYJJa.js",app:"_app/immutable/entry/app.Xk1ojWq0.js",imports:["_app/immutable/entry/start.DilFYJJa.js","_app/immutable/chunks/BMDaAeMj.js","_app/immutable/chunks/BO_1ccXQ.js","_app/immutable/chunks/CGvR8zP8.js","_app/immutable/entry/app.Xk1ojWq0.js","_app/immutable/chunks/BO_1ccXQ.js","_app/immutable/chunks/l9YnK5gb.js","_app/immutable/chunks/CgLd2K39.js","_app/immutable/chunks/CGvR8zP8.js","_app/immutable/chunks/DQJYbyGC.js","_app/immutable/chunks/CQPSQXtH.js","_app/immutable/chunks/DADbbWz1.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
				id: "/assessment",
				pattern: /^\/assessment\/?$/,
				params: [],
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
			
			return {  };
		},
		server_assets: {}
	}
}
})();
