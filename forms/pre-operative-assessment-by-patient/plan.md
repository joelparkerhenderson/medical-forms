# Plan: Pre-operative Assessment

## Current status

Implemented. Patient form, clinician dashboard, Rust backend, database schema, and comprehensive documentation all created. This is the most mature project in the monorepo with 42 ASA grading rules, 20+ safety flags, and full clinical documentation.

## Scoring engine

The ASA grading engine evaluates 42 declarative rules across 11 body systems (cardiovascular, respiratory, renal, hepatic, endocrine, neurological, haematological, musculoskeletal, gastrointestinal, obstetric, and functional capacity) to produce an ASA Physical Status Classification grade (I-VI). Additionally, 20+ safety flags identify issues requiring anaesthetic team attention, such as difficult airway, anticoagulation, malignant hyperthermia risk, and latex allergy.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Enhance backend database migrations and seed data
- Extend clinical safety case documentation
- User acceptance testing with clinical staff
