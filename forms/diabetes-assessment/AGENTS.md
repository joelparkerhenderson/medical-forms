# Diabetes Assessment

Structured diabetes review aligned with NICE NG28 (type 2) / NG17 (type 1) and the Diabetes UK 15 Healthcare Essentials, capturing diabetes history, glycaemic control, medications, complications screening, cardiovascular risk, self-care, psychological wellbeing, and foot assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: NICE Diabetes Review (HbA1c target + composite risk)
- **Range**: Controlled / Suboptimal / Poorly Controlled
- **Engine files**: `types.ts`, `diabetes-grader.ts`, `diabetes-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `diabetes-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Diabetes History - `Step2DiabetesHistory.svelte`
3. Glycaemic Control - `Step3GlycaemicControl.svelte`
4. Medications - `Step4Medications.svelte`
5. Complications Screening - `Step5ComplicationsScreening.svelte`
6. Cardiovascular Risk - `Step6CardiovascularRisk.svelte`
7. Self-Care & Lifestyle - `Step7SelfCareLifestyle.svelte`
8. Psychological Wellbeing - `Step8PsychologicalWellbeing.svelte`
9. Foot Assessment - `Step9FootAssessment.svelte`
10. Review & Care Plan - `Step10ReviewCarePlan.svelte`

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
