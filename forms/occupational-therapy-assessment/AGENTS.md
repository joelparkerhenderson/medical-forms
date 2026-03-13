# Occupational Therapy Assessment

Functional performance evaluation using the COPM (Canadian Occupational Performance Measure) across self-care, productivity, and leisure domains.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: COPM (Canadian Occupational Performance Measure)
- **Range**: Performance (1-10), Satisfaction (1-10)
- **Categories**: <5 = Significant issues, 5-7 = Moderate concerns, >7 = Good performance
- **Engine files**: `types.ts`, `copm-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `copm-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Referral Information - `Step2ReferralInformation.svelte`
3. Self-Care Activities - `Step3SelfCareActivities.svelte`
4. Productivity Activities - `Step4ProductivityActivities.svelte`
5. Leisure Activities - `Step5LeisureActivities.svelte`
6. Performance Ratings - `Step6PerformanceRatings.svelte`
7. Satisfaction Ratings - `Step7SatisfactionRatings.svelte`
8. Environmental Factors - `Step8EnvironmentalFactors.svelte`
9. Physical & Cognitive Status - `Step9PhysicalAndCognitiveStatus.svelte`
10. Goals & Priorities - `Step10GoalsAndPriorities.svelte`

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

## Backend

- Rust edition 2024 with Loco 0.16 framework
- axum 0.8 web framework
- SeaORM 1.1 with PostgreSQL
- Engine types mirror TypeScript with serde(rename_all = "camelCase")

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
