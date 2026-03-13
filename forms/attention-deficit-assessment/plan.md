# Plan: Attention Deficit Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The ASRS grader implements the Adult ADHD Self-Report Scale v1.1 screening instrument. Part A consists of 6 questions that form the primary screener; each question has a frequency response (Never, Rarely, Sometimes, Often, Very Often) scored against clinically validated thresholds. Four or more responses in the darkly shaded range in Part A are highly consistent with an ADHD diagnosis in adults. Part B provides 12 supplemental questions that offer additional clinical information but are not part of the primary screening score. The grader also evaluates childhood symptom history, functional impact, and comorbid conditions to generate flagged issues.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
