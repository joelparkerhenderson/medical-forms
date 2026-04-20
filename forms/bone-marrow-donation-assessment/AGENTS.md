# Bone Marrow Donation Assessment

Haematopoietic stem cell donor evaluation assessing HLA typing, health screening, anaesthetic fitness, and collection method suitability (peripheral blood stem cells vs bone marrow harvest).

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Donor Eligibility Classification with HLA Match Grading
- **Range**: Eligibility (suitable, conditionally suitable, unsuitable) + Risk Level (low, moderate, high, critical)
- **Categories**:
  - Suitable: Ideal match, healthy donor, no contraindications
  - Conditionally suitable: Minor health issues, partial match, requires further evaluation
  - Unsuitable: Contraindicated, significant health risks, poor match
- **Engine files**: `types.ts`, `donor-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `donor-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Donor Registration & HLA Typing - `Step2DonorRegistrationHlaTyping.svelte`
3. Medical History - `Step3MedicalHistory.svelte`
4. Physical Examination - `Step4PhysicalExamination.svelte`
5. Haematological Assessment - `Step5HaematologicalAssessment.svelte`
6. Infectious Disease Screening - `Step6InfectiousDiseaseScreening.svelte`
7. Anaesthetic Assessment - `Step7AnaestheticAssessment.svelte`
8. Collection Method Assessment - `Step8CollectionMethodAssessment.svelte`
9. Psychological Readiness - `Step9PsychologicalReadiness.svelte`
10. Consent & Eligibility Decision - `Step10ConsentEligibility.svelte`

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
