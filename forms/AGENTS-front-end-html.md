# AGENTS — `front-end-with-html/` (Lily Design System HTML headless)

Conventions for every form's **consolidated** `front-end-with-html/`
subproject — a single directory whose `index.html` is the single-page wizard
and `dashboard.html` is the vetting dashboard, sharing one `css/` and `js/`
(the scoring engine lives in `js/{types,rules,grader,flags}.js`; the wizard
app in `js/form-app.js`, the dashboard app in `js/dashboard-app.js`). This
consolidated single-directory layout is the **only** layout in the monorepo —
all 347 forms were migrated from the legacy split
`front-end-form-with-html/` + `front-end-dashboard-with-html/` layout by
`bin/consolidate-front-end-html`; the split layout no longer exists anywhere.

Companion docs: [`plan.md`](plan.md), [`tasks.md`](tasks.md).

## 1. What Lily HTML headless is, for our purposes

`lily-design-system-html-headless` is a **specification** of accessible,
framework-free HTML components — not a runtime library. Each component file
under `~/git/lilydesignsystem/lily-design-system/lily-design-system-html-headless/components/`
is a tiny HTML template plus a documentation comment block describing:

- the HTML tag,
- the CSS class name (kebab-case, stable contract),
- accepted ARIA attributes,
- accepted `data-*` attributes and their values,
- expected keyboard behavior,
- expected child structure.

Most components ship **zero JavaScript** (e.g., `text-input`, `step-list`,
`step-list-item`, `field`, `button`, `error-summary`). A few interactive
components (e.g., `dialog`, `tab-bar`) embed vanilla JS for keyboard
behavior; when we need that behavior, we copy the JS into the form's
`js/form-app.js` rather than loading the `.html` file at runtime.

**Consequence: there is nothing to install.** Our forms conform to Lily's
class/attribute contract; we do not link to, bundle, or vendor Lily files
at runtime. This is consistent with the project-wide no-build constraint.

## 2. Consumption model (decision)

- **Lily is treated as a spec the generator reads at authoring time.**
  Generators under `bin/` read Lily's component files to learn class
  names, attribute contracts, and structure rules.
- **No runtime dependency on Lily.** No `<script src="…/lily/…">`, no
  CSS imports, no npm package. Every form's `front-end-*-with-html/`
  directory is self-contained (its JS is native ES modules, so it must be
  served over HTTP, not opened via `file://` — see
  [`spec/es-modules.md`](../spec/es-modules.md)).
- **Lily checkout location is `~/git/lilydesignsystem/lily-design-system/lily-design-system-html-headless/`.**
  Generators look there; if absent they fail with a clear error.
- **Pinned commit recorded in [`lily-version.md`](lily-version.md).**
  See that file for the current pinned hash and pin date. Re-running
  `bin/lily-sync` (a doc-snapshotting helper, not a runtime sync) refreshes
  the pinned hash and copies the spec comments into `lily-spec/` for quick
  reference without needing the external checkout; `bin/lily-sync --check`
  is the drift detector.

## 3. Class vocabulary (Lily contract)

Every class name on a form element MUST come from this list (or be a
project-local layout helper such as `.visually-hidden`,
`.page-header`, `.page-header-inner`, `.subtitle`).

### Form structure

| Concept              | Lily class                         | Tag           |
|----------------------|------------------------------------|---------------|
| Form root            | `.form`                            | `<form>`      |
| Grouped fields       | `.fieldset` + `.fieldset-legend`   | `<fieldset>` + `<legend>` |
| Single field wrapper | `.field`                           | `<div>`       |
| Field label          | `.label`                           | `<label>`     |
| Field hint           | `.hint`                            | `<span>`      |
| Field error          | `.error-message`                   | `<span>`      |
| Page-level errors    | `.error-summary`                   | `<div role="alert">` |

### Inputs

| Concept            | Lily class               | Tag                          |
|--------------------|--------------------------|------------------------------|
| Single-line text   | `.text-input`            | `<input type="text">`        |
| Multi-line text    | `.text-area-input`       | `<textarea>`                 |
| Email              | `.email-input`           | `<input type="email">`       |
| Number             | `.number-input`          | `<input type="number">`      |
| Date               | `.date-input`            | `<input type="date">`        |
| Time               | `.time-input`            | `<input type="time">`        |
| Tel                | `.tel-input`             | `<input type="tel">`         |
| URL                | `.url-input`             | `<input type="url">`         |
| Search             | `.search-input`          | `<input type="search">`      |
| File               | `.file-input`            | `<input type="file">`        |
| Range slider       | `.range-input`           | `<input type="range">`       |
| Single checkbox    | `.checkbox-input`        | `<input type="checkbox">`    |
| Single radio       | `.radio-input`           | `<input type="radio">`       |
| Select dropdown    | `.select`                | `<select>`                   |
| Checkbox group     | `.checkbox-group`        | `<div role="group">`         |
| Radio group        | `.radio-group`           | `<div role="radiogroup">`    |

### Buttons

| Concept            | Lily class               | Tag                            |
|--------------------|--------------------------|--------------------------------|
| Generic button     | `.button`                | `<button>`                     |
| Submit             | `.submit-input`          | `<input type="submit">`        |
| Reset              | `.reset-input`           | `<input type="reset">`         |

Variant styling (primary/secondary/danger) is conveyed via a
`data-variant` attribute on `.button`, e.g. `data-variant="primary"`.
The consumer stylesheet keys on the attribute.

### Wizard / progress

| Concept            | Lily class                       | Tag      |
|--------------------|----------------------------------|----------|
| Step list          | `.step-list`                     | `<ol>`   |
| Step list item     | `.step-list-item`                | `<li>`   |
| Progress bar       | `.progress`                      | `<progress>` |

Step state is encoded on each `.step-list-item` via:

- `data-status="waiting" | "in-progress" | "finished" | "error"`
- `aria-current="step"` on the active item

The list's current index is mirrored on the parent: `data-current="N"`.

### Dashboard

| Concept            | Lily class               | Tag       |
|--------------------|--------------------------|-----------|
| Data table         | `.data-table`            | `<table>` |
| Table head         | `.data-table-head`       | `<thead>` |
| Table body         | `.data-table-body`       | `<tbody>` |
| Table foot         | `.data-table-foot`       | `<tfoot>` |
| Row                | `.data-table-row`        | `<tr>`    |
| Header cell        | `.data-table-th`         | `<th>`    |
| Data cell          | `.data-table-td`         | `<td>`    |

Filters above the table reuse `.text-input`, `.select`, and `.button`.

### Status messages

| Concept            | Lily class               | Tag       |
|--------------------|--------------------------|-----------|
| Alert              | `.alert`                 | `<div role="alert">` |
| Panel (report)     | `.panel`                 | `<section role="region">` |

`.alert` carries `data-type="info" | "success" | "warning" | "error"`.

### Local helpers (NOT Lily — defined in our `style.css`)

- `.visually-hidden` — screen-reader-only utility
- `.page-header`, `.page-header-inner`, `.subtitle` — page chrome
  (statically positioned — never `position: sticky`/`fixed`; the whole page
  scrolls, header and footer included)
- `.page-header-bar` — flex row inside `.page-header-inner` that lays out
  the title on the **left** and the nav link(s) + select controls on the
  **right**; wraps to a stacked layout on narrow viewports. Holds exactly
  two children: `.page-header-title` (the `<h1>` + plain `.subtitle`) and
  `.page-header-controls`.
- `.page-header-title` — left column of `.page-header-bar` (`flex: 1 1 0%;
  min-width: 0`, so it shrinks and wraps its text instead of forcing
  `.page-header-controls` onto its own line)
- `.page-header-controls` — right column of `.page-header-bar`: flex row
  holding any nav link (`.page-header-link`, e.g. "View the dashboard →")
  followed by the locale-select and theme-select controls
- **Page-width model: `body` is edge-to-edge; `<main>` carries the gutter.**
  `body { margin: 0; }` — full viewport width, no side inset. `.page-header`
  and `.page-footer` are direct `body` children (the footer is a sibling of
  `<main>`, not nested inside it) and are therefore full width too; their
  own inner content stays readable via `.page-header-inner`'s
  `max-width`+`margin:0 auto`, and `.page-footer`'s own horizontal padding.
  `main { margin-left: 4rem; margin-right: 4rem; }` (no `max-width` — it
  fills the remaining viewport width between the two 4rem gutters, replacing
  the older centered-reading-column model). The handful of forms whose
  `<main>` is instead reached via a shared `.container`/`#id` selector get
  the same `margin-left`/`margin-right: 4rem` on that selector, with any
  competing `max-width` removed.
- `.skip-link` — top-of-page skip target
- `.empty-message` — empty-state copy inside a region

## 3a. Theming (Lily themes, gold standard)

Every `front-end-with-html/` uses the same **prebuilt Lily Design System
theme system** as `front-end-with-svelte/` — do not hand-roll theme CSS.

- **Vendored themes.** All Lily theme stylesheets are copied to
  `css/themes/<name>.css` (light, dark, dim, dracula, nord, the NHS
  England/Scotland/Wales patient & practitioner themes, GDS, USWDS, …). Each
  is a standalone file; load **exactly one at a time** via a swappable
  `<link rel="stylesheet" id="theme-stylesheet" href="css/themes/<name>.css">`
  in `<head>` (they cannot be combined — each includes a bare `:where(:root)`
  block and they would collide). A blocking inline script right after that
  `<link>` applies any saved choice before first paint (FOUC guard).
- **The default theme is the Lily light theme** (`css/themes/light.css`).
- **`css/style.css` / `css/dashboard.css` alias onto Lily tokens, not
  hardcoded hex.** `--color-bg`, `--color-surface`, `--color-text`,
  `--color-muted`, `--color-border(-strong)`, `--color-focus`,
  `--color-primary-light`, `--color-danger(-bg)`, `--color-warning-bg`,
  `--color-success-bg` are all derived from the theme's
  `--color-base-100/200/300/content`, `--color-primary`, `--color-error`,
  `--color-warning`, `--color-success` (`--color-primary`/`--color-warning`/
  `--color-success` are consumed directly, undeclared locally, so the theme's
  value cascades through unmodified). `--color-primary-dark` has no Lily
  equivalent and stays a static gold-standard value. This mirrors
  `front-end-with-svelte`'s `app.css` mapping exactly, so switching
  `#theme-select` re-skins the whole page.
- **Controls.** `#locale-select`, `#theme-select`, then `#text-size-picker`,
  all native `<select class="theme-select">` with
  `<option class="theme-select-option">` children (reusing the Lily
  `theme-select` *catalog* styling — a different, unrelated component family
  from the helpers below, deliberately untouched by their `*-picker`
  rename), matching the `front-end-with-svelte`
  `LocalePicker`/`ThemePicker`/`TextSizePicker` convention, inside the
  `.page-header-controls` column — the right-hand side of `.page-header-bar`,
  beside `.page-header-title` on the left (see §4). Vanilla ES modules
  `js/theme-select.js` / `js/locale-select.js` / `js/text-size-picker.js`
  wire them up: theme-select swaps the `#theme-stylesheet` `href` and
  persists to localStorage; locale-select sets `<html lang>` and persists to
  localStorage; text-size-picker sets `<html data-text-size>` (mapped to
  `font-size` via `[data-text-size="…"]` rules in
  `css/style.css`/`css/dashboard.css`, WCAG 2.2 1.4.4/1.4.12) and persists to
  localStorage. Presentation only — no message catalogue is wired up; see
  [`../docs/i18n.md`](../docs/i18n.md).
- **`.share-picker`** is the fourth control, right after
  `#text-size-picker`: a `<button id="share-picker">` (glyph ↪) that tries
  the native Web Share API first (`navigator.share`), falling back to a
  one-item popup list ("Copy link" → clipboard), mirroring the
  `front-end-with-svelte` `SharePicker` convention — no social-network
  targets, by design. Wired by `js/share-picker.js`.
- **Tool.** `bin/html-theme-locale-select-refactor --check|--apply` is the
  drift detector / generator for locale-select/theme-select (the untouched
  catalog controls).
  `bin/html-text-size-select-refactor --check|--apply` is the drift detector /
  generator for text-size-picker (name predates the picker rename).
  `bin/html-share-button-refactor --check|--apply` is the drift detector /
  generator for share-picker (name predates the picker rename).
  `bin/html-helpers-picker-rename --check|--apply` is the *-select/
  share-button → *-picker rename against `lily-design-system-svelte-helpers`;
  pin recorded in
  [`lily-svelte-helpers-version.md`](lily-svelte-helpers-version.md).
  `bin/page-header-layout-refactor --check|--apply` is the drift detector /
  generator for the title-left / controls-right `.page-header-bar` layout.
- **Exclusion: `THEME_COLLISION_SLUGS`.** A handful of bespoke pages (GOV.UK
  privacy notices, an NHS-branded dashboard, a vaccination-certificate
  dashboard) define their own `.card`/`.container`/`.panel`/`.progress`/
  `.select`/… classes with different HTML structure than Lily's. Loading the
  swappable theme there doesn't no-op — Lily's rules for those class names
  apply to the page's unrelated elements (verified: near-invisible text from
  a `.card` collision). These forms are hardcoded into the tool's exclusion
  set and keep a hand-styled locale-select only, no theme-select. Don't
  remove a form from that set without re-verifying in a browser.

## 4. Page shell

Every `front-end-with-html/index.html` (the wizard) follows this skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{Form Title}}</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <a class="skip-link visually-hidden" href="#form-sections">Skip to form</a>

  <header class="page-header">
    <div class="page-header-inner">
      <div class="page-header-bar">
        <div class="page-header-title">
          <h1>{{Form Title}}</h1>
          <p class="subtitle">{{Form subtitle}}</p>
        </div>
        <div class="page-header-controls no-print">
          <!-- optional: <p class="subtitle page-header-link"><a href="dashboard.html">View the dashboard →</a></p> -->
          <label class="visually-hidden" for="locale-select">Language</label>
          <select class="theme-select" id="locale-select" aria-label="Language">…</select>
          <label class="visually-hidden" for="theme-select">Theme</label>
          <select class="theme-select" id="theme-select" aria-label="Theme">…</select>
        </div>
      </div>
      <progress class="progress" max="100" value="0"
                aria-label="Form completion"></progress>
      <ol class="step-list" aria-label="{{Form Title}} steps"
          data-current="0"><!-- step-list-items injected by form-app.js --></ol>
    </div>
  </header>

  <main>
    <form class="form" id="form" autocomplete="off" novalidate
          onsubmit="return false;" aria-label="{{Form Title}}">
      <div class="error-summary" role="alert" aria-label="Errors"
           hidden><!-- populated on validation failure --></div>
      <div id="form-sections"><!-- fieldsets injected by form-app.js --></div>
      <div class="button-group">
        <button class="button" type="button" id="prev"
                data-variant="secondary">Previous</button>
        <button class="button" type="button" id="next"
                data-variant="primary">Next</button>
        <input class="submit-input" type="submit" value="Submit" hidden>
        <input class="reset-input" type="reset" value="Reset"
               data-variant="secondary">
      </div>
    </form>

    <section class="panel" role="region" aria-live="polite"
             aria-label="Report" id="report">
      <p class="empty-message">Submit the form to see the report.</p>
    </section>
  </main>

  <footer><!-- footer content --></footer>

  <!-- One module entry point; it imports types.js, the rules/grader/
       flagged-issues modules, etc. through its own import graph. -->
  <script type="module" src="js/form-app.js"></script>
</body>
</html>
```

The dashboard (`front-end-with-html/dashboard.html`) follows the analogous
`.data-table-*` shell, links its own `css/dashboard.css`, and loads
`js/dashboard-app.js` as a module (which imports `js/dashboard-types.js`,
`js/data.js`, `js/api.js`), plus the standalone `js/table-export.js`. The
wizard and dashboard cross-link in their page headers.

Where wired, the wizard also loads two standalone modules right after
`js/form-app.js`: `js/form-export.js` (self-injects a toolbar at the top of
`<main>` with Download JSON/XML/CSV/TSV buttons for the current, possibly
in-progress, form state) and `js/form-import.js` (adds an "Import JSON"
control to that same toolbar that re-populates the wizard from an uploaded
export). Both are form-agnostic and read a small cross-module contract each
form's own `form-app.js` sets — `window.__FORM_STATE__ = { slug, getState,
setState }` — mirroring the existing `window.__A11Y_DRAFT_KEY__` pattern
rather than importing the wizard's private state directly. `setState` must
merge the incoming object onto a fresh default state (the same tolerant
merge `loadState()` already does for localStorage) and re-render the whole
form, not just assign and hope the shape matches. Reference implementation:
`pre-operative-assessment-by-clinician`; fleet rollout is tracked
separately in `tasks.md`.

**Structural rule:** the `<main>` tag does not have an inner `<header>` tag.
`.page-header` is always a sibling that precedes `<main>`, never nested
inside it. `.page-footer` is likewise always a sibling that *follows*
`<main>`, never nested inside it — both chrome elements are direct `body`
children, full width, per the page-width model in §3.

## 5. JavaScript conventions

- Native **ES modules**: `<script type="module">` + `import` / `export`.
  The HTML loads a single module entry point (`js/form-app.js` for the wizard,
  `js/dashboard-app.js` for the dashboard); every other module is reached
  through that entry's import graph. No bundler. See
  [`spec/es-modules.md`](../spec/es-modules.md) for the full contract (and
  the accepted `file://` tradeoff). `bin/es-modules-refactor --check --all`
  is the drift detector.
- Each file `export`s its public symbols and `import`s what it consumes from
  sibling files by relative path. No IIFE wrapper, no `window.<Namespace>`
  object (a module already has its own scope). A genuine `window.*`
  assignment for an inline handler or the smoke test is still fine.
- Dependency order is expressed by the `import` graph, not `<script>` order:
  `types.js` → form-specific `*-rules.js` → `*-grader.js` →
  `flagged-issues.js` → `form-app.js`.
- `form-app.js` is responsible for:
  1. building `emptyAssessment()` and hydrating from localStorage,
  2. rendering each step as a `<fieldset class="fieldset">` containing
     Lily-shaped `.field` blocks,
  3. updating `.progress` value, `.step-list-item[data-status]`, and
     `aria-current="step"` on step changes,
  4. validating on Next/Submit; on failure, populating
     `.error-summary` and per-field `.error-message`, then focusing
     the summary,
  5. invoking the grader on submit and rendering the report into the
     `.panel` region.
- Domain files (`*-rules.js`, `*-grader.js`, `flagged-issues.js`) are
  hand-curated per form. The generator MUST NOT overwrite them.

## 6. LocalStorage

Key pattern, unchanged from current convention:

```
{form-slug}.front-end-with-html.v1
```

Values are JSON-serialized form state. On load, form-app.js merges the stored
value over a fresh `emptyAssessment()` so that adding new fields in
future versions does not orphan existing drafts.

The Lily refactor MUST preserve key and shape. A migration hook is
acceptable for additive shape changes; renames are not.

## 7. Validation pattern

On Next/Submit:

1. Run validators for the current step (or the whole form on Submit).
2. For each failing field:
   - Render its `.error-message` adjacent to the input.
   - Set `aria-invalid="true"` and `aria-describedby` on the input.
3. Render `.error-summary` at the top of the form with a `<ul>` of
   anchor links to each erroneous field by `id`.
4. Show the summary (`hidden` removed), set focus to it, scroll into view.
5. On the next successful re-validation, hide the summary and clear
   per-field errors.

`.alert` with `data-type="error"` MAY be used in place of `.error-summary`
when only one error is involved.

## 8. Accessibility commitments

- Single visible `<h1>` per page.
- Every input has an associated `<label>`.
- Step list reflects current step via `aria-current="step"` AND
  `data-status="in-progress"`.
- Report region is `role="region"` with `aria-live="polite"`.
- Skip link at top of body.
- Color contrast ≥ WCAG 2.2 AA on all interactive states.
- Keyboard navigation works without a mouse for: stepping through the
  wizard, choosing radio/checkbox options, opening any dialog, and
  closing it with Escape.

## 9. Canonical reference

The canonical consolidated reference is:

- `forms/cardiology-request/front-end-with-html/` — `index.html` wizard +
  `dashboard.html`, shared `css/` and `js/`, four-axis engine.

The legacy split layout (`front-end-form-with-html/` +
`front-end-dashboard-with-html/`) no longer exists anywhere in the
monorepo — every form, including `forms/pre-operative-assessment-by-clinician/`,
is on the consolidated layout.

## 10. CI drift check

`bin/lily-html-refactor --check --all` is the CI hook. It runs every safe
class-swap pattern in dry-run mode and exits non-zero if any swap would
land — i.e. a hand-edit has reintroduced an old class. Risky lines
(structural patterns the tool won't auto-fix) are reported but do not
fail `--check`; those require a subagent pass.

Local usage:

```sh
bin/lily-html-refactor --check --all
bin/page-header-layout-refactor --check
```

Wire it into your CI step or into `bin/test` as appropriate.

## 11. Out of scope here

- SvelteKit subprojects (`front-end-*-with-svelte/`) — covered by a
  separate plan.
- The Loco/Rust full-stack subproject.
- The Lily library's own development.
