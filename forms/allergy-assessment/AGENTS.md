# Allergy Assessment

Comprehensive allergy evaluation covering drug, food, and environmental allergies with anaphylaxis risk assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Allergy Severity
- **Range**: Four-level categorical (Low, Moderate, High, Critical)
- **Categories**: Low (mild localised reactions only), Moderate (systemic but non-life-threatening reactions), High (severe reactions or multiple allergen categories), Critical (history of anaphylaxis or life-threatening reactions)
- **Engine files**: `types.ts`, `allergy-grader.ts`, `allergy-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `allergy-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Allergy History - `Step2AllergyHistory.svelte`
3. Drug Allergies - `Step3DrugAllergies.svelte`
4. Food Allergies - `Step4FoodAllergies.svelte`
5. Environmental Allergies - `Step5EnvironmentalAllergies.svelte`
6. Anaphylaxis History - `Step6AnaphylaxisHistory.svelte`
7. Testing Results - `Step7TestingResults.svelte`
8. Current Management - `Step8CurrentManagement.svelte`
9. Comorbidities - `Step9Comorbidities.svelte`
10. Impact & Action Plan - `Step10ImpactActionPlan.svelte`

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
