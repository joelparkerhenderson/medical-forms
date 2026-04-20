# Plan: Employee Satisfaction Survey

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The employee satisfaction survey uses a Likert-scale scoring system (1-5 per item) across multiple workplace experience domains. Each domain contains several questions rated from 1 (Strongly Disagree / Very Dissatisfied) to 5 (Strongly Agree / Very Satisfied). Raw scores are aggregated per domain, then combined into a normalized composite score (0-100). The composite score is categorised as: Excellent (85-100), Good (70-84), Satisfactory (50-69), Poor (25-49), or Very Poor (0-24). The survey also detects flagged issues where individual domain scores fall below acceptable thresholds, enabling targeted workforce intervention and retention planning.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with HR staff
