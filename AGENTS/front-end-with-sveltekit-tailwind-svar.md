# Front-end with SvelteKit Tailwind SVAR

Ultrathink.

Slug: front-end-with-sveltekit-tailwind-svar

- Search pattern: "forms/\*/front-end-\*-with-svelte"

## Technology stack

| Component                                                 | Version | Purpose                                                         |
| --------------------------------------------------------- | ------- | --------------------------------------------------------------- |
| [SvelteKit](https://svelte.dev/docs/kit/introduction)     | 2.x     | Full-stack web framework                                        |
| [Svelte](https://svelte.dev/)                             | 5.x     | UI reactivity with runes                                        |
| [TypeScript](https://www.typescriptlang.org/)             | 5.x     | Type-safe development                                           |
| [Tailwind CSS](https://tailwindcss.com/)                  | 4.x     | Utility-first styling with `@import 'tailwindcss'` and `@theme` |
| [SVAR Svelte Core](https://svar.dev/svelte/core/)         | 2.x     | Base UI components and Willow theme                             |
| [SVAR Svelte DataGrid](https://svar.dev/svelte/datagrid/) | 2.x     | Data table with sort/filter                                     |
| [Vite](https://vite.dev/)                                 | 7.x     | Build tool and dev server                                       |
| [pdfmake](https://pdfmake.github.io/docs/)                | 0.2.x   | Server-side PDF report generation                               |
| [Vitest](https://vitest.dev/)                             | 3.x     | Unit testing for grading logic                                  |

## Svelte 5 runes

- `$state()` for reactive state
- `$derived()` for computed values
- `$bindable()` for two-way prop binding
- `$props()` for component props
- `$effect()` for side effects (used sparingly)

## State management

Uses Svelte 5 class-based reactive state (`assessment.svelte.ts`):

- `assessment.data` — complete questionnaire responses
- `assessment.result` — grading result (null until submitted)
- `assessment.currentStep` — current wizard step
- `assessment.reset()` — clear all data

## Patient form pattern

1. Multi-step wizard with `StepNavigation` and `ProgressBar`
2. Pure scoring engine: `types.ts` → `*-rules.ts` → `*-grader.ts` → `flagged-issues.ts`
3. Class-based Svelte 5 reactive store (`assessment.svelte.ts`)
4. PDF report generation via server endpoint (`/report/pdf`)
5. Vitest unit tests for grading logic

## Clinician dashboard pattern

- SVAR DataGrid with sortable columns and dropdown filters
- `Willow` theme wrapper for consistent styling
- `Grid` component with columns, sorting, and filtering
- API access via `init` callback for programmatic control
- `api.exec('sort-rows', ...)` for sorting
- `api.exec('filter-rows', ...)` for filtering
- Backend API client with sample data fallback
- Patient list with assessment scores and status indicators

## UI components

Reusable form components in `src/lib/components/ui/`:

- `$bindable()` props for two-way data flow
- Tailwind utility classes for styling
- Proper `<label>` associations and accessible markup
- Mobile-first responsive design

## Conventions

- Empty string `''` for unanswered text fields
- `null` for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named `StepNName.svelte` (1-indexed)
- UI components in `src/lib/components/ui/`
