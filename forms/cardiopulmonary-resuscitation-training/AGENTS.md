# Cardiopulmonary Resuscitation Training

Basic Life Support (BLS) cardiopulmonary resuscitation competency assessment aligned with AHA/Resuscitation Council (UK) guidelines, used to certify rescuers on adult BLS and AED skills with pass/fail criteria and critical-action review.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Examiner questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Training coordinator dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: AHA BLS Skills Verification Checklist
- **Range**: Pass / Fail
- **Categories**:
  - Pass: All required skills demonstrated, no critical-action failure
  - Fail: Any critical-action failure OR >2 non-critical deficiencies
- **Critical actions**: compressions to BLS-standard rate (100-120/min) and depth (5-6 cm), effective ventilations, AED delivery without unsafe contact
- **Engine files**: `types.ts`, `bls-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `bls-grader.test.ts`

## Assessment steps (8 total)

1. Trainee Details - `Step1TraineeDetails.svelte`
2. Scene Safety & Initial Assessment - `Step2SceneSafetyAssessment.svelte`
3. Responsiveness & Breathing Check - `Step3ResponsivenessBreathing.svelte`
4. Activate Emergency Response - `Step4ActivateEmergencyResponse.svelte`
5. Chest Compressions - `Step5ChestCompressions.svelte`
6. Airway & Rescue Breaths - `Step6AirwayRescueBreaths.svelte`
7. AED Use & Shock Delivery - `Step7AEDShockDelivery.svelte`
8. Team Dynamics, Handoff & Feedback - `Step8TeamDynamicsHandoff.svelte`

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
