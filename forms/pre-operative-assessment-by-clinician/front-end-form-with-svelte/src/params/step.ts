import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  const n = Number(param);
  return Number.isInteger(n) && n >= 1 && n <= 16;
};
