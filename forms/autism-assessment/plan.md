# Plan: Autism Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The AQ-10 grader implements the Autism Spectrum Quotient 10-item screening questionnaire, a validated brief screening tool developed by the Autism Research Centre. Each of the 10 items presents a statement that the respondent rates on a 4-point scale (Definitely Agree, Slightly Agree, Slightly Disagree, Definitely Disagree). Scoring assigns 1 point for each item where the response matches the autism-associated direction, yielding a total score of 0-10. A score of 6 or above indicates that a referral for comprehensive diagnostic assessment is recommended. The grader also evaluates supplemental data on social communication, repetitive behaviours, sensory profile, and developmental history to generate flagged issues for clinician review.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
