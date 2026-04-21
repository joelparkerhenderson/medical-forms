# Cognitive Assessment

Cognitive function screening using the MMSE (Mini-Mental State Examination) with functional impact assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: MMSE (Mini-Mental State Examination)
- **Range**: 0-30
- **Categories**:
  - 24-30: Normal cognition
  - 18-23: Mild cognitive impairment
  - 0-17: Severe cognitive impairment
- **Engine files**: `types.ts`, `mmse-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `mmse-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Referral Information - `Step2ReferralInformation.svelte`
3. Orientation (Time & Place) - `Step3OrientationTimePlacee.svelte`
4. Registration - `Step4Registration.svelte`
5. Attention & Calculation - `Step5AttentionCalculation.svelte`
6. Recall - `Step6Recall.svelte`
7. Language - `Step7Language.svelte`
8. Repetition & Commands - `Step8RepetitionCommands.svelte`
9. Visuospatial - `Step9Visuospatial.svelte`
10. Functional History - `Step10FunctionalHistory.svelte`

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
