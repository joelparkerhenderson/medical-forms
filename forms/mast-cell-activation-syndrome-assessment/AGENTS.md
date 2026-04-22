# Mast Cell Activation Syndrome (MCAS) Assessment

MCAS symptom evaluation across dermatological, gastrointestinal, cardiovascular, respiratory, and neurological systems with trigger identification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Symptom Score
- **Range**: Cumulative symptom severity score
- **Categories**: Scored across multiple organ systems (dermatological, gastrointestinal, cardiovascular, respiratory, neurological) with trigger pattern analysis
- **Engine files**: `types.ts`, `symptom-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `symptom-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Symptom Overview - `Step2SymptomOverview.svelte`
3. Dermatological Symptoms - `Step3DermatologicalSymptoms.svelte`
4. Gastrointestinal Symptoms - `Step4GastrointestinalSymptoms.svelte`
5. Cardiovascular Symptoms - `Step5CardiovascularSymptoms.svelte`
6. Respiratory Symptoms - `Step6RespiratorySymptoms.svelte`
7. Neurological Symptoms - `Step7NeurologicalSymptoms.svelte`
8. Triggers & Patterns - `Step8TriggersAndPatterns.svelte`
9. Laboratory Results - `Step9LaboratoryResults.svelte`
10. Current Treatment - `Step10CurrentTreatment.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF report generation via /report/pdf server endpoint
- Vitest unit tests for grading logic

## Dashboard

- SVAR DataGrid (@svar-ui/svelte-grid) with Willow theme
- Sortable columns and dropdown filters
- Backend API client with sample data fallback

## Backend

- Rust edition 2024 with Loco 0.16 framework
- axum 0.8 web framework
- SeaORM 1.1 with PostgreSQL
- Engine types mirror TypeScript with serde(rename_all = "camelCase")

## Conventions

- Empty string '' for unanswered text fields
- null for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named StepNName.svelte (1-indexed)
- UI components in src/lib/components/ui/

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
