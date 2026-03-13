# Plan: Oncology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The ECOG (Eastern Cooperative Oncology Group) Performance Status scale measures a cancer patient's level of functioning and ability to carry out daily activities on a scale of 0 to 5. It is widely used in oncology to assess how a patient's disease is progressing, determine appropriate treatment options, and predict prognosis. The assessment also captures comprehensive cancer diagnosis details, treatment history, symptom burden, side effects, and psychosocial factors to support holistic care planning.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
