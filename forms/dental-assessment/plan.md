# Plan: Dental Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The dental assessment uses the DMFT (Decayed, Missing, Filled Teeth) Index, a standard epidemiological measure of dental caries experience in the permanent dentition. The index counts the total number of teeth that are decayed (D), missing due to caries (M), and filled (F), producing a cumulative score from 0 to 28 (excluding third molars). The DMFT score provides a quantitative summary of past and present caries experience, enabling clinicians to assess oral health status, track disease progression over time, and prioritise treatment planning. The grader also incorporates periodontal assessment findings and radiographic data to generate a comprehensive oral health profile.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
