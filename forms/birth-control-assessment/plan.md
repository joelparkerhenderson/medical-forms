# Plan: Birth Control Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The birth control assessment uses the UK Medical Eligibility Criteria (UK MEC) for contraceptive use, adapted from the WHO MEC framework. The UK MEC assigns each contraceptive method a category from 1 (no restriction) through 4 (unacceptable health risk) based on the patient's medical conditions, risk factors, and personal circumstances. The assessment evaluates DVT risk, cardiovascular risk factors, BMI, smoking status, migraine with aura, and other contraindications to determine the most appropriate contraceptive methods. Category 3 and 4 conditions represent relative and absolute contraindications respectively, and require careful clinical review before prescribing.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
