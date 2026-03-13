# Pulmonology Assessment

Respiratory evaluation using GOLD (Global Initiative for Chronic Obstructive Lung Disease) staging with spirometry, exacerbation history, and functional assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: GOLD Stage
- **Range**: I-IV
- **Categories**: I = Mild (FEV1 >= 80%), II = Moderate (50-79%), III = Severe (30-49%), IV = Very severe (<30%)
- **Engine files**: `types.ts`, `gold-grader.ts`, `gold-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `gold-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Chief Complaint - `Step2ChiefComplaint.svelte`
3. Spirometry Results - `Step3Spirometry.svelte`
4. Symptom Assessment - `Step4SymptomAssessment.svelte`
5. Exacerbation History - `Step5ExacerbationHistory.svelte`
6. Current Medications - `Step6CurrentMedications.svelte`
7. Allergies - `Step7Allergies.svelte`
8. Comorbidities - `Step8Comorbidities.svelte`
9. Smoking & Exposures - `Step9SmokingExposures.svelte`
10. Functional Status - `Step10FunctionalStatus.svelte`

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
