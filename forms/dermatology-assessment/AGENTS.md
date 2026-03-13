# Dermatology Assessment

Dermatological quality of life evaluation using the DLQI (Dermatology Life Quality Index) with lesion characterisation.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: DLQI (Dermatology Life Quality Index)
- **Range**: 0-30
- **Categories**:
  - 0-1: No effect on patient's life
  - 2-5: Small effect on patient's life
  - 6-10: Moderate effect on patient's life
  - 11-20: Very large effect on patient's life
  - 21-30: Extremely large effect on patient's life
- **Engine files**: `types.ts`, `dlqi-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `dlqi-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Chief Complaint - `Step2ChiefComplaint.svelte`
3. DLQI Questionnaire - `Step3DlqiQuestionnaire.svelte`
4. Lesion Characteristics - `Step4LesionCharacteristics.svelte`
5. Medical History - `Step5MedicalHistory.svelte`
6. Current Medications - `Step6CurrentMedications.svelte`
7. Allergies - `Step7Allergies.svelte`
8. Family History - `Step8FamilyHistory.svelte`
9. Social History - `Step9SocialHistory.svelte`

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
