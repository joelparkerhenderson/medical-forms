# First Aid Training Checklist

First Aid at Work (FAW) competency assessment aligned with UK HSE guidance and the St John Ambulance syllabus, covering scene assessment, primary survey, life-threatening emergencies, and injury management with a pass / fail / needs-development outcome.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Examiner questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Training coordinator dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: First Aid at Work Competency Assessment
- **Range**: Pass / Fail / Needs Development
- **Categories**:
  - Pass: All skills demonstrated to competent standard
  - Needs Development: Minor deficiencies; targeted retraining
  - Fail: Critical deficiency in life-saving skills
- **Engine files**: `types.ts`, `first-aid-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `first-aid-grader.test.ts`

## Assessment steps (10 total)

1. Trainee Details - `Step1TraineeDetails.svelte`
2. Scene Assessment & Safety - `Step2SceneAssessmentSafety.svelte`
3. Primary Survey (DRABC) - `Step3PrimarySurveyDRABC.svelte`
4. CPR & AED - `Step4CPRAED.svelte`
5. Choking Management - `Step5ChokingManagement.svelte`
6. Bleeding & Wound Care - `Step6BleedingWoundCare.svelte`
7. Burns & Scalds - `Step7BurnsScalds.svelte`
8. Fractures, Sprains & Spinal Injury - `Step8FracturesSprainsSpinal.svelte`
9. Medical Emergencies - `Step9MedicalEmergencies.svelte`
10. Recording, Reporting & Handover - `Step10RecordingReportingHandover.svelte`

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
