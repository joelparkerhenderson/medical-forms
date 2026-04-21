# Sports Medicine Assessment

Pre-participation physical evaluation (PPE) for athletes and sportspeople, aligned with the AAP/AAFP/ACSM/AMSSM/AOSSM/AOASM Pre-Participation Physical Evaluation (5th ed.) monograph, to clear participation, identify risk, and plan follow-up.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Athlete / clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Sports medicine dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Pre-Participation Physical Evaluation (5th ed.)
- **Range**: Cleared / Cleared with Conditions / Not Cleared Pending Further Evaluation / Not Cleared for Sport
- **Engine files**: `types.ts`, `ppe-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `ppe-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Sport & Position Details - `Step2SportPositionDetails.svelte`
3. Medical History - `Step3MedicalHistory.svelte`
4. Family History - `Step4FamilyHistory.svelte`
5. Menstrual History / RED-S Screening - `Step5MenstrualHistoryREDS.svelte`
6. Cardiovascular Screening - `Step6CardiovascularScreening.svelte`
7. Musculoskeletal Screening - `Step7MusculoskeletalScreening.svelte`
8. Neurological & Concussion Baseline - `Step8NeurologicalConcussionBaseline.svelte`
9. Vision & Skin - `Step9VisionSkin.svelte`
10. Clearance Decision - `Step10ClearanceDecision.svelte`

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
