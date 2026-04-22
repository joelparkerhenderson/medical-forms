# Plan: SvelteKit patient front-end

## Status

Implemented. 16-step patient wizard, ASA grading engine, safety-flag engine,
reactive store, shared UI library, and server-rendered PDF report endpoint
all in place.

## Build order

1. [x] `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`.
2. [x] Tailwind CSS 4 config and `app.css`.
3. [x] Engine: `types.ts`, `utils.ts`, `asa-rules.ts`, `flagged-issues.ts`,
       `asa-grader.ts` (42 ASA rules across 11 body systems; 20+ safety flags).
4. [x] Vitest unit tests in `src/lib/engine/asa-grader.test.ts`.
5. [x] Reactive store `src/lib/stores/assessment.svelte.ts` using `$state` runes.
6. [x] Step configuration `src/lib/config/steps.ts`.
7. [x] Shared UI components under `src/lib/components/ui/` (RadioGroup,
       SelectInput, NumberInput, TextInput, TextArea, CheckboxGroup,
       SectionCard, StepNavigation, ProgressBar, Badge, AllergyEntry,
       MedicationEntry).
8. [x] 16 step components `src/lib/components/steps/Step1Demographics.svelte`
       through `Step16Pregnancy.svelte`.
9. [x] Routes: landing, single-page assessment wizard, report preview,
       server-side PDF endpoint `/report/pdf/+server.ts`.

## Future enhancements

- Zod runtime validation of the assessment payload.
- Axe-core accessibility audit.
- Playwright end-to-end smoke tests.
- LocalStorage autosave.
- Internationalisation (i18n).
