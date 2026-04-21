# Post-Operative Report

Structured post-operative (operation note) report documenting the procedure, intra-operative findings, anaesthesia summary, specimens and implants, immediate recovery status, complications, and onward plan, with complication grading by the Clavien-Dindo classification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Clavien-Dindo Classification of Surgical Complications
- **Range**: Grade 0 through Grade V
- **Categories**: See index.md for full grade definitions
- **Engine files**: `types.ts`, `clavien-dindo-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `clavien-dindo-grader.test.ts`

## Assessment steps (10 total)

1. Patient Details - `Step1PatientDetails.svelte`
2. Procedure Details - `Step2ProcedureDetails.svelte`
3. Surgical Team - `Step3SurgicalTeam.svelte`
4. Intra-operative Findings - `Step4IntraoperativeFindings.svelte`
5. Anaesthesia Summary - `Step5AnaesthesiaSummary.svelte`
6. Estimated Blood Loss & Fluid Balance - `Step6BloodLossFluidBalance.svelte`
7. Specimens & Implants - `Step7SpecimensImplants.svelte`
8. Immediate Post-op Status - `Step8ImmediatePostopStatus.svelte`
9. Complications Assessment - `Step9ComplicationsAssessment.svelte`
10. Post-op Plan & Instructions - `Step10PostopPlanInstructions.svelte`

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
