# Predicting Risk of Cardiovascular Disease Events (PREVENT)

AHA PREVENT risk calculator predicting 10- and 30-year risk of total cardiovascular disease (and its subtypes atherosclerotic CVD and heart failure) in patients aged 30-79 without known CVD. Reference: <https://www.mdcalc.com/calc/10491/predicting-risk-cardiovascular-disease-events-prevent>

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: AHA PREVENT equations (2023)
- **Range**: 10-year and 30-year risk as percentages (0.0-100.0%)
- **Predicted outcomes**: total CVD, atherosclerotic CVD (ASCVD), heart failure (HF)
- **Categories** (10-year total CVD): Low (< 5 %), Borderline (5 - < 7.5 %), Intermediate (7.5 - < 20 %), High (≥ 20 %)
- **Engine files**: `types.ts`, `prevent-grader.ts`, `prevent-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `prevent-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Blood Pressure - `Step2BloodPressure.svelte`
3. Cholesterol & Lipids - `Step3CholesterolLipids.svelte`
4. Metabolic Health - `Step4MetabolicHealth.svelte`
5. Renal Function - `Step5RenalFunction.svelte`
6. Smoking History - `Step6SmokingHistory.svelte`
7. Medical History - `Step7MedicalHistory.svelte`
8. Current Medications - `Step8CurrentMedications.svelte`
9. Review & Calculate - `Step9ReviewCalculate.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF report generation via /report/pdf server endpoint
- Vitest unit tests for grading logic

## Clinician dashboard

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
