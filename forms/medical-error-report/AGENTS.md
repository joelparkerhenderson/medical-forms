# Medical Error Report

Medical error reporting form for incident documentation, root cause analysis, and patient safety improvement. Uses WHO severity scale and NCC MERP harm categories.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: WHO Severity Scale + NCC MERP Harm Categories
- **WHO Severity Scale**: Near Miss, Mild, Moderate, Severe, Critical
- **NCC MERP Categories**: A through I
- **Engine files**: `types.ts`, `error-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `error-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Incident Details - `Step2IncidentDetails.svelte`
3. Patient Involvement - `Step3PatientInvolvement.svelte`
4. Error Classification - `Step4ErrorClassification.svelte`
5. Contributing Factors - `Step5ContributingFactors.svelte`
6. Immediate Actions Taken - `Step6ImmediateActions.svelte`
7. Patient Outcome - `Step7PatientOutcome.svelte`
8. Root Cause Analysis - `Step8RootCauseAnalysis.svelte`
9. Corrective Actions - `Step9CorrectiveActions.svelte`
10. Reporting & Follow-up - `Step10ReportingFollowup.svelte`

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
