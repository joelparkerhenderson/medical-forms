# Workplace Safety Assessment

Workplace safety audit form aligned with UK Health and Safety Executive (HSE) standards, covering physical, chemical, biological, ergonomic, and organisational risks to identify hazards and verify control measures in healthcare settings.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Auditor questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Safety officer dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: HSE Workplace Safety Audit Checklist
- **Range**: Compliant / Minor Findings / Major Findings / Critical Findings
- **Categories**:
  - Compliant: All controls in place
  - Minor Findings: Low-risk gaps, action within 90 days
  - Major Findings: Moderate-risk gaps, action within 30 days
  - Critical Findings: Imminent risk, immediate corrective action
- **Engine files**: `types.ts`, `safety-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `safety-grader.test.ts`

## Assessment steps (10 total)

1. Demographics & Site Details - `Step1DemographicsSiteDetails.svelte`
2. PPE & Hazard Controls - `Step2PPEHazardControls.svelte`
3. Chemical & Biological Hazards - `Step3ChemicalBiologicalHazards.svelte`
4. Electrical Safety - `Step4ElectricalSafety.svelte`
5. Fire Safety & Emergency Egress - `Step5FireSafetyEgress.svelte`
6. Ergonomics & Manual Handling - `Step6ErgonomicsManualHandling.svelte`
7. Emergency Procedures - `Step7EmergencyProcedures.svelte`
8. Training & Competence - `Step8TrainingCompetence.svelte`
9. Incident Reporting & Near Misses - `Step9IncidentReporting.svelte`
10. Sign-off & Action Plan - `Step10SignoffActionPlan.svelte`

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
