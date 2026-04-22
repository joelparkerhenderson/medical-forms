# Plan: WHO Acute Referral Form

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

WHO standardised acute referral form for inter-facility patient transfers using the SBAR communication framework. Captures patient identification, facility and transport details, situation (complaint, diagnosis, treatments), background (history, ABCDE assessment), clinical assessment with vital signs, recommendations for transport, and two-party completion (initiating facility sign-off and referral facility receipt). No clinical scoring — the form validates completeness and flags precaution indicators.

## Implementation plan

1. Author SQL migrations for patient, facility details, SBAR sections, precaution flags, and provider sign-off
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (8 steps with two-party completion support)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for referral tracking
6. Build SvelteKit dashboard with SVAR DataGrid
7. Build Rust backend with Loco/Tera
8. Add completeness validation engine and precaution flag detection
9. Add unit tests for validation logic

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Clinical safety case documentation
- User acceptance testing with clinical staff
- GDPR data processing impact assessment
