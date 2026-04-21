# Organ Donation Assessment

Organ donation assessment evaluates potential organ donors (living and deceased). Assesses medical suitability, organ function, immunological compatibility, and ethical/consent requirements. Uses donor risk index and organ-specific suitability scoring.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Donor Risk Index + Organ-Specific Suitability Scoring
- **Eligibility categories**:
  - Suitable: ideal donor, meets all criteria
  - Conditionally suitable: expanded criteria donor, acceptable with additional evaluation
  - Unsuitable: absolute contraindications present
- **Risk levels**:
  - Low: ideal donor profile
  - Moderate: expanded criteria donor
  - High: marginal organ function
  - Critical: contraindicated
- **Engine files**: `types.ts`, `donation-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `donation-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Donor Type & Registration - `Step2DonorTypeRegistration.svelte`
3. Medical History - `Step3MedicalHistory.svelte`
4. Organ Function Assessment - `Step4OrganFunction.svelte`
5. Infectious Disease Screening - `Step5InfectiousDisease.svelte`
6. Immunological Assessment - `Step6Immunological.svelte`
7. Surgical Assessment - `Step7SurgicalAssessment.svelte`
8. Psychological Assessment (Living Donor) - `Step8PsychologicalAssessment.svelte`
9. Ethical & Legal Requirements - `Step9EthicalLegal.svelte`
10. Eligibility & Allocation Decision - `Step10EligibilityAllocation.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- One continuous page with all sections visible
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
