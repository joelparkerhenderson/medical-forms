
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/assessment" | "/assessment/[step=step]" | "/report" | "/report/pdf";
		RouteParams(): {
			"/assessment/[step=step]": { step: MatcherParam<typeof import('../src/params/step.js').match> }
		};
		LayoutParams(): {
			"/": { step?: MatcherParam<typeof import('../src/params/step.js').match> };
			"/assessment": { step?: MatcherParam<typeof import('../src/params/step.js').match> };
			"/assessment/[step=step]": { step: MatcherParam<typeof import('../src/params/step.js').match> };
			"/report": Record<string, never>;
			"/report/pdf": Record<string, never>
		};
		Pathname(): "/" | `/assessment/${string}` & {} | "/report" | "/report/pdf";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}