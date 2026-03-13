# Plan: Dermatology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The dermatology assessment uses the Dermatology Life Quality Index (DLQI), a validated 10-question patient-reported outcome measure that quantifies the impact of skin disease on quality of life over the preceding week. Each question is scored 0-3, yielding a total score from 0 to 30. The banding system categorises impact as: no effect (0-1), small effect (2-5), moderate effect (6-10), very large effect (11-20), and extremely large effect (21-30). The DLQI is widely used in clinical practice to guide treatment decisions, monitor therapeutic response, and support access to biological therapies where threshold scores are required for eligibility. The assessment also captures structured lesion characterisation data including morphology, distribution, and body surface area involvement.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
