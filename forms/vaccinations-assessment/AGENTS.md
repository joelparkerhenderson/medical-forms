# Vaccinations Assessment

Immunisation-schedule compliance assessment covering childhood, adult, travel, and occupational vaccinations, with contraindication screening, consent capture, and administration record. Aligned with the UK Green Book (Immunisation against infectious disease).

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Immunisation nurse dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: Immunisation Schedule Compliance (UK Green Book)
- **Range**: Compliant / Partial / Non-compliant
- **Engine files**: `types.ts`, `vaccinations-grader.ts`, `vaccinations-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `vaccinations-grader.test.ts`

## Assessment steps (10 total)

1. Patient Information - `Step1PatientInformation.svelte`
2. Immunisation History - `Step2ImmunizationHistory.svelte`
3. Childhood Vaccinations - `Step3ChildhoodVaccinations.svelte`
4. Adult Vaccinations - `Step4AdultVaccinations.svelte`
5. Travel Vaccinations - `Step5TravelVaccinations.svelte`
6. Occupational Vaccinations - `Step6OccupationalVaccinations.svelte`
7. Contraindications & Allergies - `Step7ContraindicationsAllergies.svelte`
8. Consent & Information - `Step8ConsentInformation.svelte`
9. Administration Record - `Step9AdministrationRecord.svelte`
10. Clinical Review - `Step10ClinicalReview.svelte`

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
- UK Green Book (Immunisation against infectious disease)
