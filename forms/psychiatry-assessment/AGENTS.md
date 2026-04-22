# Psychiatry Assessment

Comprehensive psychiatric evaluation using the GAF (Global Assessment of Functioning) Scale with mental status examination, risk assessment, and capacity evaluation.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: GAF Scale (Global Assessment of Functioning)
- **Range**: 1-100
- **Categories**: 91-100 = Superior functioning, 51-60 = Moderate symptoms, 1-10 = Persistent danger
- **Engine files**: `types.ts`, `gaf-grader.ts`, `gaf-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `gaf-grader.test.ts`

## Assessment steps (11 total)

1. Demographics - `Step1Demographics.svelte`
2. Presenting Complaint - `Step2PresentingComplaint.svelte`
3. Psychiatric History - `Step3PsychiatricHistory.svelte`
4. Mental Status Exam - `Step4MentalStatusExam.svelte`
5. Risk Assessment - `Step5RiskAssessment.svelte`
6. Mood & Anxiety - `Step6MoodAndAnxiety.svelte`
7. Substance Use - `Step7SubstanceUse.svelte`
8. Current Medications - `Step8CurrentMedications.svelte`
9. Medical History - `Step9MedicalHistory.svelte`
10. Social History - `Step10SocialHistory.svelte`
11. Capacity & Consent - `Step11CapacityAndConsent.svelte`

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
