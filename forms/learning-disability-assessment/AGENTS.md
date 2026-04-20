# Learning Disability Assessment

Structured annual health check and adaptive-functioning assessment for people with a learning disability, aligned with the NHS England Annual Health Check and DSM-5-TR / ICD-11 criteria, producing a severity category and a personalised Health Action Plan with reasonable adjustments.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Clinician / carer form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - LD team dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: NHS England Annual Health Check + Adaptive Behaviour Scale
- **Range**: Mild / Moderate / Severe / Profound
- **Engine files**: `types.ts`, `ld-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `ld-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Carer & Support Network - `Step2CarerSupportNetwork.svelte`
3. Communication Needs - `Step3CommunicationNeeds.svelte`
4. Medical Review - `Step4MedicalReview.svelte`
5. Physical Examination & Observations - `Step5PhysicalExaminationObservations.svelte`
6. Adaptive Functioning - `Step6AdaptiveFunctioning.svelte`
7. Behavioural Concerns & Triggers - `Step7BehaviouralConcernsTriggers.svelte`
8. Mental Capacity & Consent - `Step8MentalCapacityConsent.svelte`
9. Reasonable Adjustments Required - `Step9ReasonableAdjustmentsRequired.svelte`
10. Health Action Plan - `Step10HealthActionPlan.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Easy-read presentation mode for patient-facing sections
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF report generation via /report/pdf server endpoint
- Vitest unit tests for grading logic

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
- UK Mental Capacity Act 2005 and Accessible Information Standard
