# Hematology Assessment

Haematological evaluation for blood disorders, anaemia screening, coagulation assessment, and complete blood count interpretation.

## Status

Not yet implemented. Directory structure exists but no code has been written.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire (to be built)
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard (to be built)
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option (to be built)

## Planned scoring system

- **Instrument**: CBC Interpretation / Haematological Risk Score
- **Scope**: Anaemia classification, coagulation screen, white cell differential, platelet assessment
- **Planned steps**: Demographics, Presenting Symptoms, Bleeding History, CBC Results, Iron Studies, Coagulation Screen, Blood Film, Transfusion History, Current Medications, Comorbidities

## Planned architecture

Follow the same patterns as other projects in this monorepo (see ../dermatology-assessment/ as template):

- SvelteKit 2.x with Svelte 5 runes
- Tailwind CSS 4
- Pure scoring engine
- SVAR DataGrid clinician dashboard
- Rust + Loco backend

## Conventions

- Empty string '' for unanswered text fields
- null for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named StepNName.svelte (1-indexed)
- UI components in src/lib/components/ui/
