# Plan: Encounter Satisfaction

## Current status

Not yet implemented. Directory structure exists but no code has been written.

## Implementation plan

Follow the same patterns as dermatology-assessment (canonical template):

1. Create front-end-patient-form-with-svelte/ with all engine files, step components, and routes
2. Create front-end-clinician-dashboard-with-svelte/ with SVAR DataGrid
3. Create back-end-with-rust-axum-loco-json/ with Rust engine types
4. Add Vitest unit tests for grading logic

## Planned scoring system

The scoring approach has not yet been finalised. A composite satisfaction score is anticipated, likely using Likert-scale responses (e.g. 1-5 or 0-10) across multiple dimensions of the patient encounter such as communication quality, wait time, care environment, staff professionalism, and overall satisfaction. The design phase should evaluate established patient satisfaction instruments (e.g. HCAHPS, PSQ-18) for potential adaptation.
