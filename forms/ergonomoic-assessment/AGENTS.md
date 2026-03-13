# Ergonomoic Assessment

## Status

Not yet implemented. Directory structure exists but no code has been written.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-html/ - Patient form (HTML)
- ./front-end-patient-form-with-svelte/ - Patient form (SvelteKit)
- ./front-end-clinician-dashboard-with-html/ - Clinician dashboard (HTML)
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard (SvelteKit)
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack (Rust + Tera)

## Conventions

- Empty string '' for unanswered text fields
- null for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named StepNName.svelte (1-indexed)
- UI components in src/lib/components/ui/
