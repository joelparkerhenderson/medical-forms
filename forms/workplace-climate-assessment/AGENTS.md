# Workplace Climate Assessment

Workplace climate assessment measuring organisational culture, psychological safety, and employee experience using a validated Likert-scale instrument to inform leadership, inclusion, and wellbeing programmes.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Employee questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Leadership dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Workplace Climate Index (Likert-scale 1-5 per item)
- **Range**: 0-100 (normalized composite score)
- **Categories**:
  - Thriving (85-100): Strong, inclusive, psychologically safe climate
  - Healthy (70-84): Generally positive climate with minor growth areas
  - Developing (50-69): Mixed climate with several improvement areas
  - Strained (25-49): Concerning climate requiring intervention
  - Critical (0-24): Severely unhealthy climate requiring urgent action
- **Engine files**: `types.ts`, `grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Leadership & Management - `Step2LeadershipManagement.svelte`
3. Psychological Safety - `Step3PsychologicalSafety.svelte`
4. Inclusion & Belonging - `Step4InclusionBelonging.svelte`
5. Communication - `Step5Communication.svelte`
6. Collaboration & Teamwork - `Step6CollaborationTeamwork.svelte`
7. Recognition & Reward - `Step7RecognitionReward.svelte`
8. Wellbeing - `Step8Wellbeing.svelte`
9. Career Development - `Step9CareerDevelopment.svelte`
10. Overall Climate & Recommendations - `Step10OverallClimate.svelte`

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
