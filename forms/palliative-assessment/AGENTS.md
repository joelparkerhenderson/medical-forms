# Palliative Assessment

Symptom-focused palliative care assessment using the Edmonton Symptom Assessment System-revised (ESAS-r) alongside performance status, goals-of-care documentation, medication and symptom-control planning, and psychosocial and spiritual review to guide individualised palliative management.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient / carer questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Palliative MDT dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: ESAS-r (10 symptoms scored 0-10)
- **Range**: Total 0-100
- **Categories**:
  - None (0-10)
  - Mild (11-30)
  - Moderate (31-60)
  - Severe (61-100)
- **Individual flag**: Any symptom ≥ 7
- **Engine files**: `types.ts`, `esas-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `esas-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Primary Diagnosis & Prognosis - `Step2PrimaryDiagnosisPrognosis.svelte`
3. ESAS-r Symptom Scoring - `Step3ESASrSymptomScoring.svelte`
4. Performance Status - `Step4PerformanceStatus.svelte`
5. Goals of Care & ACP Documents - `Step5GoalsOfCareACP.svelte`
6. Medications & Symptom Control Plan - `Step6MedicationsSymptomControl.svelte`
7. Psychosocial & Spiritual Concerns - `Step7PsychosocialSpiritualConcerns.svelte`
8. Carer & Family Support - `Step8CarerFamilySupport.svelte`
9. Multidisciplinary Plan & Referrals - `Step9MultidisciplinaryPlan.svelte`

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
