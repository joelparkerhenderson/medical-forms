# Plastic Surgery Assessment

Plastic surgery assessment evaluating reconstructive and aesthetic surgery candidates using ASA Physical Status Classification (I-V), wound classification, and surgical complexity scoring.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: ASA Physical Status Classification + Wound Classification + Surgical Complexity Scoring
- **Range**: ASA I-V, Wound Class I-IV, Complexity 1-4
- **Categories**:
  - ASA I: Normal healthy patient
  - ASA II: Patient with mild systemic disease
  - ASA III: Patient with severe systemic disease
  - ASA IV: Patient with severe systemic disease that is a constant threat to life
  - ASA V: Moribund patient not expected to survive without the operation
- **Engine files**: `types.ts`, `plastics-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `plastics-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Reason for Referral - `Step2ReasonForReferral.svelte`
3. Medical & Surgical History - `Step3MedicalSurgicalHistory.svelte`
4. Current Condition Assessment - `Step4CurrentCondition.svelte`
5. Wound & Tissue Assessment - `Step5WoundTissueAssessment.svelte`
6. Psychological Assessment - `Step6PsychologicalAssessment.svelte`
7. Anaesthetic Risk Assessment - `Step7AnaestheticRisk.svelte`
8. Photography & Documentation - `Step8PhotographyDocumentation.svelte`
9. Current Medications & Allergies - `Step9MedicationsAllergies.svelte`
10. Procedure Planning & Consent - `Step10ProcedurePlanningConsent.svelte`

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
