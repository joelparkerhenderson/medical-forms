# Plan: Asthma Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The ACT grader implements the Asthma Control Test, a validated 5-question instrument where each question is scored 1-5. The total score ranges from 5 to 25. A score of 20-25 indicates well-controlled asthma, 16-19 indicates not well controlled asthma, and 15 or below indicates very poorly controlled asthma. The grader also evaluates additional clinical data including lung function results, exacerbation frequency, trigger exposure, and medication adherence to generate flagged issues for clinician review.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
