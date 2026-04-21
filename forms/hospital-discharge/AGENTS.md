# Hospital Discharge

Hospital discharge summary form aligned with UK NICE NG27 and the SAFER patient-flow bundle, capturing diagnoses, procedures, medication reconciliation, follow-up arrangements, and community handover details to support safe transfer of care.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Ward / GP liaison dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Discharge Summary Completeness Validation (NICE NG27)
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All mandatory NICE NG27 fields supplied
  - Partial: Non-mandatory fields outstanding
  - Incomplete: Mandatory fields missing
- **Engine files**: `types.ts`, `discharge-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `discharge-validator.test.ts`

## Assessment steps (10 total)

1. Patient Details - `Step1PatientDetails.svelte`
2. Admission Summary - `Step2AdmissionSummary.svelte`
3. Diagnoses - `Step3Diagnoses.svelte`
4. Procedures Performed - `Step4ProceduresPerformed.svelte`
5. Discharge Medications - `Step5DischargeMedications.svelte`
6. Follow-up Arrangements - `Step6FollowupArrangements.svelte`
7. Community Care Instructions - `Step7CommunityCareInstructions.svelte`
8. Warning Signs & When to Seek Help - `Step8WarningSigns.svelte`
9. Clinician Sign-off - `Step9ClinicianSignoff.svelte`
10. Patient / Carer Acknowledgement - `Step10PatientAcknowledgement.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure validation engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF discharge summary generation via /report/pdf server endpoint
- Vitest unit tests for validation logic

## Dashboard

- SVAR DataGrid (@svar-ui/svelte-grid) with Willow theme
- Sortable columns and dropdown filters
- Backend API client with sample data fallback

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
