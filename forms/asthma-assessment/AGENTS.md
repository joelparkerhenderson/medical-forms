# Asthma Assessment

Asthma control evaluation using the ACT (Asthma Control Test) scoring instrument.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: ACT Score (Asthma Control Test)
- **Range**: 5-25 (sum of 5 questions, each scored 1-5)
- **Categories**: <=15 = Not well controlled, 16-19 = Not well controlled, 20-25 = Well controlled
- **Engine files**: `types.ts`, `act-grader.ts`, `act-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `act-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Symptom Frequency - `Step2SymptomFrequency.svelte`
3. Lung Function - `Step3LungFunction.svelte`
4. Triggers - `Step4Triggers.svelte`
5. Current Medications - `Step5CurrentMedications.svelte`
6. Allergies - `Step6Allergies.svelte`
7. Exacerbation History - `Step7ExacerbationHistory.svelte`
8. Comorbidities - `Step8Comorbidities.svelte`
9. Social History - `Step9SocialHistory.svelte`

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
