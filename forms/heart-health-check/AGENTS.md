# Heart Health Check

NHS Heart Health Check for cardiovascular risk assessment using simplified QRISK3-based scoring with 10-year CVD risk estimation and heart age calculation.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./doc/ - Additional documentation
- ./front-end-patient-form-with-html/ - Patient form; HTML + CSS + vanilla JS
- ./front-end-clinician-dashboard-with-html/ - Clinician dashboard; HTML + CSS + vanilla JS
- ./front-end-patient-form-with-svelte/ - Patient form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack backend; Rust + Loco 0.16 + Tera
- ./sql-migrations/ - PostgreSQL schema migrations (15 files)

## Scoring system

- **Instrument**: Simplified QRISK3-based cardiovascular risk
- **Range**: 0.1–95.0% (10-year CVD risk percentage)
- **Categories**: Draft (age/sex missing), Low (<10%), Moderate (10–19.9%), High (>=20%)
- **Heart age**: Age at which an average person (non-smoker, BP 120, TC/HDL 4.0) matches the patient's risk
- **Engine files**: `types.ts`, `risk-calculator.ts`, `risk-grader.ts`, `risk-rules.ts`, `flagged-issues.ts`, `utils.ts`

## Assessment steps (10 total)

1. Patient Information - `Step1PatientInformation.svelte`
2. Demographics & Ethnicity - `Step2DemographicsEthnicity.svelte`
3. Blood Pressure - `Step3BloodPressure.svelte`
4. Cholesterol - `Step4Cholesterol.svelte`
5. Medical Conditions - `Step5MedicalConditions.svelte`
6. Family History - `Step6FamilyHistory.svelte`
7. Smoking & Alcohol - `Step7SmokingAlcohol.svelte`
8. Physical Activity & Diet - `Step8PhysicalActivityDiet.svelte`
9. Body Measurements - `Step9BodyMeasurements.svelte`
10. Review & Calculate - `Step10ReviewCalculate.svelte`

## Risk factor point contributions

- **Age**: (age - 25) * 0.8 (male) or * 0.6 (female)
- **Smoking**: heavy 15, moderate 10, light 5, ex-smoker 2
- **Systolic BP**: (SBP - 100) * 0.15; +5 if SD > 10
- **TC/HDL ratio**: (ratio - 3) * 3
- **Diabetes**: type 1 = 20, type 2 = 15
- **AF**: 10, **CKD**: 10, **RA**: 5, **Family CVD <60**: 10
- **BMI >25**: (BMI - 25) * 0.5
- **Townsend >0**: townsend * 1.5
- **Medications**: BP treatment +3, antipsychotic +3, corticosteroids +5
- **Other**: migraine +3, severe mental illness +3, erectile dysfunction (male) +5

## 20 HHC risk rules

**High risk (HHC-001–005):** 10-year risk >=20%, type 1 diabetes age 40+, systolic BP >=180, CKD with diabetes, three or more major risk factors

**Medium risk (HHC-006–015):** 10-year risk 10–19.9%, current smoker, type 2 diabetes, atrial fibrillation, systolic BP 140–179, TC/HDL ratio >=6, CKD stage 3+, BMI >=30, family CVD under 60, heart age 10+ years above chronological

**Low risk / positive (HHC-016–020):** Non-smoker, normal BP (<120/80) without treatment, optimal TC/HDL ratio (<4), physically active (150+ min/week), normal BMI (18.5–24.9)

## 13 additional flags

FLAG-AGE-001 (eligibility), FLAG-BP-001/002 (hypertension), FLAG-CHOL-001 (dyslipidaemia), FLAG-DM-001 (diabetes management), FLAG-CKD-001 (renal), FLAG-SMOKE-001 (heavy smoker), FLAG-AF-001 (anticoagulation), FLAG-BMI-001 (morbid obesity), FLAG-AUDIT-001 (alcohol), FLAG-HEART-001 (heart age gap), FLAG-MED-001 (statin indication), FLAG-INACT-001 (sedentary)

Sorted by priority: high > medium > low.

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
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
- camelCase property names in TypeScript/JavaScript
- snake_case column names in PostgreSQL
- Step components named StepNName.svelte (1-indexed)
- UI components in src/lib/components/ui/

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
