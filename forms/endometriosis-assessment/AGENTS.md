# Endometriosis Assessment

Endometriosis evaluation using revised ASRM (American Society for Reproductive Medicine) staging and EHP-30 quality of life scoring, with comprehensive pelvic pain profiling and fertility assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Revised ASRM Staging + EHP-30 Quality of Life
- **Range**: ASRM Stage I-IV (points-based), EHP-30 0-100 per domain
- **Categories**:
  - Stage I (Minimal): 1-5 points
  - Stage II (Mild): 6-15 points
  - Stage III (Moderate): 16-40 points
  - Stage IV (Severe): >40 points
- **Severity**:
  - Mild: Stage I-II, manageable symptoms
  - Moderate: Stage II-III, significant impact
  - Severe: Stage III-IV, debilitating
  - Critical: Bowel/urinary obstruction, fertility crisis
- **Engine files**: `types.ts`, `endo-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `endo-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Menstrual History - `Step2MenstrualHistory.svelte`
3. Pain Assessment - `Step3PainAssessment.svelte`
4. GI Symptoms - `Step4GastrointestinalSymptoms.svelte`
5. Urinary Symptoms - `Step5UrinarySymptoms.svelte`
6. Fertility Assessment - `Step6FertilityAssessment.svelte`
7. Previous Treatments - `Step7PreviousTreatments.svelte`
8. Surgical History - `Step8SurgicalHistory.svelte`
9. Quality of Life Impact - `Step9QualityOfLife.svelte`
10. Treatment Planning - `Step10TreatmentPlanning.svelte`

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
