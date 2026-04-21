# Framingham Risk Score for Hard Coronary Heart Disease

Estimates 10-year risk of hard coronary heart disease events (myocardial infarction or coronary death) in patients aged 30-79 years with no history of coronary heart disease or diabetes. Uses the 'Hard' Framingham outcomes model from the Framingham Heart Study. Reference: <https://www.mdcalc.com/calc/38/framingham-risk-score-hard-coronary-heart-disease>.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Cardiology clinic dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: Framingham Hard CHD Risk Score (Wilson 1998 / ATP III)
- **Range**: 10-year risk as percentage (< 1 % - 30 %+)
- **Categories**:
  - Low: < 10 %
  - Moderate: 10 - < 20 %
  - High: ≥ 20 %
- **Engine files**: `types.ts`, `framingham-grader.ts`, `framingham-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `framingham-grader.test.ts`

## Assessment steps (10 total)

1. Patient Information - `Step1PatientInformation.svelte`
2. Demographics - `Step2Demographics.svelte`
3. Smoking History - `Step3SmokingHistory.svelte`
4. Blood Pressure - `Step4BloodPressure.svelte`
5. Cholesterol - `Step5Cholesterol.svelte`
6. Medical History - `Step6MedicalHistory.svelte`
7. Family History - `Step7FamilyHistory.svelte`
8. Lifestyle Factors - `Step8LifestyleFactors.svelte`
9. Current Medications - `Step9CurrentMedications.svelte`
10. Review & Calculate - `Step10ReviewCalculate.svelte`

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
- ATP III / Framingham Heart Study risk equations
