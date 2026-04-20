# Provider Transfer Request

Inter-provider handover form for transferring a patient's care between clinicians, wards, or organisations, structured around the SBAR (Situation, Background, Assessment, Recommendation) framework with transfer-logistics capture.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Requesting clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Receiving clinician dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Provider Transfer Completeness Validation (SBAR-aligned)
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All mandatory SBAR and logistics fields supplied
  - Partial: Non-mandatory fields outstanding
  - Incomplete: Mandatory fields missing
- **Engine files**: `types.ts`, `transfer-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `transfer-validator.test.ts`

## Assessment steps (9 total)

1. Requesting Provider Details - `Step1RequestingProviderDetails.svelte`
2. Receiving Provider Details - `Step2ReceivingProviderDetails.svelte`
3. Patient Demographics - `Step3PatientDemographics.svelte`
4. Situation - `Step4Situation.svelte`
5. Background - `Step5Background.svelte`
6. Assessment - `Step6Assessment.svelte`
7. Recommendation - `Step7Recommendation.svelte`
8. Transfer Logistics - `Step8TransferLogistics.svelte`
9. Sign-off & Acknowledgement - `Step9SignoffAcknowledgement.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure validation engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF handover generation via /report/pdf server endpoint
- Vitest unit tests for validation logic

## Clinician dashboard

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
