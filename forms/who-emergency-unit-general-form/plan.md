# Plan: WHO Emergency Unit Form: General

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

WHO standardised emergency unit clinical documentation form for general (non-trauma) patients. Comprehensive 2-page form covering patient registration, chief complaint and vitals, high risk signs, primary survey (ABCD), history of present illness, review of systems (14 systems), past medical history, physical exam (11 systems), diagnostics (CBC, lytes, ECG, imaging), additional interventions, assessment and plan, reassessment, and disposition. No clinical scoring — the form structures emergency clinical documentation with triage indicators.

## Implementation plan

1. Author SQL migrations for patient registration, vitals, high risk signs, ABCD survey, history, ROS, past medical, physical exam, diagnostics, interventions, assessment, reassessment, and disposition
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (16 steps)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for patient tracking
6. Build SvelteKit dashboard with SVAR DataGrid
7. Build Rust backend with Loco/Tera
8. Add completeness validation engine and high risk sign detection
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
