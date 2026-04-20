# Post-Traumatic Stress Assessment

Post-traumatic stress symptom screen based on the DSM-5-aligned PCL-5 (PTSD Checklist for DSM-5), used by clinicians to identify probable PTSD, monitor severity, and track response to trauma-focused therapy.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: PCL-5 (PTSD Checklist for DSM-5) — 20 items scored 0-4
- **Range**: 0-80 total score
- **Categories**:
  - Minimal (0-20)
  - Mild (21-32)
  - Moderate (33-37) — probable PTSD threshold
  - Severe (38-80)
- **Engine files**: `types.ts`, `pcl5-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `pcl5-grader.test.ts`

## Assessment steps (6 total)

1. Demographics - `Step1Demographics.svelte`
2. Trauma Event Identification - `Step2TraumaEventIdentification.svelte`
3. Intrusion Symptoms (Cluster B) - `Step3IntrusionSymptoms.svelte`
4. Avoidance Symptoms (Cluster C) - `Step4AvoidanceSymptoms.svelte`
5. Negative Alterations in Cognitions & Mood (Cluster D) - `Step5NegativeAlterations.svelte`
6. Alterations in Arousal & Reactivity (Cluster E) - `Step6ArousalReactivity.svelte`

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
