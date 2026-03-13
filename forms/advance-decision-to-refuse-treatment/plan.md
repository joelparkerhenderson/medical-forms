# Plan: Advance Decision to Refuse Treatment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The validity grader evaluates whether an advance decision to refuse treatment meets the legal requirements of the Mental Capacity Act 2005. It checks for completeness of personal information, a valid capacity declaration, clearly specified treatments and circumstances, proper handling of life-sustaining treatment refusals (which require written signatures and witnesses), and legal attestation. The result is categorised as Valid (all legal requirements met), Invalid (critical requirements missing or contradictory), or Incomplete (some sections still need to be filled in).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
