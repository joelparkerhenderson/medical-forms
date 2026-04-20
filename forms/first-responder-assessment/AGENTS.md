# First Responder Assessment

First responder fitness and competency evaluation for paramedics, EMTs, and first aiders. Covers physical fitness, clinical skills, equipment competency, and psychological readiness.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: First Responder Competency Framework
- **Competency Levels**: Not Competent (1), Developing (2), Competent (3), Expert (4)
- **Overall Fitness Decisions**: Fit for duty, Fit with restrictions, Temporarily unfit, Permanently unfit
- **Engine files**: `types.ts`, `responder-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `responder-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Role & Qualifications - `Step2RoleQualifications.svelte`
3. Physical Fitness Assessment - `Step3PhysicalFitness.svelte`
4. Clinical Skills Competency - `Step4ClinicalSkills.svelte`
5. Equipment & Vehicle Competency - `Step5EquipmentVehicle.svelte`
6. Communication Skills - `Step6CommunicationSkills.svelte`
7. Psychological Readiness - `Step7PsychologicalReadiness.svelte`
8. Occupational Health - `Step8OccupationalHealth.svelte`
9. CPD & Training Record - `Step9CpdTraining.svelte`
10. Overall Fitness Decision - `Step10FitnessDecision.svelte`

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
