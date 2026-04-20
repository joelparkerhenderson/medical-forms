# Emergency Medical Technician Psychomotor Examination

NREMT-style psychomotor skills examination for Emergency Medical Technicians, scored against a point-based checklist for scene size-up, primary survey, history taking, secondary assessment, and reassessment, with explicit critical-criteria failure conditions.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Examiner form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Training coordinator dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: NREMT Psychomotor Skills Examination
- **Range**: Pass / Fail with critical-criteria overrides
- **Categories**:
  - Pass: Minimum point threshold met and no critical-criteria failure
  - Fail: Any critical-criteria failure OR insufficient points
- **Critical criteria** (any → Fail): PPE precautions, scene safety, oxygen therapy, airway/breathing/shock management, transport urgency decision, dangerous intervention, spinal protection when indicated, 15-minute transport call
- **Engine files**: `types.ts`, `psychomotor-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `psychomotor-grader.test.ts`

## Assessment steps (6 total)

1. Candidate, Examiner & Scenario - `Step1CandidateExaminerScenario.svelte`
2. Scene Size-Up - `Step2SceneSizeUp.svelte`
3. Primary Survey - `Step3PrimarySurvey.svelte`
4. History Taking & Secondary Assessment - `Step4HistorySecondaryAssessment.svelte`
5. Reassessment - `Step5Reassessment.svelte`
6. Critical Criteria Review - `Step6CriticalCriteriaReview.svelte`

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
