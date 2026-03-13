# Plan: Occupational Therapy Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The COPM (Canadian Occupational Performance Measure) is a client-centred outcome measure that evaluates occupational performance across three domains: self-care, productivity, and leisure. Patients rate both their performance (1-10) and satisfaction (1-10) for each identified occupational issue, enabling clinicians to track changes over time. Scores below 5 indicate significant issues requiring intervention, while scores above 7 suggest good functional performance.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
