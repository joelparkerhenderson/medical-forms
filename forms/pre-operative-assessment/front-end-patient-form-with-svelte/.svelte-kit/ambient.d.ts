
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const MANPATH: string;
	export const NoDefaultCurrentDirectoryInExePath: string;
	export const __MISE_DIFF: string;
	export const GHOSTTY_RESOURCES_DIR: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const TERM_PROGRAM: string;
	export const NODE: string;
	export const INIT_CWD: string;
	export const SHELL: string;
	export const TERM: string;
	export const OPS_DIR: string;
	export const FINDER: string;
	export const TMPDIR: string;
	export const npm_config_global_prefix: string;
	export const TERM_PROGRAM_VERSION: string;
	export const COLOR: string;
	export const STDERR_COLOR_START: string;
	export const npm_config_noproxy: string;
	export const SDKMAN_PLATFORM: string;
	export const npm_config_local_prefix: string;
	export const PNPM_HOME: string;
	export const ZSH: string;
	export const GIT_EDITOR: string;
	export const MIX_ARCHIVES: string;
	export const STDOUT_COLOR_START: string;
	export const USER: string;
	export const OPENAI_API_KEY: string;
	export const COMMAND_MODE: string;
	export const npm_config_globalconfig: string;
	export const SDKMAN_CANDIDATES_API: string;
	export const SSH_AUTH_SOCK: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_execpath: string;
	export const PAGER: string;
	export const JUMPER: string;
	export const LSCOLORS: string;
	export const BOOK_BINDER_PAGE_PATH_PREPEND: string;
	export const __MISE_WATCH: string;
	export const STDOUT_COLOR_STOP: string;
	export const PATH: string;
	export const npm_package_json: string;
	export const _: string;
	export const GHOSTTY_SHELL_FEATURES: string;
	export const npm_config_userconfig: string;
	export const npm_config_init_module: string;
	export const __CFBundleIdentifier: string;
	export const npm_command: string;
	export const SDKMAN_BROKER_API: string;
	export const PWD: string;
	export const JAVA_HOME: string;
	export const npm_lifecycle_event: string;
	export const EDITOR: string;
	export const OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
	export const npm_package_name: string;
	export const LANG: string;
	export const npm_config_npm_version: string;
	export const XPC_FLAGS: string;
	export const MIX_HOME: string;
	export const npm_config_node_gyp: string;
	export const npm_package_version: string;
	export const XPC_SERVICE_NAME: string;
	export const HOME: string;
	export const SHLVL: string;
	export const __MISE_ORIG_PATH: string;
	export const TERMINFO: string;
	export const STDERR_COLOR_STOP: string;
	export const AVO_LICENSE_KEY: string;
	export const GIT: string;
	export const MISE_SHELL: string;
	export const PROMPT: string;
	export const BOOK_BINDER_PAGE_LINK_PREPEND: string;
	export const npm_config_cache: string;
	export const LESS: string;
	export const LOGNAME: string;
	export const npm_lifecycle_script: string;
	export const SDKMAN_DIR: string;
	export const XDG_DATA_DIRS: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const GHOSTTY_BIN_DIR: string;
	export const npm_config_user_agent: string;
	export const __MISE_DIR: string;
	export const SDKMAN_CANDIDATES_DIR: string;
	export const ANDROID_NDK_HOME: string;
	export const GITHUB_PERSONAL_ACCESS_TOKEN: string;
	export const OSLogRateLimit: string;
	export const CLAUDECODE: string;
	export const RUBYLIB: string;
	export const AIRFLOW_HOME: string;
	export const npm_node_execpath: string;
	export const npm_config_prefix: string;
	export const COLORTERM: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		MANPATH: string;
		NoDefaultCurrentDirectoryInExePath: string;
		__MISE_DIFF: string;
		GHOSTTY_RESOURCES_DIR: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		TERM_PROGRAM: string;
		NODE: string;
		INIT_CWD: string;
		SHELL: string;
		TERM: string;
		OPS_DIR: string;
		FINDER: string;
		TMPDIR: string;
		npm_config_global_prefix: string;
		TERM_PROGRAM_VERSION: string;
		COLOR: string;
		STDERR_COLOR_START: string;
		npm_config_noproxy: string;
		SDKMAN_PLATFORM: string;
		npm_config_local_prefix: string;
		PNPM_HOME: string;
		ZSH: string;
		GIT_EDITOR: string;
		MIX_ARCHIVES: string;
		STDOUT_COLOR_START: string;
		USER: string;
		OPENAI_API_KEY: string;
		COMMAND_MODE: string;
		npm_config_globalconfig: string;
		SDKMAN_CANDIDATES_API: string;
		SSH_AUTH_SOCK: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_execpath: string;
		PAGER: string;
		JUMPER: string;
		LSCOLORS: string;
		BOOK_BINDER_PAGE_PATH_PREPEND: string;
		__MISE_WATCH: string;
		STDOUT_COLOR_STOP: string;
		PATH: string;
		npm_package_json: string;
		_: string;
		GHOSTTY_SHELL_FEATURES: string;
		npm_config_userconfig: string;
		npm_config_init_module: string;
		__CFBundleIdentifier: string;
		npm_command: string;
		SDKMAN_BROKER_API: string;
		PWD: string;
		JAVA_HOME: string;
		npm_lifecycle_event: string;
		EDITOR: string;
		OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
		npm_package_name: string;
		LANG: string;
		npm_config_npm_version: string;
		XPC_FLAGS: string;
		MIX_HOME: string;
		npm_config_node_gyp: string;
		npm_package_version: string;
		XPC_SERVICE_NAME: string;
		HOME: string;
		SHLVL: string;
		__MISE_ORIG_PATH: string;
		TERMINFO: string;
		STDERR_COLOR_STOP: string;
		AVO_LICENSE_KEY: string;
		GIT: string;
		MISE_SHELL: string;
		PROMPT: string;
		BOOK_BINDER_PAGE_LINK_PREPEND: string;
		npm_config_cache: string;
		LESS: string;
		LOGNAME: string;
		npm_lifecycle_script: string;
		SDKMAN_DIR: string;
		XDG_DATA_DIRS: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		GHOSTTY_BIN_DIR: string;
		npm_config_user_agent: string;
		__MISE_DIR: string;
		SDKMAN_CANDIDATES_DIR: string;
		ANDROID_NDK_HOME: string;
		GITHUB_PERSONAL_ACCESS_TOKEN: string;
		OSLogRateLimit: string;
		CLAUDECODE: string;
		RUBYLIB: string;
		AIRFLOW_HOME: string;
		npm_node_execpath: string;
		npm_config_prefix: string;
		COLORTERM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
