# Respirology Assessment

Respiratory evaluation using the MRC (Medical Research Council) Dyspnoea Scale with cough assessment, pulmonary function, and exposure history.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: MRC Dyspnoea Scale
- **Range**: 1-5
- **Categories**: 1 = Breathless only with strenuous exercise, 2 = Short of breath hurrying, 3 = Walks slower than peers, 4 = Stops after 100m, 5 = Too breathless to leave house
- **Engine files**: `types.ts`, `mrc-grader.ts`, `mrc-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `mrc-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - Step1Demographics.svelte
2. Chief Complaint - Step2ChiefComplaint.svelte
3. Dyspnoea Assessment - Step3DyspnoeaAssessment.svelte
4. Cough Assessment - Step4CoughAssessment.svelte
5. Respiratory History - Step5RespiratoryHistory.svelte
6. Pulmonary Function - Step6PulmonaryFunction.svelte
7. Current Medications - Step7CurrentMedications.svelte
8. Allergies - Step8Allergies.svelte
9. Smoking & Exposures - Step9SmokingExposures.svelte
10. Sleep & Functional - Step10SleepFunctional.svelte

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
