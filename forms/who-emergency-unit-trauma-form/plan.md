# Plan: WHO Emergency Unit Form: Trauma

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

WHO standardised emergency unit clinical documentation form for trauma patients. Comprehensive 2-page form covering patient registration, chief complaint and vitals, high risk red signs, high risk trauma indicators, triage (RED/YELLOW/GREEN), primary survey (ABCDE + FAST), injury history (mechanism, intent, prehospital care), past histories, physical exam (11 systems with injury body diagram), assessment and plan, diagnostics (labs and imaging), medications and procedures, reassessment, and disposition. No clinical scoring — the form structures trauma documentation with triage categories.

## Implementation plan

1. Author SQL migrations for patient registration, vitals, high risk signs, triage, ABCDE+F survey, injury history, past histories, physical exam, assessment, diagnostics, medications/procedures, reassessment, and disposition
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (17 steps with injury body diagram)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for trauma patient tracking
6. Build SvelteKit dashboard with SVAR DataGrid
7. Build Rust backend with Loco/Tera
8. Add completeness validation engine and high risk sign/trauma detection
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
