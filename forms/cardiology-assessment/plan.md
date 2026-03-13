# Plan: Cardiology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The cardiology assessment uses two complementary classification systems. The CCS (Canadian Cardiovascular Society) Angina Classification grades angina severity from Class I (angina only with strenuous or prolonged exertion) through Class IV (inability to perform any physical activity without angina, or angina at rest). The NYHA (New York Heart Association) Heart Failure Classification grades functional limitation from Class I (no limitation) through Class IV (symptoms at rest). Together these provide a comprehensive picture of cardiovascular functional status covering both ischaemic chest pain and heart failure symptomatology, informing treatment decisions and risk stratification.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
