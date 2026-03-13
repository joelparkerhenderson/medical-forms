# Plan: Kinesiology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The FMS (Functional Movement Screen) is a standardised assessment of fundamental movement patterns using 7 tests: deep squat, hurdle step, in-line lunge, shoulder mobility, active straight leg raise, trunk stability push-up, and rotary stability. Each test is scored 0-3, yielding a composite score from 0 to 21. Scores of 0-14 indicate increased injury risk, 15-17 indicate moderate risk, and 18-21 indicate low risk, with any score of 0 on an individual test flagging pain during movement that requires clinical attention.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
