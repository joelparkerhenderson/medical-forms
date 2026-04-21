# Mobility Assessment

Balance and gait evaluation using the Tinetti Assessment Tool (Performance-Oriented Mobility Assessment) with fall risk stratification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Tinetti Assessment Tool
- **Range**: 0-28
- **Categories**: <19 = High fall risk, 19-24 = Moderate risk, 25-28 = Low risk
- **Engine files**: `types.ts`, `tinetti-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `tinetti-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Referral Information - `Step2ReferralInformation.svelte`
3. Fall History - `Step3FallHistory.svelte`
4. Balance Assessment - `Step4BalanceAssessment.svelte`
5. Gait Assessment - `Step5GaitAssessment.svelte`
6. Timed Up and Go - `Step6TimedUpAndGo.svelte`
7. Range of Motion - `Step7RangeOfMotion.svelte`
8. Assistive Devices - `Step8AssistiveDevices.svelte`
9. Current Medications - `Step9CurrentMedications.svelte`
10. Functional Independence - `Step10FunctionalIndependence.svelte`

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
