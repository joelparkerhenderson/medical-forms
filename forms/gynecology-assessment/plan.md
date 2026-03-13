# Plan: Gynecology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Symptom Severity Score evaluates gynaecological symptoms across menstrual, cervical, obstetric, and sexual health domains. It measures symptom frequency, intensity, and functional impact to generate a composite severity rating. The scoring engine also flags clinically significant findings such as abnormal cervical screening results, post-menopausal bleeding, and high-risk obstetric history for prioritised clinical review.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
