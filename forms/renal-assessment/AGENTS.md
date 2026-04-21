# Renal Assessment

Renal (kidney) assessment aligned with KDIGO 2012/2024 CKD classification, stratifying chronic kidney disease by GFR category (G1-G5) and albuminuria category (A1-A3) to produce a composite risk level that drives management and referral.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Renal clinic dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: KDIGO CKD Classification (GFR × Albuminuria heatmap)
- **Range**: G1-G5 × A1-A3; composite risk Low / Moderate / High / Very High
- **Engine files**: `types.ts`, `kdigo-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `kdigo-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Presenting Symptoms - `Step2PresentingSymptoms.svelte`
3. CKD Risk Factors - `Step3CKDRiskFactors.svelte`
4. Physical Examination - `Step4PhysicalExamination.svelte`
5. Blood Tests - `Step5BloodTests.svelte`
6. Urine Tests - `Step6UrineTests.svelte`
7. Imaging & Biopsy Review - `Step7ImagingBiopsyReview.svelte`
8. Medication Review & Dose Adjustment - `Step8MedicationReviewDoseAdjustment.svelte`
9. Clinical Impression & KDIGO Stage - `Step9ClinicalImpressionKDIGOStage.svelte`

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
