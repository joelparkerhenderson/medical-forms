# Employee Offboarding Checklist

Structured offboarding checklist ensuring every departing employee completes the administrative, operational, and knowledge-transfer steps required to protect patient safety, organisational data, and service continuity.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Employee/manager questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - HR dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Offboarding Completeness Validation
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All mandatory items confirmed
  - Partial: Non-blocking items outstanding
  - Incomplete: Mandatory items outstanding; requires escalation
- **Engine files**: `types.ts`, `checklist-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `checklist-validator.test.ts`

## Assessment steps (10 total)

1. Employee Details - `Step1EmployeeDetails.svelte`
2. Exit Interview - `Step2ExitInterview.svelte`
3. Knowledge Transfer - `Step3KnowledgeTransfer.svelte`
4. Equipment Return - `Step4EquipmentReturn.svelte`
5. Access Revocation - `Step5AccessRevocation.svelte`
6. Final Payroll & Benefits - `Step6FinalPayrollBenefits.svelte`
7. References & Recommendations - `Step7ReferencesRecommendations.svelte`
8. Non-Disclosure & Post-Employment - `Step8NonDisclosurePostEmployment.svelte`
9. Forwarding Details - `Step9ForwardingDetails.svelte`
10. Sign-off - `Step10Signoff.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure validation engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF report generation via /report/pdf server endpoint
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
