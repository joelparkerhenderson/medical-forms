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
		client: {start:"_app/immutable/entry/start.eh8UVSj8.js",app:"_app/immutable/entry/app.oDs_mnUN.js",imports:["_app/immutable/entry/start.eh8UVSj8.js","_app/immutable/chunks/DH9WhzT3.js","_app/immutable/chunks/WG0FHagD.js","_app/immutable/chunks/DyPSAuZ6.js","_app/immutable/entry/app.oDs_mnUN.js","_app/immutable/chunks/WG0FHagD.js","_app/immutable/chunks/DRCbb4Rp.js","_app/immutable/chunks/CwWE4Tdg.js","_app/immutable/chunks/DyPSAuZ6.js","_app/immutable/chunks/xfIL9WMa.js","_app/immutable/chunks/BmPMzHYX.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
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
