# Plan: Gastroenterology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The GI Symptom Severity Score evaluates gastrointestinal symptoms across upper GI, lower GI, abdominal pain, and hepatopancreatic domains. It measures symptom frequency, intensity, and functional impact to produce a composite severity score. Red flag symptoms such as unexplained weight loss, dysphagia, or GI bleeding are detected separately to trigger urgent clinical review.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
