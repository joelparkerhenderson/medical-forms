# Sleep Quality Assessment

Sleep quality evaluation using the PSQI (Pittsburgh Sleep Quality Index) covering sleep habits, latency, duration, efficiency, disturbances, and daytime dysfunction.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: PSQI (Pittsburgh Sleep Quality Index)
- **Range**: 0-21
- **Categories**: 0-5 = Good sleep quality, 6-10 = Poor sleep quality, 11-21 = Very poor sleep quality
- **Engine files**: `types.ts`, `psqi-grader.ts`, `psqi-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `psqi-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - Step1Demographics.svelte
2. Sleep Habits - Step2SleepHabits.svelte
3. Sleep Latency - Step3SleepLatency.svelte
4. Sleep Duration - Step4SleepDuration.svelte
5. Sleep Efficiency - Step5SleepEfficiency.svelte
6. Sleep Disturbances - Step6SleepDisturbances.svelte
7. Daytime Dysfunction - Step7DaytimeDysfunction.svelte
8. Sleep Medication Use - Step8SleepMedicationUse.svelte
9. Medical & Lifestyle Factors - Step9MedicalLifestyleFactors.svelte

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
