# Dental Assessment

Oral health evaluation using the DMFT (Decayed, Missing, Filled Teeth) Index with periodontal and radiographic assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: DMFT (Decayed, Missing, Filled Teeth) Index
- **Range**: 0-28 (for permanent teeth)
- **Categories**:
  - D: Number of decayed teeth
  - M: Number of missing teeth
  - F: Number of filled teeth
  - Total DMFT: Sum of D + M + F
- **Engine files**: `types.ts`, `dmft-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `dmft-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Chief Complaint - `Step2ChiefComplaint.svelte`
3. Dental History - `Step3DentalHistory.svelte`
4. DMFT Assessment - `Step4DmftAssessment.svelte`
5. Periodontal Assessment - `Step5PeriodontalAssessment.svelte`
6. Oral Examination - `Step6OralExamination.svelte`
7. Medical History - `Step7MedicalHistory.svelte`
8. Current Medications - `Step8CurrentMedications.svelte`
9. Radiographic Findings - `Step9RadiograhicFindings.svelte`

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
