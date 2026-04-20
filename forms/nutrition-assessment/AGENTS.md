# Nutrition Assessment

Nutritional status evaluation using the Malnutrition Universal Screening Tool (MUST) with comprehensive dietary, swallowing, gastrointestinal, and nutritional support assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Malnutrition Universal Screening Tool (MUST)
- **MUST Steps**:
  - Step 1: BMI score (0 = BMI >20, 1 = BMI 18.5-20, 2 = BMI <18.5)
  - Step 2: Unplanned weight loss score (0 = <5%, 1 = 5-10%, 2 = >10%)
  - Step 3: Acute disease effect score (0 = none, 2 = acutely ill with no intake >5 days)
- **Total score**: 0 = low risk, 1 = medium risk, >=2 = high risk
- **Severity levels**: low (well-nourished), moderate (at risk), high (malnourished), critical (severe malnutrition with complications)
- **Engine files**: `types.ts`, `nutrition-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `nutrition-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Anthropometric Measurements - `Step2AnthropometricMeasurements.svelte`
3. Dietary History - `Step3DietaryHistory.svelte`
4. Nutritional Screening (MUST) - `Step4NutritionalScreening.svelte`
5. Swallowing & Oral Health - `Step5SwallowingOralHealth.svelte`
6. Gastrointestinal Function - `Step6GastrointestinalFunction.svelte`
7. Food Allergies & Intolerances - `Step7FoodAllergiesIntolerances.svelte`
8. Nutritional Requirements - `Step8NutritionalRequirements.svelte`
9. Current Nutritional Support - `Step9CurrentNutritionalSupport.svelte`
10. Care Plan & Monitoring - `Step10CarePlanMonitoring.svelte`

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
