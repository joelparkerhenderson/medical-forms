# Encounter Satisfaction

Patient encounter satisfaction survey for collecting feedback on healthcare experiences.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-form-with-svelte/ - Patient questionnaire; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-dashboard-with-svelte/ - Dashboard (to be built)
- ./full-stack-with-rust-axum-loco-tera/ - Full-stack option (to be built)

## Scoring system

- **Instrument**: Encounter Satisfaction Score (ESS), inspired by PSQ-18 and HCAHPS
- **Scale**: 5-point Likert (1=Very Dissatisfied ... 5=Very Satisfied), `null` when unanswered
- **Range**: 1.0 - 5.0 (composite mean of all answered questions)
- **19 questions across 6 domains**:
  - Access & Scheduling (3 questions)
  - Communication (4 questions)
  - Staff & Professionalism (3 questions)
  - Care Quality (3 questions)
  - Environment (3 questions)
  - Overall Satisfaction (3 questions)
- **Categories**:
  - 4.5 - 5.0: Excellent
  - 3.5 - 4.4: Good
  - 2.5 - 3.4: Fair
  - 1.5 - 2.4: Poor
  - 1.0 - 1.4: Very Poor
- **Engine files**: `types.ts`, `satisfaction-grader.ts`, `satisfaction-questions.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `satisfaction-grader.test.ts`

## Flagged issues

- **High priority**: Any question rated 1 (Very Dissatisfied); any communication question rated ≤ 2
- **Medium priority**: Any question rated 2 (Dissatisfied); overall mean ≤ 2.4 (Poor)
- **Low priority**: First-time patient with fair satisfaction (mean 2.5-3.4)

## Assessment steps (8 total)

1. Demographics - `Step1Demographics.svelte`
2. Visit Information - `Step2VisitInformation.svelte`
3. Access & Scheduling - `Step3AccessScheduling.svelte`
4. Communication - `Step4Communication.svelte`
5. Staff & Professionalism - `Step5StaffProfessionalism.svelte`
6. Care Quality - `Step6CareQuality.svelte`
7. Environment - `Step7Environment.svelte`
8. Overall Satisfaction - `Step8OverallSatisfaction.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF report generation via /report/pdf server endpoint
- Vitest unit tests for grading logic

## Conventions

- Empty string '' for unanswered text fields
- null for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named StepNName.svelte (1-indexed)
- UI components in src/lib/components/ui/
