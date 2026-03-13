# Plan: Stroke Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The NIHSS scoring engine evaluates acute stroke severity across multiple neurological domains including consciousness, gaze, visual fields, facial palsy, motor function, limb ataxia, sensory function, language, dysarthria, and extinction/inattention. Each domain is scored individually and summed to produce a total score from 0 to 42, with higher scores indicating more severe stroke. Flagged issues are raised for scores indicating moderate or severe stroke, onset within the thrombolysis treatment window, or critical neurological findings.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
