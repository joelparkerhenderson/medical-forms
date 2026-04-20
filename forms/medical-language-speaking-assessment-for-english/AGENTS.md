# Medical Language Speaking Assessment for English

Clinical English-language speaking assessment for internationally educated healthcare professionals, modelled on the Occupational English Test (OET) Medicine speaking sub-test, using role-played patient scenarios and criterion-based scoring on linguistic and clinical communication indicators.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Examiner form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Training / exam admin dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: OET Speaking Sub-test (Medicine profession)
- **Range**: 0-500 (grades A, B, C+, C, D, E)
- **Linguistic criteria**: Intelligibility, Fluency, Appropriateness of Language, Resources of Grammar & Expression
- **Clinical communication indicators**: Relationship-building, Understanding patient's perspective, Providing structure, Information-gathering, Information-giving
- **Engine files**: `types.ts`, `oet-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `oet-grader.test.ts`

## Assessment steps (5 total)

1. Candidate Details - `Step1CandidateDetails.svelte`
2. Role-play 1 — Patient Interview - `Step2RolePlay1.svelte`
3. Role-play 2 — Clinical Explanation - `Step3RolePlay2.svelte`
4. Linguistic Criteria Rating - `Step4LinguisticCriteria.svelte`
5. Clinical Communication Indicators & Overall Grade - `Step5ClinicalIndicatorsOverallGrade.svelte`

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
