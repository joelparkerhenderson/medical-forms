# Endocrinology Assessment

General endocrinology consultation assessment covering the thyroid, adrenal, glucose, reproductive, pituitary, and bone/calcium axes, integrating symptom review, clinical examination, and laboratory findings to characterise endocrine disturbance and guide management.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Endocrinology clinic dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Endocrine Symptom & Biochemical Review
- **Range**: Normal / Subclinical / Mild / Moderate / Severe disturbance per axis
- **Axes**: Thyroid, Adrenal, Glucose, Reproductive, Pituitary, Bone & Calcium
- **Engine files**: `types.ts`, `endocrine-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `endocrine-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Presenting Symptoms - `Step2PresentingSymptoms.svelte`
3. Thyroid Axis Review - `Step3ThyroidAxisReview.svelte`
4. Adrenal Axis Review - `Step4AdrenalAxisReview.svelte`
5. Glucose Metabolism - `Step5GlucoseMetabolism.svelte`
6. Reproductive Axis - `Step6ReproductiveAxis.svelte`
7. Pituitary Function - `Step7PituitaryFunction.svelte`
8. Bone & Calcium - `Step8BoneCalcium.svelte`
9. Medications & Lifestyle Review - `Step9MedicationsLifestyleReview.svelte`
10. Clinical Impression & Management Plan - `Step10ClinicalImpressionManagementPlan.svelte`

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
