# Orthopaedic Assessment

Musculoskeletal evaluation using the DASH (Disabilities of the Arm, Shoulder and Hand) questionnaire with range of motion and functional assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: DASH Score
- **Range**: 0-100
- **Categories**: 0 = No disability, 100 = Most severe disability
- **Engine files**: `types.ts`, `dash-grader.ts`, `dash-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `dash-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Chief Complaint - `Step2ChiefComplaint.svelte`
3. Pain Assessment - `Step3PainAssessment.svelte`
4. DASH Questionnaire - `Step4DASHQuestionnaire.svelte`
5. Range of Motion - `Step5RangeOfMotion.svelte`
6. Strength Testing - `Step6StrengthTesting.svelte`
7. Functional Limitations - `Step7FunctionalLimitations.svelte`
8. Imaging History - `Step8ImagingHistory.svelte`
9. Current Treatment - `Step9CurrentTreatment.svelte`
10. Surgical History - `Step10SurgicalHistory.svelte`

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
