# SCORE2-Diabetes

SCORE2-Diabetes predicts 10-year risk of fatal and non-fatal cardiovascular disease in individuals with type 2 diabetes without prior CVD, aged 40-69 years. It extends the SCORE2 model with diabetes-specific predictors (HbA1c, eGFR, and age at diagnosis). Reference: <https://www.mdcalc.com/calc/10510/score2-diabetes>.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Diabetes clinic dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: SCORE2-Diabetes (ESC 2023)
- **Range**: 10-year CVD risk as percentage
- **Age-modified thresholds**: Low / moderate (< 5 %), High (5 - < 10 % / < 7.5 %), Very high (≥ 10 % / ≥ 7.5 %) — depending on age band
- **Engine files**: `types.ts`, `score2-grader.ts`, `score2-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `score2-grader.test.ts`

## Assessment steps (10 total)

1. Patient Demographics - `Step1PatientDemographics.svelte`
2. Diabetes History - `Step2DiabetesHistory.svelte`
3. Cardiovascular History - `Step3CardiovascularHistory.svelte`
4. Blood Pressure - `Step4BloodPressure.svelte`
5. Lipid Profile - `Step5LipidProfile.svelte`
6. Renal Function - `Step6RenalFunction.svelte`
7. Lifestyle Factors - `Step7LifestyleFactors.svelte`
8. Current Medications - `Step8CurrentMedications.svelte`
9. Complications Screening - `Step9ComplicationsScreening.svelte`
10. Risk Assessment Summary - `Step10RiskAssessmentSummary.svelte`

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
- ESC 2023 SCORE2-Diabetes risk chart
