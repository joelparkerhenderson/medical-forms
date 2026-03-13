# Plan: Genetic Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Risk Stratification system uses weighted risk factor scoring to evaluate genetic counselling referral urgency across cancer genetics, cardiovascular genetics, neurogenetics, and reproductive genetics domains. Each domain contributes risk points based on personal and family history indicators. The total score categorises patients as Low risk (0-2), Moderate risk (3-5), or High risk (6+), guiding appropriate referral pathways.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
