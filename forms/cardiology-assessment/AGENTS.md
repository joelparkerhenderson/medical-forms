# Cardiology Assessment

Cardiovascular evaluation using CCS Angina Classification and NYHA Heart Failure Classification with comprehensive cardiac risk profiling.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: CCS Angina Classification + NYHA Heart Failure Classification
- **Range**: CCS Angina Class I-IV, NYHA Heart Failure Class I-IV
- **Categories**:
  - CCS I: Angina only with strenuous exertion
  - CCS II: Slight limitation of ordinary activity
  - CCS III: Marked limitation of ordinary activity
  - CCS IV: Angina at rest or with any physical activity
  - NYHA I: No limitation of physical activity
  - NYHA II: Slight limitation; comfortable at rest
  - NYHA III: Marked limitation; comfortable only at rest
  - NYHA IV: Unable to carry on any physical activity without discomfort
- **Engine files**: `types.ts`, `cardio-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `cardio-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Chest Pain / Angina - `Step2ChestPainAngina.svelte`
3. Heart Failure Symptoms - `Step3HeartFailureSymptoms.svelte`
4. Cardiac History - `Step4CardiacHistory.svelte`
5. Arrhythmia & Conduction - `Step5ArrhythmiaConduction.svelte`
6. Risk Factors - `Step6RiskFactors.svelte`
7. Diagnostic Results - `Step7DiagnosticResults.svelte`
8. Current Medications - `Step8CurrentMedications.svelte`
9. Allergies - `Step9Allergies.svelte`
10. Social & Functional - `Step10SocialFunctional.svelte`

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
