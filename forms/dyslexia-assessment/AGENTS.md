# Dyslexia Assessment

Specific learning difficulty evaluation using standardised scores for reading, writing, spelling, phonological processing, working memory, and processing speed with severity classification.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Standardised score assessment battery
- **Range**: Standard scores (mean 100, SD 15)
- **Categories**:
  - Standard score 85-115: Average (no dyslexia)
  - Standard score 70-84: Below average (mild dyslexia)
  - Standard score 55-69: Well below average (moderate dyslexia)
  - Standard score <55: Significantly below average (severe dyslexia)
- **Severity levels**:
  - No dyslexia: All scores within normal limits
  - Mild: Borderline scores, some difficulties
  - Moderate: Below average, consistent pattern of difficulty
  - Severe: Significantly below average, pervasive impact
- **Engine files**: `types.ts`, `dyslexia-grader.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `dyslexia-grader.test.ts`

## Assessment steps (10 total)

1. Demographics - `Step1Demographics.svelte`
2. Developmental History - `Step2DevelopmentalHistory.svelte`
3. Educational Background - `Step3EducationalBackground.svelte`
4. Reading Assessment - `Step4ReadingAssessment.svelte`
5. Writing & Spelling Assessment - `Step5WritingSpelling.svelte`
6. Phonological Processing - `Step6PhonologicalProcessing.svelte`
7. Working Memory & Processing Speed - `Step7WorkingMemoryProcessingSpeed.svelte`
8. Emotional & Behavioural Impact - `Step8EmotionalBehavioural.svelte`
9. Previous Support & Interventions - `Step9PreviousSupport.svelte`
10. Recommendations & Support Plan - `Step10RecommendationsSupportPlan.svelte`

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
