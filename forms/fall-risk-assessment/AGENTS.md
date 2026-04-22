# Fall Risk Assessment

Fall risk evaluation using the Morse Fall Scale (MFS) with comprehensive environmental, medication, mobility, cognitive, and sensory assessments for fall prevention planning.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Morse Fall Scale (MFS)
- **Range**: 0-125
- **Categories**:
  - Low Risk: MFS 0-24
  - Moderate Risk: MFS 25-44
  - High Risk: MFS >= 45
  - Critical: Recurrent falls with injury, anticoagulated patient, or MFS >= 75
- **Engine files**: `types.ts`, `fall-risk-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `fall-risk-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Fall History - `Step2FallHistory.svelte`
3. Morse Fall Scale Assessment - `Step3MorseFallScale.svelte`
4. Mobility & Gait Assessment - `Step4MobilityGait.svelte`
5. Medication Review - `Step5MedicationReview.svelte`
6. Vision & Sensory Assessment - `Step6VisionSensory.svelte`
7. Environmental Assessment - `Step7Environmental.svelte`
8. Cognitive Assessment - `Step8Cognitive.svelte`
9. Previous Interventions - `Step9PreviousInterventions.svelte`
10. Fall Prevention Plan - `Step10FallPreventionPlan.svelte`

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
