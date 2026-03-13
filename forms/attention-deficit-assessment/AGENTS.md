# Attention Deficit Assessment

ADHD screening using the ASRS (Adult ADHD Self-Report Scale) v1.1 screener.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: ASRS Screener (Adult ADHD Self-Report Scale v1.1)
- **Range**: Part A (6 questions, screener) + Part B (12 questions, supplemental)
- **Categories**: Part A items scored against clinically validated thresholds; 4+ darkly shaded responses in Part A = highly consistent with ADHD diagnosis
- **Engine files**: `types.ts`, `asrs-grader.ts`, `asrs-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `asrs-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. ASRS Part A Screener - `Step2AsrsPartA.svelte`
3. ASRS Part B - `Step3AsrsPartB.svelte`
4. Childhood History - `Step4ChildhoodHistory.svelte`
5. Functional Impact - `Step5FunctionalImpact.svelte`
6. Comorbid Conditions - `Step6ComorbidConditions.svelte`
7. Current Medications - `Step7CurrentMedications.svelte`
8. Allergies - `Step8Allergies.svelte`
9. Medical History - `Step9MedicalHistory.svelte`
10. Social & Support - `Step10SocialSupport.svelte`

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
