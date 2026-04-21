# Birth Control Assessment

Contraceptive suitability evaluation using UK Medical Eligibility Criteria (UK MEC) categories with comprehensive risk profiling for DVT, cardiovascular disease, BMI, smoking, and migraine with aura.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: UK Medical Eligibility Criteria (UK MEC) for Contraceptive Use
- **Range**: UK MEC Category 1-4
- **Categories**:
  - UK MEC 1: No restriction for use of the contraceptive method
  - UK MEC 2: Advantages of using the method generally outweigh the theoretical or proven risks
  - UK MEC 3: Theoretical or proven risks usually outweigh the advantages of using the method
  - UK MEC 4: Unacceptable health risk if the contraceptive method is used
- **Engine files**: `types.ts`, `mec-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `mec-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Menstrual History - `Step2MenstrualHistory.svelte`
3. Contraceptive History - `Step3ContraceptiveHistory.svelte`
4. Medical History - `Step4MedicalHistory.svelte`
5. Cardiovascular Risk Factors - `Step5CardiovascularRisk.svelte`
6. Thromboembolism Risk - `Step6ThromboembolismRisk.svelte`
7. Current Medications - `Step7CurrentMedications.svelte`
8. Lifestyle Assessment - `Step8LifestyleAssessment.svelte`
9. Contraceptive Preferences - `Step9ContraceptivePreferences.svelte`
10. Clinical Recommendation - `Step10ClinicalRecommendation.svelte`

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
