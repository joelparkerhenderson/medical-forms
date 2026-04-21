# SvelteKit dashboard — Agent Instructions

SvelteKit dashboard with SVAR DataGrid. Displays computed ASA grade and
safety flags per patient-completed assessment.

## Files

- `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`
- `src/app.css`, `src/app.html`
- `src/lib/api/assessments.ts` — fetch with sample-data fallback
- `src/lib/data/sample.ts` — seed rows
- `src/routes/+layout.svelte`, `+page.svelte` — dashboard
