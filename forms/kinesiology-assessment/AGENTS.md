# Kinesiology Assessment

Functional movement screening using the FMS (Functional Movement Screen) with 7 standardised movement tests.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: FMS Score
- **Range**: 0-21
- **Categories**: 0-14 = Increased injury risk, 15-17 = Moderate risk, 18-21 = Low risk
- **Engine files**: `types.ts`, `fms-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `fms-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - Step1Demographics.svelte
2. Referral Information - Step2ReferralInformation.svelte
3. Movement History - Step3MovementHistory.svelte
4. Deep Squat - Step4DeepSquat.svelte
5. Hurdle Step - Step5HurdleStep.svelte
6. In-Line Lunge - Step6InLineLunge.svelte
7. Shoulder Mobility - Step7ShoulderMobility.svelte
8. Active Straight Leg Raise - Step8ActiveStraightLegRaise.svelte
9. Trunk Stability Push-Up - Step9TrunkStabilityPushUp.svelte
10. Rotary Stability - Step10RotaryStability.svelte

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
