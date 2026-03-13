# Plan: Ergonomic Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The ergonomic assessment uses the Rapid Entire Body Assessment (REBA), a systematic postural analysis tool designed to evaluate musculoskeletal risk in workplace settings. REBA scores body posture across two groups: Group A (trunk, neck, legs) and Group B (upper arms, lower arms, wrists), combined with force/load and coupling scores to produce a final score from 1 to 15. The risk levels are: negligible (1), low (2-3), medium (4-7), high (8-10), and very high (11-15). Each risk level maps to an action urgency from no action required through to immediate change needed. The assessment also captures workstation setup details, repetitive task analysis, manual handling requirements, current musculoskeletal symptoms, and psychosocial factors to provide a holistic ergonomic evaluation.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
