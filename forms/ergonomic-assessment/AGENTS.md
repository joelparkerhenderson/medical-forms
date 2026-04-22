# Ergonomic Assessment

Workplace ergonomic evaluation using the REBA (Rapid Entire Body Assessment) for musculoskeletal risk.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: REBA (Rapid Entire Body Assessment)
- **Range**: 1-15
- **Categories**:
  - 1: Negligible risk, no action required
  - 2-3: Low risk, change may be needed
  - 4-7: Medium risk, further investigation and change soon
  - 8-10: High risk, investigate and implement change
  - 11-15: Very high risk, implement change immediately
- **Engine files**: `types.ts`, `reba-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `reba-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Workstation Setup - `Step2WorkstationSetup.svelte`
3. Posture Assessment - `Step3PostureAssessment.svelte`
4. Repetitive Tasks - `Step4RepetitiveTasks.svelte`
5. Manual Handling - `Step5ManualHandling.svelte`
6. Current Symptoms - `Step6CurrentSymptoms.svelte`
7. Medical History - `Step7MedicalHistory.svelte`
8. Current Interventions - `Step8CurrentInterventions.svelte`
9. Psychosocial Factors - `Step9PsychosocialFactors.svelte`
10. Recommendations & Action Plan - `Step10RecommendationsActionPlan.svelte`

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
