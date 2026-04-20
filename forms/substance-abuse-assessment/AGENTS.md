# Substance Abuse Assessment

Substance use disorder evaluation using AUDIT (Alcohol Use Disorders Identification Test) and DAST-10 (Drug Abuse Screening Test) with comprehensive biopsychosocial assessment.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instruments**: AUDIT (0-40) + DAST-10 (0-10)
- **AUDIT Categories**:
  - Low risk (0-7): Education on safe drinking
  - Hazardous (8-15): Simple advice and brief intervention
  - Harmful (16-19): Brief intervention and continued monitoring
  - Dependence likely (20-40): Referral to specialist for diagnostic evaluation and treatment
- **DAST-10 Categories**:
  - No problems (0): No intervention needed
  - Low level (1-2): Monitor and reassess
  - Moderate level (3-5): Further investigation and brief intervention
  - Substantial level (6-8): Intensive assessment and treatment
  - Severe level (9-10): Intensive assessment and treatment, referral to specialist
- **Combined Severity**: low, moderate, high, critical (active withdrawal/overdose risk)
- **Engine files**: `types.ts`, `substance-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `substance-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Alcohol Use (AUDIT) - `Step2AlcoholUseAudit.svelte`
3. Drug Use (DAST-10) - `Step3DrugUseDast.svelte`
4. Substance Use History - `Step4SubstanceUseHistory.svelte`
5. Withdrawal Assessment - `Step5WithdrawalAssessment.svelte`
6. Mental Health Comorbidities - `Step6MentalHealthComorbidities.svelte`
7. Physical Health Impact - `Step7PhysicalHealthImpact.svelte`
8. Social & Legal Impact - `Step8SocialLegalImpact.svelte`
9. Previous Treatment History - `Step9PreviousTreatmentHistory.svelte`
10. Treatment Planning & Goals - `Step10TreatmentPlanningGoals.svelte`

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
