# Plan: Workplace Stress Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The workplace stress assessment implements the HSE Management Standards Indicator Tool, a 35-item validated questionnaire scored 1-5 per item across seven domains (Demands, Control, Manager Support, Peer Support, Relationships, Role, Change). Domain scores are averaged and benchmarked against published HSE percentile thresholds (20th, 50th, 80th) to assign a Low / Moderate / High / Very High risk category. The grader flags domains falling below the 20th percentile, triggers referrals to occupational health, and surfaces organisation-level patterns for management action as required under the UK Management of Health and Safety at Work Regulations.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with occupational health staff
