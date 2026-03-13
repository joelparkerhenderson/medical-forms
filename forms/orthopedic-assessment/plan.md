# Plan: Orthopaedic Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The DASH (Disabilities of the Arm, Shoulder and Hand) scoring engine calculates a disability score from 0 to 100 based on patient-reported functional limitations and symptoms. Each DASH questionnaire item is scored on a 1-5 scale, and the formula converts raw scores to a percentage where 0 indicates no disability and 100 indicates maximum disability. Pain assessment, range of motion findings, and strength testing results complement the DASH score for a comprehensive musculoskeletal evaluation.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
