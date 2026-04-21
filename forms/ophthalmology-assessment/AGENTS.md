# Ophthalmology Assessment

Ophthalmic evaluation covering visual acuity, anterior and posterior segment examination, visual fields, and functional impact assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Visual Acuity Grade
- **Range**: Graded by visual acuity level
- **Categories**: Based on best-corrected visual acuity measurements and functional impact
- **Engine files**: `types.ts`, `va-grader.ts`, `va-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `va-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Chief Complaint - `Step2ChiefComplaint.svelte`
3. Visual Acuity - `Step3VisualAcuity.svelte`
4. Ocular History - `Step4OcularHistory.svelte`
5. Anterior Segment - `Step5AnteriorSegment.svelte`
6. Posterior Segment - `Step6PosteriorSegment.svelte`
7. Visual Field & Pupils - `Step7VisualFieldPupils.svelte`
8. Current Medications - `Step8CurrentMedications.svelte`
9. Systemic Conditions - `Step9SystemicConditions.svelte`
10. Functional Impact - `Step10FunctionalImpact.svelte`

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
