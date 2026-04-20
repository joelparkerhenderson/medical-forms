# Plan: Employee Offboarding Checklist

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The offboarding checklist is a completeness validator rather than a clinical scoring engine. Each of ten steps contains mandatory and optional items drawn from HR, payroll, IT security, and clinical-governance requirements. The validator computes a per-step completion state and an overall outcome of Complete, Partial, or Incomplete. Missing mandatory items — such as revoked system access, returned mobile devices, or knowledge-transfer sign-off — generate flagged issues routed to the appropriate manager or IT service desk. The final exit sign-off is blocked until all mandatory items are confirmed.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with HR staff
