# Seasonal Affective Disorder Assessment

Seasonal mood disorder evaluation using SPAQ Global Seasonality Score (GSS) and PHQ-9 depression severity screening with combined severity classification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instruments**: SPAQ Global Seasonality Score (GSS) + PHQ-9 Depression Severity
- **SPAQ GSS Range**: 0-24 (6 items, each 0-4)
  - 0-7: No SAD
  - 8-10: Subsyndromal SAD
  - 11-24: SAD likely
- **PHQ-9 Range**: 0-27 (9 items, each 0-3)
  - 0-4: Minimal depression
  - 5-9: Mild depression
  - 10-14: Moderate depression
  - 15-19: Moderately severe depression
  - 20-27: Severe depression
- **Combined Severity**: no-sad, mild, moderate, severe, critical
- **Engine files**: `types.ts`, `sad-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `sad-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Seasonal Pattern History - `Step2SeasonalPatternHistory.svelte`
3. Current Mood Assessment (PHQ-9) - `Step3CurrentMood.svelte`
4. Sleep & Energy - `Step4SleepEnergy.svelte`
5. Appetite & Weight Changes - `Step5AppetiteWeight.svelte`
6. Social & Occupational Impact - `Step6SocialOccupational.svelte`
7. Light Exposure Assessment - `Step7LightExposure.svelte`
8. Previous Treatments - `Step8PreviousTreatments.svelte`
9. Risk Assessment (Self-harm) - `Step9RiskAssessment.svelte`
10. Treatment Plan & Monitoring - `Step10TreatmentPlan.svelte`

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
