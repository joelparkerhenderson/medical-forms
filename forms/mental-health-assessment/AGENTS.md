# Mental Health Assessment

Combined depression and anxiety screening using PHQ-9 (Patient Health Questionnaire-9) and GAD-7 (Generalised Anxiety Disorder-7) with risk assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: PHQ-9 + GAD-7
- **Range**: PHQ-9 (0-27), GAD-7 (0-21)
- **Categories**: PHQ-9: 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-19 Moderately severe, 20-27 Severe. GAD-7: 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-21 Severe
- **Engine files**: `types.ts`, `mh-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `mh-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. PHQ-9 Depression Screen - `Step2Phq9DepressionScreen.svelte`
3. GAD-7 Anxiety Screen - `Step3Gad7AnxietyScreen.svelte`
4. Mood & Affect - `Step4MoodAndAffect.svelte`
5. Risk Assessment - `Step5RiskAssessment.svelte`
6. Substance Use - `Step6SubstanceUse.svelte`
7. Current Medications - `Step7CurrentMedications.svelte`
8. Treatment History - `Step8TreatmentHistory.svelte`
9. Social & Functional - `Step9SocialAndFunctional.svelte`

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
