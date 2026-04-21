# International Patient Summary

International Patient Summary (IPS) — a standardised, minimal, specialty-agnostic electronic health record extract conforming to ISO 27269 and HL7 FHIR R5, designed to support cross-border and unplanned care by exchanging a patient's core clinical facts.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Cross-border care dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: IPS Completeness Validation (ISO 27269 / HL7 FHIR IPS IG)
- **Range**: Complete / Partial / Incomplete
- **Mandatory sections**: problems, medications, allergies, immunisations, procedures, results, patient demographics, authoring clinician
- **Engine files**: `types.ts`, `ips-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `ips-validator.test.ts`

## Assessment steps (10 total)

1. Patient Demographics - `Step1PatientDemographics.svelte`
2. Problem List - `Step2ProblemList.svelte`
3. Medication Summary - `Step3MedicationSummary.svelte`
4. Allergies & Intolerances - `Step4AllergiesIntolerances.svelte`
5. Immunisations - `Step5Immunisations.svelte`
6. Procedures - `Step6Procedures.svelte`
7. Results & Investigations - `Step7ResultsInvestigations.svelte`
8. Medical Devices / Implants - `Step8MedicalDevicesImplants.svelte`
9. Advance Directives & Consent - `Step9AdvanceDirectivesConsent.svelte`
10. Authoring Clinician & Signoff - `Step10AuthoringClinicianSignoff.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure validation engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- Export via FHIR R5 IPS bundle from the `/ips` server endpoint
- PDF report generation via /report/pdf server endpoint
- Vitest unit tests for validation logic

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
- SNOMED CT terminology for clinical codes; ICD-10 for problem-list diagnoses; ATC for medications

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
- ISO 27269:2021 International Patient Summary
- HL7 FHIR International Patient Summary Implementation Guide (R4 and R5)
