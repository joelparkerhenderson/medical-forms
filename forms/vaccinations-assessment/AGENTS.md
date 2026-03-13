# Vaccinations Assessment

Immunisation schedule compliance assessment covering childhood, adult, travel, and occupational vaccinations with contraindication screening.

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

- **Instrument**: Immunisation Schedule Compliance
- **Scope**: Vaccination status tracking, catch-up schedule generation, contraindication screening
- **Planned steps**: Demographics, Childhood Vaccinations, Adult Vaccinations, Travel Vaccinations, Occupational Vaccinations, Allergy & Contraindications, Immunocompromised Screen, Previous Adverse Reactions, Current Health Status, Schedule & Recommendations

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
