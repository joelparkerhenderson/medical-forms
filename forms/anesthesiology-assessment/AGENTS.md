# Anesthesiology Assessment

UK NHS-aligned pre-operative anesthesiology assessment combining four validated scoring systems — ASA Physical Status Classification, Mallampati / Airway Score, Revised Cardiac Risk Index (RCRI / Lee Index), and STOP-BANG (OSA screening) — into a composite perioperative risk level, with flagged safety-critical issues and an anaesthetic plan.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Anaesthetist dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instruments**: ASA Physical Status (I-VI), Mallampati Airway Class (I-IV), RCRI (0-6), STOP-BANG (0-8)
- **Range**: Composite perioperative risk — Low / Moderate / High / Critical
- **Engine files**: `types.ts`, `composite-grader.ts`, `asa-rules.ts`, `mallampati-rules.ts`, `rcri-rules.ts`, `stopbang-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `composite-grader.test.ts`

## Assessment steps (10 total)

1. Patient Demographics - `Step1PatientDemographics.svelte`
2. Planned Surgery & Proposed Anaesthesia - `Step2PlannedSurgery.svelte`
3. Medical History - `Step3MedicalHistory.svelte`
4. Medications - `Step4Medications.svelte`
5. Allergies & Adverse Reactions - `Step5AllergiesAdverseReactions.svelte`
6. Previous Anaesthesia & Surgery History - `Step6PreviousAnaesthesiaHistory.svelte`
7. Airway & Physical Examination - `Step7AirwayPhysicalExamination.svelte`
8. Vital Signs & Investigations - `Step8VitalSignsInvestigations.svelte`
9. ASA / Mallampati / RCRI / STOP-BANG Scoring - `Step9CompositeScoring.svelte`
10. Anaesthetic Plan & Consent - `Step10AnaestheticPlanConsent.svelte`

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
- AAGBI / RCoA pre-operative assessment guidelines, NICE NG45 (routine preoperative tests)
