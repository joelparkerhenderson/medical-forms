# Audio-Vestibular Assessment

Combined audiology and vestibular (balance) assessment capturing presenting symptoms, otoscopic and audiometric findings, tympanometry, vestibular screening tests, and the Dizziness Handicap Inventory (DHI) to classify hearing loss severity and quantify vestibular handicap.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Audiology/ENT dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: WHO pure-tone audiometry grades + Dizziness Handicap Inventory
- **Range**: Normal / Mild / Moderate / Moderately Severe / Severe / Profound; DHI 0-100
- **Engine files**: `types.ts`, `audio-vestibular-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `audio-vestibular-grader.test.ts`

## Assessment steps (9 total)

1. Demographics - `Step1Demographics.svelte`
2. Presenting Symptoms - `Step2PresentingSymptoms.svelte`
3. Otoscopic Examination - `Step3OtoscopicExamination.svelte`
4. Pure-Tone Audiometry - `Step4PureToneAudiometry.svelte`
5. Speech Audiometry - `Step5SpeechAudiometry.svelte`
6. Tympanometry & Acoustic Reflexes - `Step6TympanometryAcousticReflexes.svelte`
7. Vestibular Screening - `Step7VestibularScreening.svelte`
8. Dizziness Handicap Inventory - `Step8DizzinessHandicapInventory.svelte`
9. Clinical Impression & Referral - `Step9ClinicalImpressionReferral.svelte`

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
