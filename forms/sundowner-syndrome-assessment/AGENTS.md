# Sundowner Syndrome Assessment

Sundowner syndrome (sundowning) evaluation using Cohen-Mansfield Agitation Inventory (CMAI) scoring and Neuropsychiatric Inventory (NPI) for behavioural symptoms in elderly patients, particularly those with dementia.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instruments**: Cohen-Mansfield Agitation Inventory (CMAI) + Neuropsychiatric Inventory (NPI)
- **CMAI Range**: 29-203 (29 items scored 1-7)
- **NPI Range**: 0-144 (12 domains, frequency x severity)
- **Severity Categories**:
  - Mild: Occasional restlessness, redirectable, CMAI 29-45
  - Moderate: Daily episodes, requires intervention, CMAI 46-75
  - Severe: Aggressive behaviour, safety risk, CMAI 76-120
  - Critical: Self-harm risk, requires constant supervision, CMAI >120
- **Engine files**: `types.ts`, `sundowner-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `sundowner-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Cognitive Status - `Step2CognitiveStatus.svelte`
3. Behavioural Symptoms - `Step3BehaviouralSymptoms.svelte`
4. Temporal Pattern Assessment - `Step4TemporalPattern.svelte`
5. Trigger Identification - `Step5TriggerIdentification.svelte`
6. Sleep-Wake Cycle - `Step6SleepWakeCycle.svelte`
7. Medication Review - `Step7MedicationReview.svelte`
8. Environmental Assessment - `Step8EnvironmentalAssessment.svelte`
9. Carer Impact & Support - `Step9CarerImpact.svelte`
10. Management Plan - `Step10ManagementPlan.svelte`

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
