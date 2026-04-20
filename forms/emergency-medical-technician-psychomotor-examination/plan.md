# Plan: Emergency Medical Technician Psychomotor Examination

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The psychomotor grader sums point-awarded items across five assessment phases (scene size-up, primary survey, history and secondary assessment, reassessment, critical criteria). Each phase has a maximum point value; the overall candidate passes when the point total exceeds the NREMT minimum and no critical-criteria item is marked. A single critical-criteria failure — such as missing PPE, failing to control major bleeding, or ordering a dangerous intervention — sets the overall result to Fail regardless of points. The engine preserves a structured critical-criteria justification record required by NREMT.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with EMS instructors
