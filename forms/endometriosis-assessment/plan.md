# Plan: Endometriosis Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The endometriosis assessment uses two complementary scoring systems. The revised ASRM (American Society for Reproductive Medicine) staging system classifies endometriosis severity based on a points-based evaluation of lesion location, depth, extent, and adhesion involvement: Stage I (Minimal, 1-5 points), Stage II (Mild, 6-15 points), Stage III (Moderate, 16-40 points), and Stage IV (Severe, >40 points). The EHP-30 (Endometriosis Health Profile-30) quality of life instrument measures patient-reported impact across five domains: pain, control and powerlessness, emotional well-being, social support, and self-image. Together these provide a comprehensive picture of both anatomical disease burden and patient-experienced quality of life impact, informing treatment decisions and surgical planning.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
