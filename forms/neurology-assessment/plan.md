# Plan: Neurology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The NIHSS (National Institutes of Health Stroke Scale) is a systematic assessment tool that quantifies the severity of stroke symptoms across 15 domains including level of consciousness, gaze, visual fields, facial palsy, motor function, ataxia, sensory, language, dysarthria, and extinction/inattention. Scores range from 0 to 42, with higher scores indicating more severe neurological deficit. The assessment also covers headache classification, seizure history, and comprehensive motor and sensory examination for broader neurological evaluation.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
