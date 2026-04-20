# Code of Conduct Notice

Read-and-acknowledge code of conduct notice presenting the twelve core principles that medical-service providers and supporting staff must uphold, with signature capture to record acknowledgement.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Recipient form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Compliance dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Completeness Validation
- **Range**: Complete / Incomplete
- **Categories**:
  - Complete: All acknowledgement fields filled
  - Incomplete: One or more missing
- **Engine files**: `types.ts`, `form-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `form-validator.test.ts`

## Assessment steps (3 total)

1. Recipient Details - `Step1RecipientDetails.svelte`
2. Code of Conduct Notice - `Step2CodeOfConductNotice.svelte`
3. Acknowledgement & Signature - `Step3AcknowledgementSignature.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure validation engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- Vitest unit tests for validation logic

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
