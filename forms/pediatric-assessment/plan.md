# Plan: Pediatric Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Developmental Screen scoring engine evaluates paediatric patients across multiple developmental domains including gross motor, fine motor, language, and social-emotional milestones. It compares observed achievements against age-appropriate expectations to classify results as Pass, Concern, or Refer. Birth history, growth parameters, immunisation gaps, and environmental risk factors are also incorporated into the overall screening outcome.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
