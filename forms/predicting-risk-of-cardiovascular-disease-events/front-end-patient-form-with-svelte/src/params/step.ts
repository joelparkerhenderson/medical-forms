import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	const n = parseInt(param);
	return !isNaN(n) && n >= 1 && n <= 10;
};
