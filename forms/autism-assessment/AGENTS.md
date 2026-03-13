# Autism Assessment

Autism spectrum screening using the AQ-10 questionnaire with sensory and developmental profiling.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: AQ-10 Score (Autism Spectrum Quotient - 10 item)
- **Range**: 0-10 (each of the 10 items scores 0 or 1)
- **Categories**: 0-5 = Below threshold, >=6 = Referral for diagnostic assessment recommended
- **Engine files**: `types.ts`, `aq10-grader.ts`, `aq10-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `aq10-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Screening Purpose - `Step2ScreeningPurpose.svelte`
3. AQ-10 Questionnaire - `Step3Aq10Questionnaire.svelte`
4. Social Communication - `Step4SocialCommunication.svelte`
5. Repetitive Behaviors - `Step5RepetitiveBehaviors.svelte`
6. Sensory Profile - `Step6SensoryProfile.svelte`
7. Developmental History - `Step7DevelopmentalHistory.svelte`
8. Current Support - `Step8CurrentSupport.svelte`
9. Family History - `Step9FamilyHistory.svelte`

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
