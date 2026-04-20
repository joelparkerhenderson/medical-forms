# Plan: Workplace Climate Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The workplace climate assessment uses a Likert-scale instrument (1-5 per item) across nine organisational climate domains. Domain scores are averaged, then combined into a normalized composite score (0-100) and categorised as Thriving, Healthy, Developing, Strained, or Critical. The grader detects flagged issues such as low psychological safety, poor inclusion, or elevated burnout indicators, triggering recommendations for leadership coaching, policy review, or targeted culture interventions. Anonymous aggregation supports team-level reporting while protecting individual respondents.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with HR and leadership teams
