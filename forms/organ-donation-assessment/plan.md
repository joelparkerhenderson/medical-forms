# Plan: Organ Donation Assessment

## Current status

Implemented. Patient form and clinician dashboard created.

## Scoring engine

The organ donation assessment uses a donor risk index combined with organ-specific suitability scoring. The assessment evaluates both living and deceased donors across multiple domains: medical history, organ function (renal, hepatic, cardiac, pulmonary), infectious disease screening, immunological compatibility (HLA typing, crossmatch, PRA), and surgical fitness. Eligibility is classified as suitable (ideal donor), conditionally suitable (expanded criteria donor), or unsuitable (absolute contraindications). Risk is stratified as low (ideal donor profile), moderate (expanded criteria), high (marginal organ function), or critical (contraindicated). Living donors additionally require psychological assessment to ensure voluntary informed consent without coercion.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
