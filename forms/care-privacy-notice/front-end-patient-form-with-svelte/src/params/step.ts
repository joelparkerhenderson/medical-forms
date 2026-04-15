import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	const n = parseInt(param, 10);
	return !isNaN(n) && n >= 1 && n <= 3;
};
