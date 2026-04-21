# Employee Onboarding Checklist

Employee onboarding checklist for healthcare staff. Tracks completion of mandatory requirements: occupational health clearance, DBS checks, professional registration, mandatory training, IT access, uniform/ID.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Employee questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - HR dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Completion Percentage
- **Range**: 0-100%
- **Categories**:
  - Not started: 0%
  - In progress: 1-49%
  - Mostly complete: 50-89%
  - Complete: 90-100%
- **Risk flags**: Overdue items flagged by priority
- **Engine files**: `types.ts`, `onboarding-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `onboarding-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Pre-Employment Checks - `Step2PreEmploymentChecks.svelte`
3. Occupational Health - `Step3OccupationalHealth.svelte`
4. Mandatory Training - `Step4MandatoryTraining.svelte`
5. Professional Registration - `Step5ProfessionalRegistration.svelte`
6. IT Systems & Access - `Step6ITSystemsAccess.svelte`
7. Uniform & ID Badge - `Step7UniformIDBadge.svelte`
8. Induction Programme - `Step8InductionProgramme.svelte`
9. Probation & Supervision - `Step9ProbationSupervision.svelte`
10. Sign-off & Compliance - `Step10SignOffCompliance.svelte`

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
