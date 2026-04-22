# Plan: WHO Prehospital Form

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

WHO standardised prehospital clinical documentation form for emergency medical services (EMS). Comprehensive 2-page form covering caller and scene details, chief complaint and initial vitals, high risk signs, triage (RED/YELLOW/GREEN), primary survey (ABCDE), SAMPLE history, injury details (mechanism, intent, road traffic), physical exam (10 systems), additional interventions, assessment and plan, up to 3 reassessment vital sign sets, and disposition with handover. No clinical scoring — the form structures EMS documentation with triage categories and GCS tracking.

## Implementation plan

1. Author SQL migrations for caller/scene, vitals, high risk signs, triage, ABCDE survey, SAMPLE history, injury details, physical exam, interventions, assessment, reassessments, and disposition
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (16 steps with multiple reassessment support)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for EMS call tracking
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
- User acceptance testing with EMS staff
- GDPR data processing impact assessment
