# Prenatal Assessment

Antenatal evaluation covering pregnancy details, obstetric history, vital signs, laboratory results, and mental health screening with risk stratification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Risk Stratification
- **Range**: Low / Moderate / High
- **Categories**: Low = uncomplicated pregnancy, Moderate = risk factors requiring monitoring, High = significant risk factors requiring specialist referral
- **Engine files**: `types.ts`, `risk-grader.ts`, `risk-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `risk-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Pregnancy Details - `Step2PregnancyDetails.svelte`
3. Obstetric History - `Step3ObstetricHistory.svelte`
4. Medical History - `Step4MedicalHistory.svelte`
5. Current Symptoms - `Step5CurrentSymptoms.svelte`
6. Vital Signs - `Step6VitalSigns.svelte`
7. Laboratory Results - `Step7LaboratoryResults.svelte`
8. Lifestyle & Nutrition - `Step8LifestyleNutrition.svelte`
9. Mental Health Screening - `Step9MentalHealth.svelte`
10. Birth Plan Preferences - `Step10BirthPlan.svelte`

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
