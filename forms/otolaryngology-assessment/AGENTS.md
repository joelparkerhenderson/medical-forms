# Otolaryngology Assessment

General ear-nose-throat (otolaryngology) consultation assessment covering presenting complaint, history, examination findings, and the SNOT-22 symptom score to quantify sinonasal quality of life and guide ENT management.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient / clinician questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - ENT clinic dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: SNOT-22 + ENT Review of Systems
- **Range**: SNOT-22 total 0-110
- **Categories**:
  - Mild (0-7)
  - Moderate (8-19)
  - Severe (20+)
- **Engine files**: `types.ts`, `snot22-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `snot22-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Presenting Complaint - `Step2PresentingComplaint.svelte`
3. History of Present Illness - `Step3HistoryOfPresentIllness.svelte`
4. Past ENT History & Surgery - `Step4PastENTHistorySurgery.svelte`
5. SNOT-22 Questionnaire - `Step5SNOT22Questionnaire.svelte`
6. External Examination - `Step6ExternalExamination.svelte`
7. Otoscopy - `Step7Otoscopy.svelte`
8. Anterior Rhinoscopy - `Step8AnteriorRhinoscopy.svelte`
9. Oropharyngeal & Neck Examination - `Step9OropharyngealNeckExamination.svelte`
10. Clinical Impression & Management Plan - `Step10ClinicalImpressionManagementPlan.svelte`

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
