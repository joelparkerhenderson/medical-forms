# Plan: UK DVLA V1 Form — Vision

## Current status

Not yet implemented. Directory scaffolded with stub files.

## Form purpose

Regulatory self-declaration form for the UK DVLA covering vision conditions that may affect driving fitness. Captures eyesight standards, monocular vision, visual field, glaucoma, retinitis pigmentosa, laser treatment, blepharospasm, night blindness, diplopia, and other conditions. No clinical scoring — the form validates completeness and flags conditions requiring DVLA medical review.

## Implementation plan

1. Author SQL migrations for patient details, form parts (A, B, vision questionnaire), and authorisation
2. Generate XML representations and FHIR R5 resources from migrations
3. Build HTML form frontend (14 steps with extensive conditional logic per question)
4. Build SvelteKit form frontend with Svelte 5 runes and Tailwind 4
5. Build HTML dashboard for submission tracking
6. Build SvelteKit dashboard with SVAR DataGrid
7. Build Rust backend with Loco/Tera
8. Add completeness validation engine and flagged issues
9. Add unit tests for validation logic

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Clinical safety case documentation
- User acceptance testing
- GDPR data processing impact assessment
