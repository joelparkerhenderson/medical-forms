# Plan: SvelteKit clinician front-end

## Status

Scaffolding and core engine in place. 16 step components implemented as
minimal working stubs that bind to the reactive store. Report preview and
PDF endpoint operational.

## Build order

1. [x] `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`.
2. [x] Tailwind CSS 4 config, app.css, app.html.
3. [x] Engine: types, utils, ASA rules, Mallampati, RCRI, STOP-BANG,
       frailty rules, composite grader, flagged issues.
4. [x] Vitest unit tests for the engine.
5. [x] Reactive store with `$state` runes.
6. [x] 16 step components (minimal working UI).
7. [x] Progress bar + step navigation UI.
8. [x] Report route + pdfmake builder.
9. [x] Route matcher for `[step=step]` (1-16).
10. [ ] Zod runtime validation (future).
11. [ ] Axe-core accessibility audit (future).
12. [ ] Playwright end-to-end smoke test (future).

## Known limitations

- Step components are minimal. Field layouts for production would wrap UI
  in `<FormField>` and `<SelectField>` components with explicit accessibility
  semantics per NHS Design System.
- Autosave is a future enhancement (currently in-memory only).
- No authentication; sessions are single-user / per-browser-tab.
