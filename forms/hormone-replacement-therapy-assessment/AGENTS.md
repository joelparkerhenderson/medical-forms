# Hormone Replacement Therapy Assessment

HRT eligibility and symptom assessment using the MRS (Menopause Rating Scale) covering vasomotor, bone, cardiovascular, and breast health.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: MRS (Menopause Rating Scale)
- **Range**: Composite score across somatic, psychological, and urogenital subscales
- **Categories**: Based on subscale and total severity ratings
- **Engine files**: `types.ts`, `mrs-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `mrs-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - Step1Demographics.svelte
2. Menopause Status - Step2MenopauseStatus.svelte
3. MRS Symptom Scale - Step3MrsSymptomScale.svelte
4. Vasomotor Symptoms - Step4VasomotorSymptoms.svelte
5. Bone Health - Step5BoneHealth.svelte
6. Cardiovascular Risk - Step6CardiovascularRisk.svelte
7. Breast Health - Step7BreastHealth.svelte
8. Current Medications - Step8CurrentMedications.svelte
9. Contraindications Screen - Step9ContraindicationsScreen.svelte
10. Treatment Preferences - Step10TreatmentPreferences.svelte

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
