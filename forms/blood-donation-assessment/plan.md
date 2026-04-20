# Plan: Blood Donation Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The donor grader evaluates every response against the JPAC deferral-rule catalogue, which distinguishes permanent from time-limited deferrals and also validates minimum haemoglobin and vital-sign thresholds. Rule hits are aggregated so the most restrictive outcome wins: any permanent rule yields Permanently Deferred; otherwise any temporary rule yields Temporarily Deferred with a computed earliest-eligible date; remaining donors are Eligible. Flagged issues surface borderline Hb, high-risk travel, and donor-welfare concerns for the session nurse's review.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with donor session nurses
