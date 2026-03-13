# Pediatric Assessment

Child development screening covering birth history, growth, developmental milestones, immunisation status, and family environment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Developmental Screen
- **Range**: Pass / Concern / Refer
- **Categories**: Based on developmental milestone achievement, growth parameters, and environmental risk factors
- **Engine files**: `types.ts`, `dev-grader.ts`, `dev-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `dev-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Birth History - `Step2BirthHistory.svelte`
3. Growth & Nutrition - `Step3GrowthNutrition.svelte`
4. Developmental Milestones - `Step4DevelopmentalMilestones.svelte`
5. Immunization Status - `Step5ImmunizationStatus.svelte`
6. Medical History - `Step6MedicalHistory.svelte`
7. Current Medications - `Step7CurrentMedications.svelte`
8. Family History - `Step8FamilyHistory.svelte`
9. Social & Environmental - `Step9SocialEnvironmental.svelte`

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
