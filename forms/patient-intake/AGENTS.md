# Patient Intake

General patient intake form collecting demographics, insurance, medical history, medications, allergies, and review of systems with risk level stratification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Risk Level
- **Range**: Low / Medium / High
- **Categories**: Low = minimal risk factors, Medium = some risk factors present, High = significant risk factors requiring attention
- **Engine files**: `types.ts`, `intake-grader.ts`, `intake-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `intake-grader.test.ts`

## Assessment steps (10 total)

1. Personal Information - `Step1PersonalInformation.svelte`
2. Insurance & ID - `Step2InsuranceAndId.svelte`
3. Reason for Visit - `Step3ReasonForVisit.svelte`
4. Medical History - `Step4MedicalHistory.svelte`
5. Current Medications - `Step5Medications.svelte`
6. Allergies - `Step6Allergies.svelte`
7. Family History - `Step7FamilyHistory.svelte`
8. Social History - `Step8SocialHistory.svelte`
9. Review of Systems - `Step9ReviewOfSystems.svelte`
10. Consent & Preferences - `Step10ConsentAndPreferences.svelte`

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
