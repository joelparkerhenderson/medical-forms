# Plan: Mobility Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Tinetti Assessment Tool (Performance-Oriented Mobility Assessment) evaluates balance and gait to determine fall risk. The balance section scores sitting balance, rising from a chair, standing stability, and turning, while the gait section assesses initiation, step length, step symmetry, and trunk sway. The combined score (0-28) stratifies patients into high, moderate, or low fall risk categories to guide intervention planning.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
