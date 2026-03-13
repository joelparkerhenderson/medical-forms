# Gynecology Assessment

Gynaecological symptom assessment covering menstrual history, cervical screening, obstetric history, and sexual health.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: Symptom Severity Score
- **Range**: Composite severity score
- **Categories**: Based on symptom frequency, intensity, and clinical significance
- **Engine files**: `types.ts`, `symptom-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `symptom-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - Step1Demographics.svelte
2. Chief Complaint - Step2ChiefComplaint.svelte
3. Menstrual History - Step3MenstrualHistory.svelte
4. Gynecological Symptoms - Step4GynecologicalSymptoms.svelte
5. Cervical Screening - Step5CervicalScreening.svelte
6. Obstetric History - Step6ObstetricHistory.svelte
7. Sexual Health - Step7SexualHealth.svelte
8. Medical History - Step8MedicalHistory.svelte
9. Current Medications - Step9CurrentMedications.svelte
10. Family History - Step10FamilyHistory.svelte

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
