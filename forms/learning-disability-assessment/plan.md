# Plan: Learning Disability Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The LD grader integrates existing IQ or standardised psychometric results where available with adaptive-functioning ratings across conceptual, social, and practical domains, following DSM-5-TR which emphasises adaptive functioning over IQ cut-offs alone. Severity category is assigned by the highest level of support need indicated by adaptive deficits. The Annual Health Check component separately validates that minimum health-check items (vision, hearing, weight, BP, bloods, seizures, medication review, communication needs) have been completed, flagging any gaps. Health Action Plan outputs include per-item responsibilities and target dates.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with learning-disability teams and self-advocates
