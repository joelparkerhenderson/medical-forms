# Plan: Endocrinology Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The endocrine grader evaluates each axis independently by combining patient-reported symptoms with laboratory values interpreted against age-, sex-, and where relevant pregnancy-specific reference ranges. The per-axis outcome is the highest severity implied by symptoms or biochemistry. Cross-axis rules detect emergencies (thyroid storm, myxoedema coma, adrenal crisis, diabetic ketoacidosis, hypercalcaemic crisis) and force an immediate-action flag. The overall case severity is the most severe single-axis outcome; flagged issues summarise drivers and cross-axis interactions (e.g. hypothyroidism masking adrenal insufficiency).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with endocrinologists
