# Obstetrics Assessment

Antenatal obstetric assessment aligned with NICE NG201, stratifying pregnancies into low, moderate, and high risk to allocate care pathway (midwifery-led, obstetrician-led, or multidisciplinary) and to schedule surveillance, screening, and birth planning.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient / midwife questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Maternity team dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: NICE NG201 Antenatal Risk Assessment
- **Range**: Low Risk / Moderate Risk / High Risk
- **Categories**:
  - Low Risk: midwifery-led care
  - Moderate Risk: obstetric input at key milestones
  - High Risk: consultant-led / multidisciplinary care
- **Engine files**: `types.ts`, `antenatal-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `antenatal-grader.test.ts`

## Assessment steps (10 total)

1. Maternal Demographics - `Step1MaternalDemographics.svelte`
2. Obstetric History - `Step2ObstetricHistory.svelte`
3. Medical History - `Step3MedicalHistory.svelte`
4. Current Pregnancy Details - `Step4CurrentPregnancyDetails.svelte`
5. Lifestyle & Social Factors - `Step5LifestyleSocialFactors.svelte`
6. Screening Test Results - `Step6ScreeningTestResults.svelte`
7. Mental Health Assessment - `Step7MentalHealthAssessment.svelte`
8. Fetal Assessment - `Step8FetalAssessment.svelte`
9. Birth Preferences - `Step9BirthPreferences.svelte`
10. Care Plan & Follow-up - `Step10CarePlanFollowup.svelte`

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
