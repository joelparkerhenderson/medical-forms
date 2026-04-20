# Research and Planning Privacy Notice

Read-and-acknowledge privacy notice covering the use of patient data for research and service-planning purposes, aligned with UK GDPR, the Data Protection Act 2018, the Common Law Duty of Confidentiality, and the NHS National Data Opt-Out framework.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Recipient form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Information governance dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: Completeness Validation
- **Range**: Complete / Incomplete
- **Categories**:
  - Complete: All acknowledgement fields filled and opt-out preference recorded
  - Incomplete: One or more missing
- **Engine files**: `types.ts`, `form-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `form-validator.test.ts`

## Assessment steps (3 total)

1. Recipient Details - `Step1RecipientDetails.svelte`
2. Research & Planning Privacy Notice - `Step2ResearchPlanningPrivacyNotice.svelte`
3. Opt-Out Preference, Acknowledgement & Signature - `Step3OptOutAcknowledgementSignature.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure validation engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF acknowledgement generation via /report/pdf server endpoint
- Vitest unit tests for validation logic

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
- UK GDPR and Data Protection Act 2018
- NHS National Data Opt-Out (Type 1 and National Opt-Out)
