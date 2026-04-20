# Plan: Genetics Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The genetics grader walks the structured family pedigree and personal history to compute published risk scores including Manchester Score for breast/ovarian BRCA1/2 risk and Bethesda criteria for Lynch syndrome. Each risk model has its own referral thresholds; the overall risk category is the highest hit across models. Additional pattern rules (early-onset cancer, multiple primary cancers, bilateral disease, specific histology such as triple-negative breast cancer at < 40y, ancestry such as Ashkenazi Jewish) escalate to High directly. Flagged issues summarise the reason for each referral recommendation.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical genetics teams
