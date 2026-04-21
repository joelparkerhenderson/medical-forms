# Blood Donation Assessment

Blood donation eligibility screening aligned with the JPAC Donor Selection Guidelines used by UK NHSBT, covering donor demographics, health status, medications, recent illness, travel history, lifestyle risk, and vital signs to determine donation eligibility.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Donor questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Donation session nurse dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: JPAC Donor Selection Guidelines (DSG)
- **Range**: Eligible / Temporarily Deferred / Permanently Deferred
- **Categories**:
  - Eligible: No deferral criteria triggered
  - Temporarily Deferred: Time-limited deferral
  - Permanently Deferred: Lifelong deferral
- **Engine files**: `types.ts`, `donor-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `donor-grader.test.ts`

## Assessment steps (10 total)

1. Donor Demographics - `Step1DonorDemographics.svelte`
2. General Health & Wellbeing - `Step2GeneralHealthWellbeing.svelte`
3. Medical History - `Step3MedicalHistory.svelte`
4. Recent Illness & Infections - `Step4RecentIllnessInfections.svelte`
5. Travel History - `Step5TravelHistory.svelte`
6. Lifestyle & Risk Behaviours - `Step6LifestyleRiskBehaviours.svelte`
7. Pregnancy & Transfusion History - `Step7PregnancyTransfusionHistory.svelte`
8. Vital Signs - `Step8VitalSigns.svelte`
9. Informed Consent - `Step9InformedConsent.svelte`
10. Donation Plan - `Step10DonationPlan.svelte`

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
