# Workplace Stress Assessment

Workplace stress assessment using the UK HSE Management Standards Indicator Tool to measure perceived stress across seven organisational domains and identify teams or individuals at elevated risk of work-related ill health.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Employee questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Occupational health dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: HSE Management Standards Indicator Tool (35 items, 1-5 Likert)
- **Range**: 7 domain scores + overall risk category (Low / Moderate / High / Very High)
- **Domains**: Demands, Control, Manager Support, Peer Support, Relationships, Role, Change
- **Categories**: Benchmarked against HSE percentile thresholds (20th, 50th, 80th)
- **Engine files**: `types.ts`, `stress-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `stress-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Demands - `Step2Demands.svelte`
3. Control - `Step3Control.svelte`
4. Manager Support - `Step4ManagerSupport.svelte`
5. Peer Support - `Step5PeerSupport.svelte`
6. Relationships - `Step6Relationships.svelte`
7. Role Clarity - `Step7RoleClarity.svelte`
8. Organisational Change - `Step8OrganisationalChange.svelte`
9. Additional Comments - `Step9AdditionalComments.svelte`

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
