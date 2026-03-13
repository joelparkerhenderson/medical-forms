# Advance Statement About Care

Document for recording patient wishes and preferences about future care, assessed for completeness.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Completeness Score
- **Range**: Three-level categorical
- **Categories**: Complete, Partial, Incomplete
- **Engine files**: `types.ts`, `completeness-grader.ts`, `completeness-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `completeness-grader.test.ts`

## Assessment steps (9 total)

1. Personal Information - `Step1PersonalInformation.svelte`
2. Statement Context - `Step2StatementContext.svelte`
3. Values & Beliefs - `Step3ValuesBeliefs.svelte`
4. Care Preferences - `Step4CarePreferences.svelte`
5. Medical Treatment Wishes - `Step5MedicalTreatmentWishes.svelte`
6. Communication Preferences - `Step6CommunicationPreferences.svelte`
7. People Important to Me - `Step7PeopleImportantToMe.svelte`
8. Practical Matters - `Step8PracticalMatters.svelte`
9. Signatures & Witnesses - `Step9SignaturesWitnesses.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF report generation via /report/pdf server endpoint
- Vitest unit tests for grading logic

## Clinician dashboard

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
