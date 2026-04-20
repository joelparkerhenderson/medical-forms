# Employee Satisfaction Survey

Employee satisfaction survey measuring workplace experience quality using Likert-scale scoring across multiple employment domains with normalized composite scoring to inform retention, engagement, and culture programmes.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Employee questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Administrator dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Likert-scale employee satisfaction survey (1-5 per item)
- **Range**: 0-100 (normalized composite score)
- **Categories**:
  - Excellent (85-100): Outstanding employee experience across all domains
  - Good (70-84): Above-average experience with minor improvement areas
  - Satisfactory (50-69): Adequate experience with several improvement areas
  - Poor (25-49): Below-average experience requiring significant improvement
  - Very Poor (0-24): Critically deficient experience requiring urgent action
- **Engine files**: `types.ts`, `grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Role & Tenure - `Step2RoleTenure.svelte`
3. Workload & Work-Life Balance - `Step3WorkloadBalance.svelte`
4. Management & Leadership - `Step4ManagementLeadership.svelte`
5. Growth & Development - `Step5GrowthDevelopment.svelte`
6. Compensation & Benefits - `Step6CompensationBenefits.svelte`
7. Culture & Inclusion - `Step7CultureInclusion.svelte`
8. Environment & Resources - `Step8EnvironmentResources.svelte`
9. Recognition & Engagement - `Step9RecognitionEngagement.svelte`
10. Overall Experience & Retention Intent - `Step10OverallExperience.svelte`

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
