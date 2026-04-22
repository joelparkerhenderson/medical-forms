# Gerontology Assessment

Elderly patient assessment using the Clinical Frailty Scale (CFS) with functional, cognitive, mobility, nutrition, and polypharmacy evaluation.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: CFS (Clinical Frailty Scale)
- **Range**: 1-9
- **Categories**: 1 = Very fit, 4 = Vulnerable, 7 = Severely frail, 9 = Terminally ill
- **Engine files**: `types.ts`, `cfs-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `cfs-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - Step1Demographics.svelte
2. Functional Assessment - Step2FunctionalAssessment.svelte
3. Cognitive Screen - Step3CognitiveScreen.svelte
4. Mobility & Falls - Step4MobilityAndFalls.svelte
5. Nutrition - Step5Nutrition.svelte
6. Polypharmacy Review - Step6PolypharmacyReview.svelte
7. Comorbidities - Step7Comorbidities.svelte
8. Psychosocial - Step8Psychosocial.svelte
9. Continence & Skin - Step9ContinenceAndSkin.svelte

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
