# Plan: Contraception Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The contraception assessment uses the UK Medical Eligibility Criteria (UKMEC), the national standard for contraceptive prescribing guidance. The UKMEC grader evaluates patient-reported medical history, cardiovascular risk factors, reproductive history, and lifestyle factors against eligibility criteria for 11 contraceptive methods (combined oral pill, progestogen-only pill, injectable, implant, IUS, IUD, patch, ring, diaphragm, condom, and emergency contraception). Each method receives a UKMEC category from 1 (no restriction) to 4 (unacceptable health risk), enabling clinicians to identify safe and appropriate contraceptive options for each patient based on their individual risk profile.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
