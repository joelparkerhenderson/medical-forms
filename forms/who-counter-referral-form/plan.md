# Plan: WHO Counter-Referral Form

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

WHO standardised counter-referral form for discharging patients back to primary care using the SBAR framework. Captures patient identification, facility details (initiating, referral, primary care), situation (diagnosis, treatments, ICU/surgery flags), background (history, significant events), assessment (final diagnoses, prognosis), recommendations (follow-up plan, pending investigations, deterioration instructions), and provider sign-off. No clinical scoring — the form validates completeness and flags status indicators.

## Implementation plan

1. Author SQL migrations for patient, facility details, SBAR sections, status flags, and provider sign-off
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (7 steps)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for discharge tracking
6. Build SvelteKit dashboard with SVAR DataGrid
7. Build Rust backend with Loco/Tera
8. Add completeness validation engine and status flag detection
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
