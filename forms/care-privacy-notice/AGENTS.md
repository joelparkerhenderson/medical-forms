# Care Privacy Notice

Read-and-acknowledge privacy notice form based on the BMA GDPR template for GP practices. Patients read the notice, confirm understanding, and provide their name and date.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./sql-migrations/ - PostgreSQL schema migrations
- ./xml-representations/ - XML and DTD per SQL table entity
- ./fhir-r5/ - FHIR HL7 R5 JSON per SQL table entity
- ./front-end-form-with-html/ - Patient form (HTML)
- ./front-end-form-with-svelte/ - Patient form (SvelteKit)
- ./front-end-dashboard-with-html/ - Dashboard (HTML)
- ./front-end-dashboard-with-svelte/ - Dashboard (SvelteKit)

## Scoring system

- **Instrument**: Completeness Validation
- **Range**: Complete / Incomplete
- **Categories**:
  - Complete: All acknowledgment fields filled
  - Incomplete: One or more missing
- **Engine files**: `types.ts`, `form-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `form-validator.test.ts`

## Assessment steps (3 total)

1. Practice Configuration - `Step1PracticeConfiguration.svelte`
2. Privacy Notice - `Step2PrivacyNotice.svelte`
3. Acknowledgment & Signature - `Step3AcknowledgmentSignature.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure validation engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- Vitest unit tests for validation logic

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
