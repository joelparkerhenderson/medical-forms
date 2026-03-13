# Contraception Assessment

Contraceptive method eligibility screening using UKMEC (UK Medical Eligibility Criteria) categories for 11 contraceptive methods.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: UKMEC (UK Medical Eligibility Criteria)
- **Range**: Categories 1-4
- **Categories**:
  - UKMEC 1: No restriction for use of the contraceptive method
  - UKMEC 2: Advantages of using the method generally outweigh the theoretical or proven risks
  - UKMEC 3: Theoretical or proven risks usually outweigh the advantages of using the method
  - UKMEC 4: Unacceptable health risk if the contraceptive method is used
- **Engine files**: `types.ts`, `ukmec-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `ukmec-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Reproductive History - `Step2ReproductiveHistory.svelte`
3. Menstrual History - `Step3MenstrualHistory.svelte`
4. Current Contraception - `Step4CurrentContraception.svelte`
5. Medical History - `Step5MedicalHistory.svelte`
6. Cardiovascular Risk - `Step6CardiovascularRisk.svelte`
7. Lifestyle Factors - `Step7LifestyleFactors.svelte`
8. Preferences & Priorities - `Step8PreferencesPriorities.svelte`
9. Breast & Cervical Screening - `Step9BreastCervicalScreening.svelte`
10. Family Planning Goals - `Step10FamilyPlanningGoals.svelte`

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
