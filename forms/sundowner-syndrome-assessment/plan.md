# Plan: Sundowner Syndrome Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The sundowner syndrome assessment uses two complementary scoring instruments. The Cohen-Mansfield Agitation Inventory (CMAI) is a 29-item scale rating agitation behaviours from 1 (never) to 7 (several times an hour), producing a total score from 29-203. Higher scores indicate more frequent and severe agitation. The Neuropsychiatric Inventory (NPI) evaluates 12 behavioural domains (delusions, hallucinations, agitation, depression, anxiety, euphoria, apathy, disinhibition, irritability, aberrant motor behaviour, night-time behaviour, appetite) with frequency (1-4) multiplied by severity (1-3) per domain, yielding a total score of 0-144. Together these instruments provide a comprehensive picture of sundowning severity, informing care planning and intervention strategies for circadian-related behavioural disturbances in dementia patients.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
