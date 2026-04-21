# Medical Language Speaking Assessment for Cymraeg

Clinical Welsh-language (Cymraeg) speaking assessment for healthcare professionals working with Welsh-speaking patients, aligned to the NHS Wales "More Than Just Words" framework and mapped to CEFR levels A1 through C2 with criteria covering fluency, grammar, pronunciation, and clinical appropriateness.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Examiner form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Exam admin dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: NHS Wales Clinical Welsh Language Speaking Assessment (CEFR-mapped)
- **Range**: CEFR A1 to C2
- **Criteria**: Fluency, Grammar, Pronunciation, Clinical Appropriateness
- **Engine files**: `types.ts`, `cymraeg-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `cymraeg-grader.test.ts`

## Assessment steps (5 total)

1. Candidate Details - `Step1CandidateDetails.svelte`
2. Role-play 1 — Sgwrs gyda Chlaf - `Step2RolePlay1.svelte`
3. Role-play 2 — Esboniad Clinigol - `Step3RolePlay2.svelte`
4. Assessment Criteria Rating - `Step4AssessmentCriteria.svelte`
5. Overall CEFR Level & Feedback - `Step5OverallCEFRLevelFeedback.svelte`

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
- NHS Wales Welsh Language Standards / Welsh Language Measure 2011
