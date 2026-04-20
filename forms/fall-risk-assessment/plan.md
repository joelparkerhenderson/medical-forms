# Plan: Fall Risk Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The fall risk assessment uses the Morse Fall Scale (MFS), a validated tool for predicting patient fall risk. The MFS evaluates six components: history of falling (0/25 points), secondary diagnosis (0/15 points), ambulatory aid (0/15/30 points), IV/heparin lock (0/20 points), gait (0/10/20 points), and mental status (0/15 points). Total scores range from 0 to 125. Patients scoring 0-24 are low risk, 25-44 moderate risk, and 45 or above high risk. The assessment also incorporates environmental hazard screening, medication review (sedatives, antihypertensives, polypharmacy), mobility and gait evaluation, vision and sensory assessment, cognitive screening, and a fall prevention plan to provide a comprehensive falls prevention strategy.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
