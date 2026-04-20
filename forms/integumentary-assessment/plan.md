# Plan: Integumentary Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The integumentary grader sums the six Braden sub-scale scores (sensory perception, moisture, activity, mobility, nutrition, friction and shear) to a total 6-23 score and maps it to a Braden risk band. Existing pressure ulcers or skin tears are separately staged (NPUAP/EPUAP categories I-IV, unstageable, deep tissue injury). Wound assessment follows the TIME framework (Tissue, Infection/Inflammation, Moisture, Edge). Flagged issues combine Braden band, wound stage, and integumentary findings (e.g. new asymmetric pigmented lesion meeting ABCDE criteria) to trigger tissue-viability, dermatology, or two-week-wait suspected-melanoma referrals.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with tissue-viability and dermatology clinicians
