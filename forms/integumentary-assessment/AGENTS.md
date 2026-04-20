# Integumentary Assessment

Structured integumentary (skin, hair, nails) clinical assessment combining a head-to-toe skin inspection with the Braden Scale for pressure ulcer risk and wound TIME assessment, to grade pressure-ulcer risk and characterise integumentary findings.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Tissue-viability dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Braden Scale + Integumentary System Review
- **Range**: Braden 6-23 (lower = higher risk)
- **Categories**:
  - Very High Risk (≤ 9)
  - High Risk (10-12)
  - Moderate Risk (13-14)
  - Mild Risk (15-18)
  - No Risk (19-23)
- **Engine files**: `types.ts`, `integumentary-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `integumentary-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Presenting Skin Concern - `Step2PresentingSkinConcern.svelte`
3. Skin Inspection - `Step3SkinInspection.svelte`
4. Hair & Scalp Examination - `Step4HairScalpExamination.svelte`
5. Nail Examination - `Step5NailExamination.svelte`
6. Wound Assessment - `Step6WoundAssessment.svelte`
7. Braden Scale Scoring - `Step7BradenScaleScoring.svelte`
8. Photography & Documentation - `Step8PhotographyDocumentation.svelte`
9. Clinical Impression & Care Plan - `Step9ClinicalImpressionCarePlan.svelte`

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
