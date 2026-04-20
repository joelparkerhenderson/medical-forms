# Plan: First Aid Training Checklist

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The first-aid grader classifies each demonstrated skill as competent, needs development, or not demonstrated, aggregated across ten syllabus domains. Life-saving skills (CPR, AED, severe bleeding control, airway management) are weighted as critical: failure of any critical skill forces an overall Fail. Non-critical deficiencies accumulate into a Needs Development outcome once a configurable threshold is reached, triggering targeted retraining flagged issues. A clean run across all domains yields Pass and issues a digital certificate valid for three years per HSE FAW guidance.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with first-aid instructors
