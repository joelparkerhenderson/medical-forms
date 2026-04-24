# Plan: Outpatient Outcome Report

## Current status

Design spec complete (`docs/superpowers/specs/2026-04-23-outpatient-outcome-report-design.md`). Scaffolding and SQL migrations in progress. Front-end and Rust step-by-step implementations deferred.

## Scoring engine

The Outpatient Outcome Composite Grade (OOCG) takes four independent domain grades (clinical outcome classification, PROM composite, PREM FFT response, operational attendance+wait-time) on an A–E scale and emits the worst of the four as the overall grade. Flagged issues include DNA, any PROM worsening, FFT Poor/Very Poor, wait time over target, clinical Worsened/Died, and data-quality gaps in PROM/PREM/attendance fields.

## Future enhancements

- Implement interactive SvelteKit wizard with reactive assessment store
- Implement Vitest unit tests for OOCG grader
- Implement Rust full-stack with Loco.rs scaffolded entities
- Add PROMIS official T-score calibration tables
- Obtain EuroQol EQ-5D-5L licence for production use
- Add autosave to localStorage
- Add i18n support
- Clinical safety case documentation
