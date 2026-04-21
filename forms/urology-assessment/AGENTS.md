# Urology Assessment

Urological evaluation using the IPSS (International Prostate Symptom Score) with quality of life assessment, renal function, and sexual health screening.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: IPSS (International Prostate Symptom Score)
- **Range**: 0-35
- **Categories**: 0-7 = Mild, 8-19 = Moderate, 20-35 = Severe symptoms
- **Engine files**: `types.ts`, `ipss-grader.ts`, `ipss-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `ipss-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - Step1Demographics.svelte
2. Chief Complaint - Step2ChiefComplaint.svelte
3. IPSS Questionnaire - Step3IPSSQuestionnaire.svelte
4. Quality of Life - Step4QualityOfLife.svelte
5. Urinary Symptoms - Step5UrinarySymptoms.svelte
6. Renal Function - Step6RenalFunction.svelte
7. Sexual Health - Step7SexualHealth.svelte
8. Medical History - Step8MedicalHistory.svelte
9. Current Medications - Step9CurrentMedications.svelte
10. Family History - Step10FamilyHistory.svelte

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
