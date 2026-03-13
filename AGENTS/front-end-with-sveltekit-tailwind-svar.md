### Front-end with SvelteKit Tailwind SVAR

Slug: front-end-with-sveltekit-tailwind-svar

| Component                                                 | Version | Purpose                     |
| --------------------------------------------------------- | ------- | --------------------------- |
| [SvelteKit](https://svelte.dev/docs/kit/introduction)     | 2.x     | Full-stack web framework    |
| [Svelte](https://svelte.dev/)                             | 5.x     | UI reactivity with runes    |
| [TypeScript](https://www.typescriptlang.org/)             | 5.x     | Type-safe development       |
| [Tailwind CSS](https://tailwindcss.com/)                  | 4.x     | Utility-first styling       |
| [SVAR Svelte Core](https://svar.dev/svelte/core/)         | ?       | ?                           |
| [SVAR Svelte DataGrid](https://svar.dev/svelte/datagrid/) | 2.x     | Data table with sort/filter |
| [Vite](https://vite.dev/)                                 | 7.x     | Build tool and dev server   |

#### Svelte 5 Runes

- `$state()` for reactive state
- `$derived()` for computed values
- `$bindable()` for two-way prop binding
- `$props()` for component props
- `$effect()` for side effects (used sparingly)

#### Svelte 5 State Management

Uses Svelte 5 class-based reactive state:

- `assessment.data` - Complete questionnaire responses
- `assessment.result` - Grading result (null until submitted)
- `assessment.currentStep` - Current wizard step
- `assessment.reset()` - Clear all data

#### Svelte 5 UI Components

Reusable form components with consistent patterns:

- `$bindable()` props for two-way data flow
- Tailwind utility classes for styling
- Proper `<label>` associations and accessible markup
- Mobile-first responsive design

#### Svelte 5 Conventions

- Empty string `''` for unanswered text fields
- `null` for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named `StepNName.svelte` (1-indexed)
- UI components in `src/lib/components/ui/`

#### SVAR Svelte Grid

- Package: `@svar-ui/svelte-grid`
- `Willow` theme wrapper for consistent styling
- `Grid` component with columns, sorting, and filtering
- API access via `init` callback for programmatic control
- `api.exec('sort-rows', ...)` for sorting
- `api.exec('filter-rows', ...)` for filtering
