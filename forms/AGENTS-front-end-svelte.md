# AGENTS — `front-end-with-svelte/` (Lily Design System Svelte headless)

Conventions for every form's **consolidated** `front-end-with-svelte/`
subproject — a single SvelteKit app that serves both the input form (wizard)
and the dashboard from **RESTful, resource-oriented routes**, sharing one
scoring engine (`src/lib/engine/`) and UI component set
(`src/lib/components/ui/`). This consolidated single-app layout with RESTful,
slug-nested routes is the **only** layout in the monorepo — the legacy split
`front-end-form-with-svelte/` + `front-end-dashboard-with-svelte/` directories
and the older flat `+page.svelte` (wizard) / `dashboard/+page.svelte` layout no
longer exist anywhere; every form was migrated to the routes below.

## Routing (RESTful, gold standard)

**Route layout (canonical):** every route is nested under a per-form directory
named by the **form's kebab-case slug** (`src/routes/<form-kebab-case>/`), so
the app is served at `/<slug>/`. Within it, the URL space is the form's
**collection**, named by the **pluralized slug** (the form's resource name —
e.g. `cardiology-requests`, `medical-operation-notes`). Collections use a
plural base directory; individual items use a dynamic `[id]` route parameter:

| Route file                                            | URL                            | Purpose                                                                                                                                                                       |
| ----------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/<slug>/<plural>/+page.svelte`             | `/<slug>/<plural>/`            | **Dashboard** — the collection list                                                                                                                                           |
| `src/routes/<slug>/<plural>/[id]/+page.svelte`        | `/<slug>/<plural>/[id]`        | **Input form** — the single-page wizard for one item (`[id] = new` to create)                                                                                                 |
| `src/routes/<slug>/<plural>/[id]/report/+page.svelte` | `/<slug>/<plural>/[id]/report` | Report view for one item (PDF via `report/pdf/+server.ts`)                                                                                                                    |
| `src/routes/<slug>/+page.svelte`                      | `/<slug>/`                     | **Welcome page** — one-sentence summary, links to every route choice, then a detailed user-friendly explanation of the form and its specification                             |
| `src/routes/+server.ts`                               | `/`                            | **Root redirect** — a bare `GET` handler that 307-redirects to `/<slug>/`, so visiting the dev server (or a deployed root) at `/` lands on the welcome page instead of 404ing |

So for the `cardiology-request` form (slug), everything lives under
`src/routes/cardiology-request/`: `/cardiology-request/cardiology-requests/` is
the dashboard list and `/cardiology-request/cardiology-requests/[id]` (e.g.
`…/new`) is the input form. Internal route links (`href`/`goto`) are absolute
and include the `/<slug>` prefix; `/api/` fetch paths do not. Do **not** put
routes directly under `src/routes/` (no `<slug>/` parent) — that is the legacy
layout, with one exception: `src/routes/+server.ts` at the true root, whose
only job is redirecting `/` to `/<slug>/`:

```ts
import { redirect } from "@sveltejs/kit";

export function GET() {
  redirect(307, "/<slug>/");
}
```

The form-root (`/<slug>/`) is a **welcome page**, not a form and not a
dashboard. It is a plain `+page.svelte` (no redirect loader), structured in
this order:

1. **One-sentence summary.** A single sentence naming the form and what it's
   for — not a paragraph. This is the whole `<h1>`/eyebrow standfirst; save
   detail for step 3.
2. **Links to every route choice.** A prominent link for each working
   surface this form exposes — at minimum the input form
   (`/<slug>/<plural>/new`) and the dashboard (`/<slug>/<plural>/`); forms
   with additional surfaces (e.g. a report-view route) link those too. Put
   the links right after the summary, above the detailed explanation, so a
   returning user can jump straight in without reading further.
3. **Detailed explanation, in user-friendly wording.** What the form
   captures, why, and what the shared engine computes from it — then its
   specification: that it's spec-driven (the living domain spec defines the
   data model, the grading engine, and the flag rules, and the same engine
   grades every surface) and what it's clinically/documentarily grounded in.
   Plain language over jargon; this is the section a first-time visitor
   reads to decide whether the tool is relevant to them.

The nav in `+layout.svelte` links its brand to `/<slug>/` and exposes
Welcome / form / dashboard.
Reference implementations: `forms/cardiology-request/` and
`forms/cardiology-response/`.

## Theming (Lily themes, gold standard)

Every `front-end-with-svelte/` uses the **prebuilt Lily Design System theme
system** — do not hand-roll theme CSS.

- **Vendored themes.** All Lily theme stylesheets are copied to
  `static/themes/<name>.css` (light, dark, dim, dracula, nord, the NHS
  England/Scotland/Wales patient & practitioner themes, GDS, USWDS, …). Each is
  a standalone file; **exactly one loads at a time** via a swappable
  `<link data-lily-theme-picker>` that the `ThemePicker` component injects and
  swaps itself (they cannot be `@import`-ed together — each includes a bare
  `:where(:root)` block and they would collide).
- **The default theme is the Lily light theme.** The `@theme` block in
  `app.css` carries the Lily _light_ token values, so the baseline render is
  Lily light before any stylesheet loads; the persisted default selection is
  `light` (`src/lib/config/themes.ts` `DEFAULT_THEME`). There is no "system"
  option (it would 404 on a missing stylesheet).
- **Prebuilt control.** Switch themes with the Lily `ThemePicker` component
  (`src/lib/components/ui/`), mirroring
  `lily-design-system-svelte-helpers/lily-design-system-svelte-theme-picker`:
  a single-glyph icon button (◑) that opens a headless listbox. Called with
  `themesUrl`/`themes`/`themeLabels`/`defaultValue`/`storageKey` props and
  manages its own `<link>` swap, `data-theme` attribute, and localStorage
  persistence internally.
- **LocalePicker sits before ThemePicker** in the header nav, the headless
  sibling of `ThemePicker` (single-glyph 🌐 icon button + listbox, `locales`/
  `localeLabels`/`defaultValue`/`storageKey` props), reflected onto
  `<html lang>`/`<html dir>` and persisted to `src/lib/config/locales.ts`'s
  `LOCALE_STORAGE_KEY`. Fixed four-locale catalogue (`en-GB`, `en-US`,
  `cy-GB`, `de-DE`); presentation only — no message catalogue is wired up,
  see [`../docs/i18n.md`](../docs/i18n.md). Vendors a companion
  `src/lib/components/ui/locales.ts` (upstream's `defaultLocaleLabels`/RTL
  data) alongside `LocalePicker.svelte`. Both controls share
  `.theme-picker`/`.locale-picker` baseline CSS appended once to `app.css`
  (headless: no default styling otherwise; no `lily-` prefix needed — the
  picker rename dissolved the class-name collision with the unrelated
  `lily-design-system-svelte-headless` catalog components that made the
  prefix necessary in the first place). Tools:
  `bin/svelte-locale-select-refactor --check` (a locale control present in
  every layout) and `bin/svelte-helpers-picker-rename --check|--apply`
  (button+listbox contract + naming drift against
  `lily-design-system-svelte-helpers`; pin recorded in
  [`lily-svelte-helpers-version.md`](lily-svelte-helpers-version.md)).
- **`TextSizePicker` sits after `ThemePicker`** in the header nav: the same
  headless button+listbox shape (single-glyph "A" icon, `sizes`/`sizeLabels`/
  `defaultValue`/`storageKey` props), mirroring
  `lily-design-system-svelte-helpers/lily-design-system-svelte-text-size-picker`.
  Sets `data-text-size` on `<html>` (mapped to `font-size` via
  `:root[data-text-size="…"]` rules in `app.css`; WCAG 2.2 1.4.4/1.4.12), and
  persists to `src/lib/config/text-sizes.ts`'s `TEXT_SIZE_STORAGE_KEY`. Fixed
  four-size catalogue (`small`/`medium`/`large`/`x-large`).
- **`SharePicker` sits after `TextSizePicker`** in the header nav: the same
  headless button shape (single-glyph "↪" icon), mirroring
  `lily-design-system-svelte-helpers/lily-design-system-svelte-share-picker`.
  Opens the native OS share sheet where available
  (`navigator.share`/`strategy="auto"`), otherwise a small list — here, just
  a "Copy link" item, since this package ships no social-network URLs by
  design and a 341-form medical/clinical monorepo has no single defensible
  answer for which networks belong. `targets` stays `[]` everywhere. Tool
  for both of the above (naming rollout + rename):
  `bin/svelte-helpers-picker-rename --check|--apply`.
- **Header layout: title left, nav + controls right.** The header `<nav>`'s
  inner row is `flex items-center justify-between`: the brand/title `<a>` is
  the first child, and a second `flex items-center gap-1` wrapper holding the
  nav links, `LocalePicker`, `ThemePicker`, `TextSizePicker`, then
  `SharePicker` is the second child — so the row splits into a left title
  and a right-aligned link/control cluster.
- **Page-width model: `body` is edge-to-edge; `<main>` carries the gutter.**
  `body { margin: 0; }` (an unlayered rule in `app.css` so it outranks
  Tailwind's `@layer base` preflight reset). The `+layout.svelte` `<nav>`
  is full width (its own background reaches the viewport edge; the
  `mx-auto max-w-5xl` inner row keeps its links/controls centered and
  padded). Every route's `<main>` carries `mx-16` (Tailwind for
  `margin-left/right: 4rem`) instead of the old `mx-auto max-w-Nxl`
  centered-column classes — no `max-width`, so it fills the remaining
  viewport width between the two 4rem gutters. Matches
  `front-end-with-html/`.
- **Components consume Lily tokens, not hardcoded greys.** `app.css` registers
  the Lily palette in `@theme` (`--color-base-100/200/300`, `--color-base-content`,
  `--color-primary`, `--color-error`, …) so Tailwind emits `bg-base-100`,
  `text-base-content`, `text-error`, etc. All chrome and pages use these token
  utilities (no `bg-white` / `text-gray-*`). Lily's theme files are _unlayered_,
  so they override Tailwind's layered `@theme` defaults at runtime — every theme
  re-skins the whole app, including headings.

## Dashboard grid (SVAR)

The collection dashboard (`/<slug>/<plural>/`) renders the data table with the **SVAR
Svelte DataGrid** (`@svar-ui/svelte-grid`, `Grid` + `Willow`/`WillowDark`).
Graded columns render through the shared engine label helpers. The grid is
**client-only** (its packages are not SSR-safe), so the dashboard route sets
`export const ssr = false;` in `+page.ts`. Pick `WillowDark` vs `Willow` from the
active theme's `--color-base-100` lightness so the grid follows the Lily theme,
and wire `api.on('select-row', …)` to open `/<slug>/<plural>/[id]`.

Companion docs: [`AGENTS-front-end-html.md`](AGENTS-front-end-html.md),
[`plan.md`](plan.md), [`tasks.md`](tasks.md).

## 1. What Lily Svelte headless is, for our purposes

`lily-design-system-svelte-headless` is a **library of Svelte 5 components**
that ship structural markup + ARIA + keyboard behaviour, with **no styling**.
Each component under
`~/git/lilydesignsystem/lily-design-system/lily-design-system-svelte-headless/components/`
is a folder containing:

- `<Name>.svelte` — the component itself (Svelte 5 runes: `$props`, `$bindable`, `Snippet`),
- `<Name>.stories.svelte` — Storybook-style usage examples,
- `<Name>.test.ts` — Vitest unit tests,
- `index.md` — prose documentation.

Crucially, every Lily Svelte component **emits the same CSS class names** as
the Lily HTML headless library: a `<TextInput>` renders an
`<input class="text-input">`, a `<RadioGroup>` renders a
`<fieldset role="radiogroup" class="radio-group">`, and so on. This is
deliberate — the two Lily libraries share one class vocabulary so the same
stylesheet works for both.

## 2. Consumption model (decision)

Lily Svelte is consumed as a **contract**, not as a runtime npm package:

- **Each form's local `src/lib/components/ui/` mirrors the Lily Svelte API.**
  Every local component has the same prop signature, the same `bind:value`
  shape, and emits the same Lily class names as the upstream Lily Svelte
  component of the same name.
- **No runtime dependency on Lily.** The form's `package.json` does not
  depend on `lily-design-system-svelte-headless` (it is not published to
  npm). Each form remains a self-contained pnpm/SvelteKit project.
- **Pinned upstream commit recorded in [`lily-svelte-version.md`](lily-svelte-version.md).**
  Component source snapshots live in [`lily-svelte-spec/`](lily-svelte-spec/),
  refreshed by `bin/lily-svelte-sync`.

This mirrors the Lily HTML consumption model (see
[`AGENTS-front-end-html.md`](AGENTS-front-end-html.md) §2). The libraries
are paired specs; the forms are paired conformant implementations.

## 3. Component vocabulary (Lily contract)

The local `src/lib/components/ui/` directory contains one Svelte component
per Lily class. Required components per form (subset of the full Lily
catalogue — every form picks the components it needs):

### Form structure

| Concept           | Component name        | Emits                                                                                         |
| ----------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| Form root         | `Form.svelte`         | `<form class="form">`                                                                         |
| Grouped fields    | `Fieldset.svelte`     | `<fieldset class="fieldset"><legend class="fieldset-legend">…</legend>…</fieldset>`           |
| Single field      | `Field.svelte`        | `<div class="field"><label class="label">…</label><slot/><span class="error-message"/></div>` |
| Hint              | `Hint.svelte`         | `<span class="hint">`                                                                         |
| Page-level errors | `ErrorSummary.svelte` | `<div class="error-summary" role="alert">`                                                    |

### Inputs

| Concept          | Component name         | Emits                                              |
| ---------------- | ---------------------- | -------------------------------------------------- |
| Single-line text | `TextInput.svelte`     | `<input class="text-input" type="text">`           |
| Multi-line text  | `TextAreaInput.svelte` | `<textarea class="text-area-input">`               |
| Email            | `EmailInput.svelte`    | `<input class="email-input" type="email">`         |
| Number           | `NumberInput.svelte`   | `<input class="number-input" type="number">`       |
| Date             | `DateInput.svelte`     | `<input class="date-input" type="date">`           |
| Time             | `TimeInput.svelte`     | `<input class="time-input" type="time">`           |
| Tel              | `TelInput.svelte`      | `<input class="tel-input" type="tel">`             |
| URL              | `UrlInput.svelte`      | `<input class="url-input" type="url">`             |
| File             | `FileInput.svelte`     | `<input class="file-input" type="file">`           |
| Range            | `RangeInput.svelte`    | `<input class="range-input" type="range">`         |
| Single checkbox  | `CheckboxInput.svelte` | `<input class="checkbox-input" type="checkbox">`   |
| Single radio     | `RadioInput.svelte`    | `<input class="radio-input" type="radio">`         |
| Select           | `Select.svelte`        | `<select class="select">…<option/>…</select>`      |
| Checkbox group   | `CheckboxGroup.svelte` | `<fieldset role="group" class="checkbox-group">`   |
| Radio group      | `RadioGroup.svelte`    | `<fieldset role="radiogroup" class="radio-group">` |

### Buttons

| Concept        | Component name       | Emits                                                  |
| -------------- | -------------------- | ------------------------------------------------------ |
| Generic button | `Button.svelte`      | `<button class="button">` (variant via `data-variant`) |
| Submit         | `SubmitInput.svelte` | `<input class="submit-input" type="submit">`           |
| Reset          | `ResetInput.svelte`  | `<input class="reset-input" type="reset">`             |

### Wizard / progress

| Concept        | Component name        | Emits                                               |
| -------------- | --------------------- | --------------------------------------------------- |
| Step list      | `StepList.svelte`     | `<ol class="step-list">…<li/>…</ol>`                |
| Step list item | `StepListItem.svelte` | `<li class="step-list-item" data-status="…">…</li>` |
| Progress bar   | `Progress.svelte`     | `<progress class="progress">`                       |

### Dashboard

| Concept     | Component name        | Emits                             |
| ----------- | --------------------- | --------------------------------- |
| Data table  | `DataTable.svelte`    | `<table class="data-table">`      |
| Table head  | (slot of DataTable)   | `<thead class="data-table-head">` |
| Table body  | (slot of DataTable)   | `<tbody class="data-table-body">` |
| Row         | `DataTableRow.svelte` | `<tr class="data-table-row">`     |
| Header cell | `DataTableTh.svelte`  | `<th class="data-table-th">`      |
| Data cell   | `DataTableTd.svelte`  | `<td class="data-table-td">`      |

### Status messages

| Concept        | Component name | Emits                                                      |
| -------------- | -------------- | ---------------------------------------------------------- |
| Alert          | `Alert.svelte` | `<div class="alert" data-type="info                        | success | warning | error" role="alert">` |
| Panel (report) | `Panel.svelte` | `<section class="panel" role="region" aria-live="polite">` |

## 4. Prop conventions

Every component follows these patterns, derived from the upstream Lily
Svelte components:

- `class: className = ""` — accept an additional class via `class={…}`.
- `label: string` — accessible name (used as `aria-label` where there is no
  visible `<label>`).
- `value = $bindable("")` — text/number/date values are bindable.
- `checked = $bindable(false)` — checkbox / radio state is bindable.
- `disabled: boolean = false`, `required: boolean = false`.
- `...restProps` — spread onto the underlying HTML element.
- Children come through `Snippet`s (`children: Snippet`), not slots.

A consumer thus writes:

```svelte
<TextInput label="Full name" bind:value={data.fullName} required />
<RadioGroup label="Sex">
  {#each ['male', 'female', 'other'] as v}
    <label class="radio-input"><input type="radio" name="sex" bind:group={data.sex} value={v}> {v}</label>
  {/each}
</RadioGroup>
```

## 5. Page shell

Every input-form route (`front-end-with-svelte/src/routes/<slug>/<plural>/[id]/+page.svelte`,
the wizard) follows this skeleton. The `.page-header` (and any page footer) is
statically positioned — never `position: sticky`/`fixed` — so the whole page,
header and footer included, scrolls with the content:

```svelte
<script lang="ts">
  import { assessment } from '$lib/stores/assessment.svelte';
  import Form from '$lib/components/ui/Form.svelte';
  import Progress from '$lib/components/ui/Progress.svelte';
  import StepList from '$lib/components/ui/StepList.svelte';
  import StepListItem from '$lib/components/ui/StepListItem.svelte';
  import ErrorSummary from '$lib/components/ui/ErrorSummary.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Panel from '$lib/components/ui/Panel.svelte';
  // …step imports…
</script>

<header class="page-header">
  <div class="page-header-inner">
    <h1>{title}</h1>
    <p class="subtitle">{subtitle}</p>
    <Progress max={100} value={percentComplete} aria-label="Form completion" />
    <StepList label={`${title} steps`} current={currentStep}>
      {#each steps as s}
        <StepListItem step={s.step} status={s.status}>{s.title}</StepListItem>
      {/each}
    </StepList>
  </div>
</header>

<main>
  <Form aria-label={title}>
    <ErrorSummary errors={errors} bind:hidden={errorSummaryHidden} />
    <!-- Step components render Lily Fieldset + Field shapes -->
    <!-- …step components… -->
    <div class="button-group">
      <Button data-variant="secondary" onclick={prev}>Previous</Button>
      <Button data-variant="primary" onclick={next}>Next</Button>
      <Button type="submit" data-variant="primary">Submit</Button>
    </div>
  </Form>
  <Panel label="Report" aria-live="polite">
    {#if !result}<p class="empty-message">Submit the form to see the report.</p>
    {:else}<!-- report rendered here -->{/if}
  </Panel>
</main>
```

Dashboards follow the analogous `DataTable` shell.

**Structural rule:** the `<main>` tag does not have an inner `<header>` tag.
`.page-header` is always a sibling that precedes `<main>`, never nested
inside it — including on welcome pages and wizard/detail pages that show a
title, description, `Progress`, or `StepList` above the page body.

## 6. State management

- **Class-based Svelte 5 store** in `src/lib/stores/<name>.svelte.ts`
  (typically `assessment.svelte.ts`). No legacy `writable` stores.
- Public fields: `.data`, `.result`, `.currentStep`, `.reset()`,
  `.errors` (validation), plus form-specific helpers.
- Persistence key: `<slug>.front-end-with-svelte.v1` (mirrors the HTML
  convention to allow draft portability across stacks).

**Reactivity pitfall — never capture a store's `$state` object in a plain
`const`.** A step component reading `const d = someStore.data;` and then
`bind:value={d.field}` binds to *that specific object*. It keeps working
for in-place edits (`d.field = x` mutates the same object the store still
points to), but the moment the store *reassigns* `.data` to a new object —
`reset()`, a JSON import, or `loadForId()` picking up a different draft —
every already-mounted step component's `d` still points at the old,
discarded object, so the UI silently stops reflecting the store at all.
Verified live in `cardiology-request` (2026-09-08): `Start over` correctly
cleared the store's `data` but every field kept displaying its old value,
and — since `id = $state('new')` defaulted to the same string the wizard's
own `/new` route resolves to — a saved draft was never even reloaded after
a page refresh, because `loadForId()` is only called when
`store.id !== id`. Fix: capture the reference reactively —
`let d = $derived(someStore.data);` — so it re-tracks whenever the store
reassigns `.data`; and never default an id field to a literal value a real
route id can collide with (use `''`, which `id || 'new'`-style fallbacks
already treat as "unset"). Also route a store's localStorage-persist
`$effect` through an explicit "have I loaded yet" guard (read the reactive
fields *before* the guard, so they stay tracked dependencies even while
suppressed) — without it, the effect's first, immediate run persists the
process's still-blank initial state before any restore logic gets a
chance to run, silently overwriting a previously-saved draft on every
fresh page load.

**Wizard-level export/import.** Where wired, a wizard's route page
includes `#lib/components/ui/FormDataTransfer.svelte` (props: `slug`,
`getState: () => unknown`, `setState: (parsed) => void`) — the Svelte
counterpart to the HTML front-end's `js/form-export.js` +
`js/form-import.js` pair, same `<slug>-<date>.<ext>` JSON/XML/CSV/TSV
output, same filenames, same shared serialisation logic
(`#lib/utils/form-data-transfer.ts`, ported verbatim from the HTML
implementation so the two stacks' exports are interchangeable). A
consuming page passes `getState={() => someStore.data}` and
`setState={(parsed) => someStore.importData(parsed)}`; `importData` must
merge the parsed object onto a fresh default state (the same tolerant
shallow-merge `loadForId()`'s saved-draft restore already uses) and reset
derived/result state, then reassign the store's `.data` — safe as long as
every step component reads that field via `$derived`, per the pitfall
above. Reference implementation: `cardiology-request`; fleet rollout is
tracked separately in `tasks.md`.

## 7. Validation pattern

On Next / Submit:

1. Run validators for the current step (or the whole form on Submit).
2. For each failing field, set `aria-invalid="true"` and update
   `errors[fieldId]`.
3. `ErrorSummary` populates with a `<ul>` of anchor links to each erroneous
   field by `id`. Show the summary; focus moves to it.
4. On the next successful validation, hide the summary and clear field
   errors.

`Alert data-type="error"` MAY be used in place of `ErrorSummary` when only
one error is involved.

## 8. Accessibility commitments

Identical to the HTML contract (see [`AGENTS-front-end-html.md`](AGENTS-front-end-html.md) §8).

## 9. Canonical reference

The canonical consolidated reference is:

- `forms/cardiology-response/front-end-with-svelte/` — RESTful routes:
  dashboard list at `src/routes/cardiology-response/cardiology-responses/+page.svelte`, input form
  at `src/routes/cardiology-response/cardiology-responses/[id]/+page.svelte`, one shared scoring
  engine and UI component set.

The legacy split layout (`front-end-form-with-svelte/` +
`front-end-dashboard-with-svelte/`) no longer exists anywhere in the
monorepo — every form, including `forms/pre-operative-assessment-by-clinician/`,
is on the consolidated RESTful-route layout.
`bin/lily-svelte-refactor` propagates the Lily class contract across forms.

## 10. Upstream pin and drift detection

The pinned upstream Lily Svelte commit hash lives in
[`lily-svelte-version.md`](lily-svelte-version.md). Component snapshots
live in `lily-svelte-spec/` — refresh via `bin/lily-svelte-sync`. Drift
detection: `bin/lily-svelte-sync --check`.

## 11. Out of scope here

- HTML subprojects (`front-end-*-with-html/`) — see
  [`AGENTS-front-end-html.md`](AGENTS-front-end-html.md).
- The Loco/Rust back-end JSON API subproject — see
  [`/AGENTS/back-end-with-loco.md`](../AGENTS/back-end-with-loco.md).
- The Lily library's own development.
