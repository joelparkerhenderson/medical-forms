# Vaccinations Checklist

Immunisation status tracking for healthcare workers and patients covering routine, occupational, travel, and special circumstance vaccines with compliance scoring and risk stratification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Vaccination Compliance Classification
- **Range**: Fully Immunised, Partially Immunised, Non-Compliant, Contraindicated
- **Risk Levels**: Low, Moderate, High, Critical
- **Engine files**: `types.ts`, `vaccination-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `vaccination-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Vaccination History - `Step2VaccinationHistory.svelte`
3. Childhood Immunisations - `Step3ChildhoodImmunisations.svelte`
4. Occupational Vaccines - `Step4OccupationalVaccines.svelte`
5. Travel Vaccines - `Step5TravelVaccines.svelte`
6. COVID-19 Vaccination - `Step6Covid19Vaccination.svelte`
7. Influenza Vaccination - `Step7InfluenzaVaccination.svelte`
8. Contraindications & Allergies - `Step8ContraindicationsAllergies.svelte`
9. Serology & Immunity Testing - `Step9SerologyImmunityTesting.svelte`
10. Schedule & Compliance - `Step10ScheduleCompliance.svelte`

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
