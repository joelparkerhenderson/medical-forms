# Front-end with SvelteKit Tailwind SVAR

Ultrathink.

SvelteKit single-page form and SVAR-based dashboard, styled with Tailwind
CSS 4 and powered by a pure Svelte 5 reactive scoring engine.

Slug: front-end-with-sveltekit-tailwind-svar

- Search pattern: `forms/*/front-end-*-with-svelte`

## Technology stack

| Component                                                 | Version | Purpose                                                         |
| --------------------------------------------------------- | ------- | --------------------------------------------------------------- |
| [SvelteKit](https://svelte.dev/docs/kit/introduction)     | 2.x     | Full-stack web framework                                        |
| [Svelte](https://svelte.dev/)                             | 5.x     | UI reactivity with runes                                        |
| [TypeScript](https://www.typescriptlang.org/)             | 5.x     | Type-safe development                                           |
| [Tailwind CSS](https://tailwindcss.com/)                  | 4.x     | Utility-first styling with `@import 'tailwindcss'` and `@theme` |
| [SVAR Svelte Core](https://svar.dev/svelte/core/)         | 2.x     | Base UI components and Willow theme                             |
| [SVAR Svelte DataGrid](https://svar.dev/svelte/datagrid/) | 2.x     | Data table with sort and filter                                 |
| [Vite](https://vite.dev/)                                 | 7.x     | Build tool and dev server                                       |
| [pdfmake](https://pdfmake.github.io/docs/)                | 0.2.x   | Server-side PDF report generation                               |
| [Vitest](https://vitest.dev/)                             | 3.x     | Unit testing for grading logic                                  |

## Svelte 5 runes

- `$state()` — reactive state
- `$derived()` — computed values
- `$bindable()` — two-way prop binding
- `$props()` — component props
- `$effect()` — side effects (used sparingly)

## State management

Svelte 5 class-based reactive state in `src/lib/stores/assessment.svelte.ts`:

- `assessment.data` — complete questionnaire responses
- `assessment.result` — grading result (null until submitted)
- `assessment.currentStep` — current wizard step
- `assessment.reset()` — clear all data

Do not use Svelte 3/4 `writable` stores. Class-based runes stores are the
convention across this monorepo.

## Form pattern

1. Single-page, step-by-step wizard using `StepNavigation` and `ProgressBar` components
2. Pure scoring engine split into small files: `types.ts` → `*-rules.ts` → `*-grader.ts` → `flagged-issues.ts`
3. Class-based reactive store (`assessment.svelte.ts`) owns all questionnaire state
4. PDF report generation via SvelteKit server endpoint (`/report/pdf`) using `pdfmake`
5. Vitest unit tests cover the grading engine end-to-end

## Dashboard pattern

- `Willow` theme wrapper for consistent styling
- `Grid` component with columns, sorting, and filtering
- API access via `init` callback for programmatic control
  - `api.exec('sort-rows', ...)` — sort rows programmatically
  - `api.exec('filter-rows', ...)` — filter rows programmatically
- Backend API client with in-memory sample data fallback when offline
- Row list shows computed scores, severities, and safety flags

## UI components

Reusable form components in `src/lib/components/ui/`:

- `$bindable()` props for two-way data flow
- Tailwind utility classes for styling
- Proper `<label>` associations and accessible ARIA markup
- Mobile-first responsive design

## Conventions

- Empty string `''` for unanswered text fields
- `null` for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named `StepNName.svelte` (1-indexed; no spaces, ampersands, or parentheses in filename)
- UI components in `src/lib/components/ui/`
- Pure scoring engine — no side effects, no network calls, no `$effect`

## Commands

From a form's `front-end-*-with-svelte/` directory:

```sh
npm install               # Install dependencies
npm run dev               # Start dev server (default port 5173)
npm run build             # Production build
npm run preview           # Preview production build
npm run check             # Svelte type-check
npm test                  # Run Vitest unit tests
```

## Verify

```sh
for d in forms/*/front-end-*-with-svelte; do
  (cd "$d" && npm run check && npm test) || echo "FAIL: $d"
done
```
