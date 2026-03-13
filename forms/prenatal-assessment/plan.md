# Plan: Prenatal Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Risk Stratification scoring engine evaluates antenatal patients into Low, Moderate, or High risk categories based on obstetric history, current pregnancy complications, vital sign abnormalities, and laboratory findings. It incorporates maternal age, previous pregnancy outcomes, pre-existing medical conditions, and mental health screening scores. The stratification guides clinical decision-making on appointment frequency, specialist referrals, and delivery planning.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
