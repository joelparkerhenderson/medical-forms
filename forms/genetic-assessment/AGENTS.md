# Genetic Assessment

Genetic counselling referral assessment using weighted risk factor scoring across cancer genetics, cardiovascular genetics, neurogenetics, and reproductive genetics.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Risk Stratification (Low/Moderate/High)
- **Range**: 0-6+
- **Categories**: 0-2 = Low, 3-5 = Moderate, 6+ = High
- **Engine files**: `types.ts`, `risk-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `risk-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - Step1Demographics.svelte
2. Referral Information - Step2ReferralInformation.svelte
3. Personal Medical History - Step3PersonalMedicalHistory.svelte
4. Cancer History - Step4CancerHistory.svelte
5. Family Pedigree - Step5FamilyPedigree.svelte
6. Cardiovascular Genetics - Step6CardiovascularGenetics.svelte
7. Neurogenetics - Step7Neurogenetics.svelte
8. Reproductive Genetics - Step8ReproductiveGenetics.svelte
9. Ethnic Background & Consanguinity - Step9EthnicBackgroundAndConsanguinity.svelte
10. Genetic Testing History - Step10GeneticTestingHistory.svelte

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
