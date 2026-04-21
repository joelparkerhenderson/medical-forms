# Advance Decision to Refuse Treatment

Legal document allowing patients to record treatment refusal decisions in advance, assessed for legal validity per Mental Capacity Act 2005.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Validity Check
- **Range**: Three-level categorical
- **Categories**: Valid, Invalid, Incomplete
- **Engine files**: `types.ts`, `validity-grader.ts`, `validity-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `validity-grader.test.ts`

## Assessment steps (10 total)

1. Personal Information - `Step1PersonalInformation.svelte`
2. Capacity Declaration - `Step2CapacityDeclaration.svelte`
3. Circumstances - `Step3Circumstances.svelte`
4. Treatments Refused - General - `Step4TreatmentsRefusedGeneral.svelte`
5. Treatments Refused - Life-Sustaining - `Step5TreatmentsRefusedLifeSustaining.svelte`
6. Exceptions & Conditions - `Step6ExceptionsConditions.svelte`
7. Other Wishes - `Step7OtherWishes.svelte`
8. Lasting Power of Attorney - `Step8LastingPowerOfAttorney.svelte`
9. Healthcare Professional Review - `Step9HealthcareProfessionalReview.svelte`
10. Legal Signatures - `Step10LegalSignatures.svelte`

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
