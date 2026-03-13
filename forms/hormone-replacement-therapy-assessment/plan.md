# Plan: Hormone Replacement Therapy Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The MRS (Menopause Rating Scale) is a validated self-assessment instrument measuring the severity of menopausal symptoms across three subscales: somatic (hot flushes, heart discomfort, sleep problems, joint/muscle complaints), psychological (depressive mood, irritability, anxiety, exhaustion), and urogenital (sexual problems, bladder problems, vaginal dryness). Each item is rated 0 (none) to 4 (very severe), and the instrument also screens for HRT contraindications including thromboembolism history, hormone-sensitive cancers, and cardiovascular risk factors.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
