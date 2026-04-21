# Lifeguard Certification Checklist

Pool / beach lifeguard certification checklist aligned with the RLSS UK National Pool Lifeguard Qualification (NPLQ) and International Life Saving Federation (ILSF) competencies, covering supervision and scanning, physical fitness, rescue scenarios, CPR / AED, first aid, and legal / regulatory knowledge.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Examiner form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Training coordinator dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack Rust backend

## Scoring system

- **Instrument**: Lifeguard Competency Verification Checklist (RLSS NPLQ / ILSF-aligned)
- **Range**: Pass / Fail / Needs Development
- **Critical competencies** (any failure → Fail): timed swim, unconscious-casualty rescue, spinal handling, CPR with compressions to depth/rate, AED delivery, scanning effectiveness
- **Engine files**: `types.ts`, `lifeguard-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `lifeguard-grader.test.ts`

## Assessment steps (10 total)

1. Candidate Details - `Step1CandidateDetails.svelte`
2. Physical Fitness & Swim Competency - `Step2PhysicalFitnessSwim.svelte`
3. Supervision, Scanning & Zoning - `Step3SupervisionScanningZoning.svelte`
4. Rescue Scenario — Conscious Casualty - `Step4RescueConscious.svelte`
5. Rescue Scenario — Unconscious Casualty - `Step5RescueUnconscious.svelte`
6. Spinal Injury Management - `Step6SpinalInjuryManagement.svelte`
7. CPR & AED - `Step7CPRAED.svelte`
8. First Aid & Oxygen Therapy - `Step8FirstAidOxygenTherapy.svelte`
9. Legal, Regulatory & Incident Reporting - `Step9LegalRegulatoryIncident.svelte`
10. Overall Result, Feedback & Signoff - `Step10OverallResultSignoff.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF certificate generation via /report/pdf server endpoint
- Vitest unit tests for grading logic

## Dashboard

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
- UK HSE HSG179 "Managing health and safety in swimming pools"
