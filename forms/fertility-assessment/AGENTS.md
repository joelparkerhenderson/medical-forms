# Fertility Assessment

Fertility (sub-fertility) assessment aligned with NICE CG156, capturing reproductive history, menstrual and hormonal profile, lifestyle factors, and partner/semen analysis to guide investigation and treatment referral decisions.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Fertility clinic dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: NICE CG156 Fertility Assessment
- **Range**: Low / Moderate / High concern
- **Inputs**: age, duration trying, cycle regularity, AMH/AFC, semen analysis (WHO 2021), prior conception, BMI, comorbidities
- **Engine files**: `types.ts`, `fertility-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `fertility-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Reproductive History - `Step2ReproductiveHistory.svelte`
3. Menstrual Cycle History - `Step3MenstrualCycleHistory.svelte`
4. Medical & Surgical History - `Step4MedicalSurgicalHistory.svelte`
5. Lifestyle Factors - `Step5LifestyleFactors.svelte`
6. Current Medications & Supplements - `Step6MedicationsSupplements.svelte`
7. Partner Factors & Semen Analysis - `Step7PartnerSemenAnalysis.svelte`
8. Hormone Profile - `Step8HormoneProfile.svelte`
9. Investigations - `Step9Investigations.svelte`
10. Clinical Recommendation - `Step10ClinicalRecommendation.svelte`

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
