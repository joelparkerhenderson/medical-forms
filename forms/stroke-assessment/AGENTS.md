# Stroke Assessment

Acute stroke evaluation using the NIHSS (National Institutes of Health Stroke Scale) with symptom onset timing, consciousness, motor/sensory examination, and risk factors.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Clinician dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option; Rust + Tera templates

## Scoring system

- **Instrument**: NIHSS (National Institutes of Health Stroke Scale)
- **Range**: 0-42
- **Categories**: 0 = No stroke symptoms, 1-4 = Minor, 5-15 = Moderate, 16-20 = Moderate to severe, 21-42 = Severe
- **Engine files**: `types.ts`, `nihss-grader.ts`, `nihss-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `nihss-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - Step1Demographics.svelte
2. Symptom Onset - Step2SymptomOnset.svelte
3. Level of Consciousness - Step3LevelOfConsciousness.svelte
4. Best Gaze & Visual - Step4BestGazeVisual.svelte
5. Facial Palsy & Motor - Step5FacialPalsyMotor.svelte
6. Limb Ataxia & Sensory - Step6LimbAtaxiaSensory.svelte
7. Language & Dysarthria - Step7LanguageDysarthria.svelte
8. Extinction & Inattention - Step8ExtinctionInattention.svelte
9. Risk Factors - Step9RiskFactors.svelte
10. Current Medications - Step10CurrentMedications.svelte

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
