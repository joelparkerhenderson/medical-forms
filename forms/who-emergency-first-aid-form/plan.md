# Plan: WHO Emergency First Aid Form

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

WHO standardised emergency first aid documentation form for community first aid responders (CFAR). Uses the CABCDE systematic assessment framework with paired interventions for each category. Captures patient identification, referral and transport details, situation (medical vs trauma, pregnancy), background (history, medications, allergies), CABCDE assessment and interventions, recommendations, and responder details. No clinical scoring — the form validates completeness and flags precaution indicators.

## Implementation plan

1. Author SQL migrations for patient, referral/transport, situation, background, CABCDE sections, recommendations, and responder
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (12 steps with assessment/intervention pairs per CABCDE category)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for incident tracking
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
