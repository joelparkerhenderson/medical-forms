# Plan: Medical Language Speaking Assessment for Cymraeg

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The Welsh-language speaking grader rates each role-play on four criteria (fluency, grammar, pronunciation, clinical appropriateness) at CEFR-mapped bands from A1 to C2. A role-play receives a level equal to the lowest criterion score to reflect the "active active" standard expected under NHS Wales' More Than Just Words policy. The overall candidate level is the minimum of the two role-play levels. Flagged issues include mismatches between self-declared Welsh language level and observed performance, and failure to use Welsh medical terminology where appropriate.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support (Welsh + English UI)
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with NHS Wales Welsh-language officers
