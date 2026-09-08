# bin/ tools reference

Auto-generated from each tool's source header by `bin/generate-tools-doc.py` — do not hand-edit. Run the generator after adding or re-documenting a tool.

85 tools.

- [`bin/clean`](#clean)
- [`bin/consolidate-front-end-html`](#consolidate-front-end-html)
- [`bin/create-form`](#create-form)
- [`bin/es-modules-decomment`](#es-modules-decomment)
- [`bin/es-modules-refactor`](#es-modules-refactor)
- [`bin/fill-full-stack-stubs.py`](#fill-full-stack-stubspy)
- [`bin/form-export-import-refactor`](#form-export-import-refactor)
- [`bin/forms-as-kebab-case`](#forms-as-kebab-case)
- [`bin/forms-as-pascal-case`](#forms-as-pascal-case)
- [`bin/forms-as-snake-case`](#forms-as-snake-case)
- [`bin/forms-as-tsv`](#forms-as-tsv)
- [`bin/forms-shard`](#forms-shard)
- [`bin/generate-changelog-and-examples.py`](#generate-changelog-and-examplespy)
- [`bin/generate-form-skills.py`](#generate-form-skillspy)
- [`bin/generate-forms-tsv.py`](#generate-forms-tsvpy)
- [`bin/generate-llms-txt.py`](#generate-llms-txtpy)
- [`bin/generate-loco-deny-config.py`](#generate-loco-deny-configpy)
- [`bin/generate-persona-dashboard-samples.py`](#generate-persona-dashboard-samplespy)
- [`bin/generate-persona-fhir-bundles.py`](#generate-persona-fhir-bundlespy)
- [`bin/generate-spec.py`](#generate-specpy)
- [`bin/generate-tools-doc.py`](#generate-tools-docpy)
- [`bin/html-date-time-picker-vendor`](#html-date-time-picker-vendor)
- [`bin/html-error-message-contrast-fix`](#html-error-message-contrast-fix)
- [`bin/html-helpers-chooser-rename`](#html-helpers-chooser-rename)
- [`bin/html-helpers-picker-rename`](#html-helpers-picker-rename)
- [`bin/html-share-button-refactor`](#html-share-button-refactor)
- [`bin/html-text-size-select-refactor`](#html-text-size-select-refactor)
- [`bin/html-theme-locale-select-refactor`](#html-theme-locale-select-refactor)
- [`bin/lily-html-refactor`](#lily-html-refactor)
- [`bin/lily-svelte-refactor`](#lily-svelte-refactor)
- [`bin/lily-svelte-status`](#lily-svelte-status)
- [`bin/lily-svelte-sync`](#lily-svelte-sync)
- [`bin/lily-svelte-theme-locale-select-refactor`](#lily-svelte-theme-locale-select-refactor)
- [`bin/lily-sync`](#lily-sync)
- [`bin/loco-config-refactor`](#loco-config-refactor)
- [`bin/loco-forbid-unsafe`](#loco-forbid-unsafe)
- [`bin/loco-migration-defaults`](#loco-migration-defaults)
- [`bin/loco-migration-nullability`](#loco-migration-nullability)
- [`bin/loco-msrv-set`](#loco-msrv-set)
- [`bin/loco-rs-1-migration`](#loco-rs-1-migration)
- [`bin/loco-seed-base-rename`](#loco-seed-base-rename)
- [`bin/loco-seed-base-stray-usage-fix`](#loco-seed-base-stray-usage-fix)
- [`bin/loco-test-auth-header-fix`](#loco-test-auth-header-fix)
- [`bin/loco-test-max-connections-fix`](#loco-test-max-connections-fix)
- [`bin/make-github-pages`](#make-github-pages)
- [`bin/migrate-sql-filenames.py`](#migrate-sql-filenamespy)
- [`bin/node-current-version-set`](#node-current-version-set)
- [`bin/normalize`](#normalize)
- [`bin/page-header-layout-refactor`](#page-header-layout-refactor)
- [`bin/route-loco-layout`](#route-loco-layout)
- [`bin/route-svelte-layout`](#route-svelte-layout)
- [`bin/svelte-date-time-picker-vendor`](#svelte-date-time-picker-vendor)
- [`bin/svelte-helpers-chooser-rename`](#svelte-helpers-chooser-rename)
- [`bin/svelte-helpers-picker-rename`](#svelte-helpers-picker-rename)
- [`bin/svelte-kit-3-theme-url-fix.py`](#svelte-kit-3-theme-url-fixpy)
- [`bin/svelte-locale-select-refactor`](#svelte-locale-select-refactor)
- [`bin/svelte-pnpm-workspace-fix`](#svelte-pnpm-workspace-fix)
- [`bin/svelte-share-button-refactor`](#svelte-share-button-refactor)
- [`bin/svelte-test-result-theming-backport`](#svelte-test-result-theming-backport)
- [`bin/svelte-text-size-select-refactor`](#svelte-text-size-select-refactor)
- [`bin/svelte-theme-css-sync`](#svelte-theme-css-sync)
- [`bin/svelte-vitest-app-env-alias-fix`](#svelte-vitest-app-env-alias-fix)
- [`bin/sync-from-skel-to-forms`](#sync-from-skel-to-forms)
- [`bin/test`](#test)
- [`bin/test-e2e`](#test-e2e)
- [`bin/test-engines`](#test-engines)
- [`bin/test-examples-conformance`](#test-examples-conformance)
- [`bin/test-form`](#test-form)
- [`bin/test-loco-project`](#test-loco-project)
- [`bin/test-loco-routes`](#test-loco-routes)
- [`bin/test-personas`](#test-personas)
- [`bin/test-sql-apply`](#test-sql-apply)
- [`bin/test-tools`](#test-tools)
- [`bin/test-tutorials`](#test-tutorials)
- [`bin/test-vendored-uniformity`](#test-vendored-uniformity)
- [`bin/update`](#update)
- [`bin/update-group-b-plans.py`](#update-group-b-planspy)
- [`bin/protobuf/generate-protobuf-representations.py`](#protobufgenerate-protobuf-representationspy)
- [`bin/openapi/generate-openapi-combined.py`](#openapigenerate-openapi-combinedpy)
- [`bin/openapi/generate-openapi-representations.py`](#openapigenerate-openapi-representationspy)
- [`bin/back-end-with-loco/generate-back-end-with-loco-setup.py`](#back-end-with-locogenerate-back-end-with-loco-setuppy)
- [`bin/back-end-with-loco/generate-loco-agents.py`](#back-end-with-locogenerate-loco-agentspy)
- [`bin/back-end-with-loco/generate-rust-docs.py`](#back-end-with-locogenerate-rust-docspy)
- [`bin/sql/generate-sql-combined.py`](#sqlgenerate-sql-combinedpy)
- [`bin/sql/generate-sql-comments.py`](#sqlgenerate-sql-commentspy)

<h2 id="clean"><code>bin/clean</code></h2>

_No header documentation._

<h2 id="consolidate-front-end-html"><code>bin/consolidate-front-end-html</code></h2>

```text
consolidate-html <slug> : merge legacy split HTML front-ends
   front-end-form-with-html/ + front-end-dashboard-with-html/
 into the canonical consolidated front-end-with-html/ layout.

 Deterministic and git-aware (uses git mv). Refuses to run unless the two
 legacy dirs exist and the canonical dir does not.
```

<h2 id="create-form"><code>bin/create-form</code></h2>

_No header documentation._

<h2 id="es-modules-decomment"><code>bin/es-modules-decomment</code></h2>

```text
One-shot cleanup (already applied): remove the now-stale IIFE / namespace /
classic-script comments left behind by the ES-module conversion (see
spec/es-modules.md) — "Wrapped in an IIFE; published via window.X", the
"Sibling files loaded as plain <script> tags …" preambles, and the "loaded as
a classic <script> … opened directly via file://" namespace-guard blocks.

Operates only on `//` line-comment blocks; JSDoc, code, and clean comment
paragraphs are left byte-identical (every changed line is a comment or blank).
Minimal diff: deletes fully-stale paragraphs and single lines, truncates
trailing stale sentences, and collapses orphaned blank lines. Idempotent — a
re-run over the already-cleaned tree changes nothing.

Usage: bin/es-modules-decomment [--apply] [file ...]   (default: dry-run)
```

<h2 id="es-modules-refactor"><code>bin/es-modules-refactor</code></h2>

```text
bin/es-modules-refactor — convert a form's `front-end-with-html/`
JavaScript from the classic `window.<Namespace>` global-sharing pattern to
native ES modules (`import` / `export` + `<script type="module">`).

See spec/es-modules.md for the decision, the source pattern, and the target
pattern. In short, each `js/*.js` file used to be an IIFE that published its
public symbols onto a per-surface `window.<Namespace>` object and consumed its
dependencies back off it, with the dependency graph encoded in the order of
classic `<script>` tags in the HTML. This tool:

  * drops the IIFE wrapper and `'use strict'` (modules are strict + scoped);
  * removes the namespace plumbing (`window.NS = window.NS || {}`,
    `const NS = window.NS`, publish lines, destructure-consume lines);
  * emits a trailing `export { … }` for each file's published symbols;
  * emits top-of-file `import { … } from './file.js'` for each consumed
    symbol, resolved through a per-form symbol -> file map;
  * rewrites `index.html` / `dashboard.html` to load a single module entry
    point (plus any standalone utility such as `table-export.js`);
  * preserves genuine `window.*` assignments that are not namespace plumbing
    (e.g. an entry exposing `window.gradeObjective` for the smoke test).

The transform is conservative: if a form uses a namespace idiom the tool does
not recognise, it ABORTS that whole form (leaves every file untouched) and
reports it, so a form is never left half-converted.

Usage:
  bin/es-modules-refactor <slug>...        # named forms
  bin/es-modules-refactor --all            # every form under forms/
  bin/es-modules-refactor --dry-run <slug> # show what would change
  bin/es-modules-refactor --check --all    # CI drift check (non-zero on drift)

Idempotent: a form already on ES modules (no namespace plumbing left) is a
no-op. --check implies --dry-run and exits non-zero if any form would change.
```

<h2 id="fill-full-stack-stubspy"><code>bin/fill-full-stack-stubs.py</code></h2>

```text
Fill stub back-end-with-loco/ AGENTS.md, plan.md, index.md files across all
forms.

Replaces files that contain the placeholder phrase "Not yet implemented." with
templated content describing the planned Rust JSON API back-end. Each form's
root index.md is read to extract the form's title and one-line description.
```

<h2 id="form-export-import-refactor"><code>bin/form-export-import-refactor</code></h2>

```text
bin/form-export-import-refactor — mechanically roll out wizard-level
JSON/XML/CSV/TSV export and JSON import to every HTML front-end that
matches the fleet's dominant `form-app.js` shape.

Reference implementation: forms/pre-operative-assessment-by-clinician
(see forms/AGENTS-front-end-html.md "Where wired..." for the contract).
This tool reproduces that hand-written change mechanically for every
other form whose form-app.js/index.html match the same idioms:

  1. `js/form-app.js` declares `let state = loadState();` and
     `let lastResult = null;` at module scope.
  2. `loadState()` has the shape
     `const fresh = <emptyFn>(); <merge loop>; return fresh;` inside its
     try block — the merge loop varies per form (some check typeof,
     some check arrays, some have field-specific logic) and is extracted
     verbatim, not reimplemented.
  3. `startOver()` has a `state = <emptyFn>();` line, and everything
     after it (in whatever order and whatever per-form functions that
     specific form calls) is the exact re-render sequence a fresh
     import should also run — extracted verbatim, not reimplemented.
  4. `index.html` has an exact
     `<script type="module" src="js/form-app.js"></script>` line.

Forms not matching all four idioms are left untouched and reported
under "SKIP (needs manual handling)" — the same escape hatch
bin/es-modules-refactor and bin/lily-html-refactor use for idioms a
mechanical pass should not guess at.

For each matched form, this tool:
  - Extracts loadState()'s merge loop into a new, separate
    `mergeIntoDefaults(parsed)` function (also used by JSON import, so
    both restore paths tolerate the same partial/foreign-shaped input);
    rewrites loadState() to call it.
  - Inserts a `window.__FORM_STATE__ = { slug, getState, setState }`
    block after `let lastResult = null;`, whose `setState` reuses
    startOver()'s exact post-reset tail.
  - Vendors js/form-export.js and js/form-import.js (byte-identical
    across every form, like js/table-export.js) into the form's js/.
  - Adds the two forms' <script type="module"> tags to index.html,
    right after the form-app.js entry tag.

Usage:
    bin/form-export-import-refactor [--check] [--dry-run] [--all|<slug>...]

--check reports which forms would change / are skipped, and exits
non-zero if any change is pending (CI drift detector). --dry-run shows
per-form status without writing. Default (no flags): apply. Idempotent:
a form already carrying `window.__FORM_STATE__` is left alone.
```

<h2 id="forms-as-kebab-case"><code>bin/forms-as-kebab-case</code></h2>

_No header documentation._

<h2 id="forms-as-pascal-case"><code>bin/forms-as-pascal-case</code></h2>

_No header documentation._

<h2 id="forms-as-snake-case"><code>bin/forms-as-snake-case</code></h2>

_No header documentation._

<h2 id="forms-as-tsv"><code>bin/forms-as-tsv</code></h2>

_No header documentation._

<h2 id="forms-shard"><code>bin/forms-shard</code></h2>

```text
bin/forms-shard <index> <total> — print the form slugs assigned to one
 shard of a deterministic split of all forms into <total> groups.

 Slugs come from bin/forms-as-kebab-case (sorted). Form N (0-based) goes to
 shard (N mod total). Used by CI matrix jobs to parallelize per-form work
 (cargo, npm) across runners.

   bin/forms-shard 0 8      # first of eight shards

 <index> is 0-based and must satisfy 0 <= index < total.
```

<h2 id="generate-changelog-and-examplespy"><code>bin/generate-changelog-and-examples.py</code></h2>

```text
bin/generate-changelog-and-examples.py — Scaffold CHANGELOG.md and examples/.

For every form under forms/ this script ensures:

- forms/<slug>/CHANGELOG.md (Keep-a-Changelog 1.1.0 stub, semver policy)
- forms/<slug>/examples/AGENTS.md, CLAUDE.md, index.md, README.md (skeleton)
- forms/<slug>/examples/assessment.json (a filled-form JSON fixture derived from
  sql/ — type-defaulted, CHECK-constraint aware)
- forms/<slug>/examples/fhir-bundle.json (a FHIR R5 Bundle of type=collection
  composed by wrapping every resource under forms/<slug>/fhir/r5/*.json)

Idempotent. Re-running with no upstream schema change is a no-op (same bytes).
The CHANGELOG.md is never overwritten if it already exists with non-default
content (we only write the stub the first time).

Usage:
  bin/generate-changelog-and-examples.py                 # all forms
  bin/generate-changelog-and-examples.py <slug> [...]    # only named forms
  bin/generate-changelog-and-examples.py --check         # exit nonzero on drift
```

<h2 id="generate-form-skillspy"><code>bin/generate-form-skills.py</code></h2>

```text
bin/generate-form-skills.py — Generate forms/<slug>/skills/ per form.

Writes two Claude Code Skills per form, mirroring the repo-root pair
(`form-examples-skill` / `form-examples-maintainer-skill`) but scoped to
one form:

- forms/<slug>/skills/<slug>-skill/SKILL.md
  End-user-facing: what the form measures, its scoring instrument and
  categories, and where to find its worked examples/personas.
- forms/<slug>/skills/<slug>-maintainer-skill/SKILL.md
  Implementation-facing: this form's directory layout, engine
  reference, and its own verify-gate commands.

Content is derived from each form's own index.md and AGENTS.md (title,
first paragraph, "Scoring system"/"Scoring engine" section, "Verify"
fenced command block) plus which artefact directories actually exist on
disk. Generated artefact: do not hand-edit. Idempotent — re-running with
no upstream change is a no-op (same bytes).

Usage:
  bin/generate-form-skills.py            # generate for every form
  bin/generate-form-skills.py <slug> ... # generate only the named forms
  bin/generate-form-skills.py --check    # exit non-zero if any skill would change
```

<h2 id="generate-forms-tsvpy"><code>bin/generate-forms-tsv.py</code></h2>

```text
bin/generate-forms-tsv.py — Generate forms.tsv from the forms/ directory.

forms.tsv is the case-conversion lookup table read by bin/forms-as-kebab-case,
bin/forms-as-snake-case, and bin/forms-as-pascal-case (hence by bin/test and
every tool that iterates the form slugs). Each row is three tab-separated
columns derived mechanically from a form's directory name:

    <kebab-case>        <snake_case>    <PascalCase>

Rows are the sorted list of immediate sub-directories of forms/ that are real
form projects (they contain an index.md), excluding shared support dirs such
as lily-spec/, lily-svelte-spec/, doc/, and fhir/.

Generated artefact: do not hand-edit. Idempotent — re-running with no upstream
change is a no-op (same bytes).

Usage:
  bin/generate-forms-tsv.py          # rewrite forms.tsv to match forms/
  bin/generate-forms-tsv.py --check  # exit non-zero if forms.tsv is stale
```

<h2 id="generate-llms-txtpy"><code>bin/generate-llms-txt.py</code></h2>

```text
bin/generate-llms-txt.py — Generate forms/<slug>/llms.txt per form.

Writes each form's llms.txt in the llmstxt.org format: an H1 title, a
one-paragraph blockquote summary (both drawn from the form's index.md),
and a Docs section linking the form's key artefacts. The file gives LLM
agents a compact, curated entry point into the form directory.

Generated artefact: do not hand-edit. Idempotent — re-running with no
upstream change is a no-op (same bytes).

Usage:
  bin/generate-llms-txt.py            # generate for every form
  bin/generate-llms-txt.py <slug> ... # generate only the named forms
  bin/generate-llms-txt.py --check    # exit non-zero if any llms.txt would change
```

<h2 id="generate-loco-deny-configpy"><code>bin/generate-loco-deny-config.py</code></h2>

```text
bin/generate-loco-deny-config.py — Write forms/<slug>/back-end-with-loco/deny.toml.

Every Loco crate shares the same `loco-rs` 0.16 dependency pin and
therefore (near enough) the same dependency graph, so one canonical
cargo-deny policy — advisories/licenses/bans/sources — applies to all of
them verbatim. This script writes that byte-identical policy into every
form's `back-end-with-loco/deny.toml`.

Generated artefact: do not hand-edit. Idempotent — re-running with no
upstream change is a no-op (same bytes). If a crate's dependency graph
ever needs a crate-specific exception, add it here with a per-crate
comment explaining why, rather than hand-editing the file in place (the
next `--check`-clean regeneration would silently drop it).

Usage:
  bin/generate-loco-deny-config.py            # generate for every form
  bin/generate-loco-deny-config.py <slug> ... # generate only the named forms
  bin/generate-loco-deny-config.py --check    # exit non-zero if any deny.toml would change
```

<h2 id="generate-persona-dashboard-samplespy"><code>bin/generate-persona-dashboard-samples.py</code></h2>

```text
Generate dashboard sample-report rows from examples/personas.json.

Each *-test-result form's clinician dashboard shows synthetic sample rows
(front-end-with-html/js/data.js and the parallel
front-end-with-svelte/src/lib/data/sample-reports.ts) so it has something
to display when the back end is offline. Those rows were previously
hand-authored independently of examples/personas.json, so they could (and
occasionally did) disagree with what the actual scoring engine would grade
for a similarly-described case. This generator derives one dashboard row
per persona directly from that persona's `state` and computed `expected`
grade, so the dashboard and the persona oracle can never disagree.

Scope: the *-test-result form family (see generate-persona-fhir-bundles.py
for the fleet-wide shape verification this reuses). Both stacks' ReportRow
shape is read from front-end-with-svelte/.../engine/types.ts (the
authoritative source; front-end-with-html/js/dashboard-types.js's JSDoc
`@typedef` is a hand-kept mirror of the same interface) — field order is
preserved exactly as declared there, since a few forms interleave a
domain-specific field (e.g. dexa-bone-density-test-result's `lowestTScore`,
`whoClassification`) between the generic ones rather than appending it.

Field mapping:
  id                          synthetic <PREFIX>-2026-NNNN, PREFIX read from
                               the form's own existing data.js (no fleet-wide
                               naming rule; every form picked its own)
  patientName                 cycled from a shared synthetic name pool
  reportStatus / reportedDate persona.state (present in every form in this
                               family)
  resultClassification / abnormalitySeverity / followUpUrgency /
  reportCompletenessPercent   persona.expected (the four-axis grade)
  flagCount                   len(persona.expected.flags)
  any other field             persona.state[<same camelCase name>] — every
                               form in the family was confirmed to carry a
                               same-named key in its persona state

Usage:
    bin/generate-persona-dashboard-samples.py [--check] [--all|<slug>...]

With no slugs and no --all, defaults to every *-test-result form under
forms/. --check reports drift without writing (CI drift detector).
```

<h2 id="generate-persona-fhir-bundlespy"><code>bin/generate-persona-fhir-bundles.py</code></h2>

```text
Generate per-persona FHIR R5 Bundles from examples/personas.json.

For each persona in a form's examples/personas.json, builds a FHIR R5
Bundle (type = collection) reflecting that persona's actual filled `state`
and computed `expected` grade. This is richer than examples/fhir-bundle.json
(generated by generate-changelog-and-examples.py), which wraps the generic,
type-defaulted fhir/r5/*.json templates and carries the same placeholder
values regardless of which persona a reader has in mind.

Scope: the *-test-result form family, whose sql/ all share one shape —
patient, clinician, a single main <slug>_result table, and a
<table>_grade / _grade_rule / _grade_flag triad (Phase 13's "shared
shape", verified fleet-wide 2026-09-06). Reuses
bin/fhir-r5/generate-fhir-r5-representations.py's SQL column parser and
value-typing helpers, substituting persona state/expected values in place
of its generic guess_fhir_value() placeholders.

Mapping (deliberately not fhir-r5's per-entity classify_table() — this is a
different, persona-driven artefact, not a schema-level template):
  patient / clinician  -> Patient / Observation, copied unchanged from
                          fhir/r5/*.json (personas do not vary these fields
                          in this form family)
  main <slug>_result    -> Observation, one component per column with a
                          non-empty persona.state value (an unanswered `''`
                          / `null` field is omitted, not fabricated; a
                          column absent from state falls back to the
                          generic guessed example, as a schema-drift safety
                          net)
  <table>_grade         -> ClinicalImpression summary built from
                          persona.expected's four-axis fields
  <table>_grade_rule    -> one DetectedIssue per persona.expected.firedRules
  <table>_grade_flag    -> one DetectedIssue per persona.expected.flags

Output: examples/personas-fhir/<NN>-<slugified-persona-name>.json, one file
per persona, plus the standard AGENTS.md/CLAUDE.md/index.md/README.md doc
quartet for the new directory.

Usage:
    bin/generate-persona-fhir-bundles.py [--check] [--all|<slug>...]

With no slugs and no --all, defaults to every *-test-result form under
forms/. --all is a synonym (this generator supports only that family so
far). --check reports drift without writing (CI drift detector).
```

<h2 id="generate-specpy"><code>bin/generate-spec.py</code></h2>

```text
bin/generate-spec.py — Scaffold forms/<slug>/spec/index.md per form.

For every directory under forms/ that contains an index.md, ensure a
spec/ directory exists holding index.md (the living domain spec) plus a
README.md symlink — the form-level counterpart to the top-level system
spec. (Older forms used a single `spec.md` file; the gold standard is
now the `spec/` directory.)

The per-form spec is a HAND-MAINTAINED living document: it is the
source of truth for behaviour, updated before code changes
(spec-driven development). This tool therefore only SCAFFOLDS:

- default: write spec/index.md only where it is missing or empty
  (seeded from index.md), and repair a missing README.md symlink;
- --force: deliberately regenerate the named forms' spec/index.md
  from the template, overwriting hand edits (requires explicit slugs);
- --check: exit non-zero if any form lacks a non-empty spec/index.md
  or its README.md symlink. Hand-edited content is never "drift".

Usage:
  bin/generate-spec.py                    # scaffold all missing specs
  bin/generate-spec.py <slug> ...         # scaffold only the named forms
  bin/generate-spec.py --force <slug> ... # regenerate named forms (overwrite)
  bin/generate-spec.py --check            # structural check, no writes
```

<h2 id="generate-tools-docpy"><code>bin/generate-tools-doc.py</code></h2>

```text
bin/generate-tools-doc.py — Generate docs/tools.md from bin/ tool headers.

Every tool in bin/ documents itself in a leading header: a module docstring
(Python) or a run of `#` comment lines (shell). This script harvests that
header — WITHOUT executing the tool, since some tools have side effects — and
renders a single reference page, docs/tools.md.

Generated artefact: do not hand-edit. Idempotent.

Usage:
  bin/generate-tools-doc.py          # write docs/tools.md
  bin/generate-tools-doc.py --check  # exit non-zero if docs/tools.md is stale
```

<h2 id="html-date-time-picker-vendor"><code>bin/html-date-time-picker-vendor</code></h2>

```text
bin/html-date-time-picker-vendor -- add js/date-time-picker.js, the fifth
Lily helper's hand-authored HTML-side implementation, to every form's
front-end-with-html/js/.

Unlike the other four HTML helpers (theme-select, locale-select,
text-size-picker, share-picker), this file is byte-identical across every
form: date-time-picker needs no per-form storage key (spec: it has no
persistence at all -- a date is data, not a preference), so there is
nothing to template per-slug.

Deliberately vendor-only: this does NOT wire date-time-picker.js into any
index.html/dashboard.html, and does NOT touch the existing .date-input /
<input type="date"> convention any form currently uses. See
bin/svelte-date-time-picker-vendor for the Svelte-side equivalent and the
full rationale (a hand-rolled calendar dialog has weaker
assistive-technology support than the native date input every form
already uses -- swapping fields is a separate, unstarted decision).

Usage:
  bin/html-date-time-picker-vendor --check   # CI drift check (no writes)
  bin/html-date-time-picker-vendor --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="html-error-message-contrast-fix"><code>bin/html-error-message-contrast-fix</code></h2>

```text
bin/html-error-message-contrast-fix — fix fleet-wide semantic-colour
text-contrast bugs in front-end-with-html/css/style.css.

Found via bin/test-e2e --html --all (355 forms), in two waves:

1. `--color-danger: var(--color-error);` — 352/355 forms alias the
   danger/error text colour directly to the raw Lily brand token
   (oklch(71% 0.194 13.428) = #ff627d, 2.88:1 against white; WCAG AA
   needs 4.5:1). 18 forms failed axe's color-contrast check outright
   (the rest carry the identical latent bug, just not visibly rendering
   an error message at this smoke test's default page state). Fixed by
   overriding --color-danger to a darkened shade of the same hue
   (#b24457, 5.44:1). --color-danger-bg (a light background tint) and
   --color-error itself (used correctly elsewhere, e.g. borders/icons)
   are untouched.

2. Re-running the sweep after (1) found 10 forms still failing — a
   second, parallel bug: `color: var(--color-success)` (350/355 forms,
   same "raw brand token as text" pattern, e.g. the
   `.step-list-item[data-status="finished"]` badge: #00d390 on its own
   #dff8eb tint, 1.75:1) and `--color-warning` used as a white-text
   button/badge fill (#fcb700, 1.76:1 for white text). --color-info
   wasn't caught failing by this particular smoke test, but shares the
   identical token-definition shape (oklch 74%/0.16/232.661, 2.22:1
   against white) and is fixed pre-emptively rather than left as the
   same latent bug for a future sweep to rediscover.

   First attempt at this got it wrong and was reverted before commit:
   overriding the raw --color-success/-warning/-info tokens directly
   (mirroring the --color-danger fix) also darkens
   `--color-success-bg: color-mix(in oklab, var(--color-success) 18%,
   var(--color-base-100))` — which derives from the SAME token — so the
   badge's own background got darker along with its text, undercutting
   the fix (verified live: #007e56 on the resulting #d7e7df was only
   3.97:1, still failing). --color-danger didn't have this problem
   because --color-danger-bg derives from the untouched --color-error,
   not from --color-danger itself. Fixed by also freezing
   --color-success-bg/--color-warning-bg to the *original* raw hex
   (not the token, which now points at the darkened value) wherever
   they're already defined, decoupling the background from the text
   override — then re-verified live against the actual rendered
   background, not just against plain white.

All darkened values, computed by scaling each token's sRGB channels
until crossing 4.5:1 against white, then confirmed live (Playwright +
axe-core) against each token's own actual rendered *-bg background:

  --color-danger:  #ff627d -> #b24457  (5.44:1 vs white; --color-danger-bg untouched)
  --color-success: #00d390 -> #007e56  (5.10:1 vs white; --color-success-bg frozen to the original #00d390)
  --color-warning: #fcb700 -> #976d00  (4.66:1 vs white; --color-warning-bg frozen to the original #fcb700)
  --color-info:    #00bafe -> #0078a5  (4.96:1 vs white; no form defines --color-info-bg)

3. Re-running the full sweep after (2) left exactly 1 of 355 forms
   failing (biopsy-test-request): `.flag-category`/`.flag-action`
   (`color: var(--color-muted)`) inside `.flags li.flag-medium`
   (`background: var(--color-warning-bg)`) — #666668 on #eae1d1,
   4.41:1, off by 0.09. --color-muted itself
   (`color-mix(in oklab, var(--color-base-content) 62%,
   var(--color-base-100))`) is identical in 334/355 forms and reused
   for plain body/muted text everywhere, not just this one badge, so
   the same near-miss is latent fleet-wide (only this one form's
   default demo data happens to render a "medium" severity flag). Bumped
   the mix from 62% to 68% (kept as a relative color-mix() percentage,
   not a hardcoded hex, since --color-base-content is theme-swappable in
   these forms) — #666668 -> #58585b, 5.47:1 against the warning tint
   and *better* against white (7.09:1 vs 5.73:1 before), confirmed via
   the same oklab conversion used for the other three tokens.

Usage:
  bin/html-error-message-contrast-fix [--check] [--dry-run]
```

<h2 id="html-helpers-chooser-rename"><code>bin/html-helpers-chooser-rename</code></h2>

```text
bin/html-helpers-chooser-rename -- rename the two HTML-side controls that
mirror the Lily Svelte helpers' naming: text-size-select -> text-size-chooser,
share-button -> share-chooser (dropping the old "-trigger" class in favour of
"-button", matching the upstream ShareChooser rename).

#theme-select / #locale-select are deliberately left untouched: those HTML
controls reuse the *catalog* Lily `.theme-select` / `.theme-select-option`
classes (a different, unrelated component family that the upstream helpers
rename explicitly did NOT touch), not the renamed helpers package.

What changes per form (front-end-with-html/):
  - index.html, dashboard.html -> every `text-size-select` / `share-button`
    substring (ids, classes, aria-controls, comments) renamed
  - css/style.css, css/dashboard.css -> same substring rename
  - js/text-size-select.js -> renamed to js/text-size-chooser.js (content
    substring-renamed too)
  - js/share-button.js -> renamed to js/share-chooser.js (content
    substring-renamed too)

Usage:
  bin/html-helpers-chooser-rename --check   # CI drift check (no writes)
  bin/html-helpers-chooser-rename --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="html-helpers-picker-rename"><code>bin/html-helpers-picker-rename</code></h2>

```text
bin/html-helpers-picker-rename -- rename the two HTML-side controls that
mirror the Lily Svelte helpers' naming: text-size-chooser -> text-size-picker,
share-chooser -> share-picker, matching the upstream rename
(lily-design-system commit "Rename *-chooser to *-picker to harmonize with
Adobe").

#theme-select / #locale-select are untouched: those HTML controls reuse the
*catalog* Lily `.theme-select` / `.theme-select-option` classes (a different,
unrelated component family the upstream helpers rename never touched), not
the renamed helpers package.

What changes per form (front-end-with-html/):
  - index.html, dashboard.html -> every `text-size-chooser` / `share-chooser`
    substring (ids, classes, aria-controls, script src, comments) renamed
  - css/style.css, css/dashboard.css -> same substring rename
  - js/text-size-chooser.js -> renamed to js/text-size-picker.js (content
    substring-renamed too)
  - js/share-chooser.js -> renamed to js/share-picker.js (content
    substring-renamed too)

Usage:
  bin/html-helpers-picker-rename --check   # CI drift check (no writes)
  bin/html-helpers-picker-rename --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="html-share-button-refactor"><code>bin/html-share-button-refactor</code></h2>

```text
bin/html-share-button-refactor -- add a fourth header control, a share
button, to every form's front-end-with-html/ (index.html + dashboard.html),
alongside locale-select, theme-select, and text-size-select.

Mirrors lily-design-system-svelte-helpers/lily-design-system-svelte-share-button
(see bin/svelte-share-button-refactor for the Svelte-side rollout and its
rationale for offering copy-link only, no social-network targets), adapted to
this repo's vanilla-JS HTML convention: a button that tries the native Web
Share API first, falling back to a small one-item list ("Copy link").

What changes per form (front-end-with-html/):
  - js/share-button.js -> new vanilla-JS module (vendored contract; no
    app-specific logic beyond the page's own title, read from <title>)
  - css/style.css, css/dashboard.css -> appends the `.share-button` baseline
    CSS once (same class hooks/visual language as the Svelte component, so
    both stacks look identical)
  - index.html, dashboard.html -> inserts a `.share-button` control right
    after the existing #text-size-select </select>, and a
    `<script type="module" src="js/share-button.js">` tag alongside the
    existing theme-select.js / locale-select.js / text-size-select.js tags

Usage:
  bin/html-share-button-refactor --check   # CI drift check (no writes)
  bin/html-share-button-refactor --apply   # write changes

Only touches forms whose header already has #text-size-select (the standard
shape produced by bin/html-text-size-select-refactor). Forms without one are
skipped and reported for hand migration.

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="html-text-size-select-refactor"><code>bin/html-text-size-select-refactor</code></h2>

```text
bin/html-text-size-select-refactor -- add a third header control, text-size-select,
to every form's front-end-with-html/ (index.html + dashboard.html), alongside the
existing locale-select and theme-select.

Mirrors lily-design-system-svelte-helpers/lily-design-system-svelte-text-size-select
(see bin/svelte-text-size-select-refactor for the Svelte-side rollout), adapted to
this repo's HTML convention: a native <select class="theme-select"> (reusing the
existing Lily theme-select styling, matching #locale-select/#theme-select), setting
`data-text-size` on <html> and persisting to localStorage.

What changes per form (front-end-with-html/):
  - js/text-size-select.js -> new vanilla-JS module (vendored contract; slug-
    namespaced localStorage key, mirrors js/theme-select.js / js/locale-select.js)
  - css/style.css, css/dashboard.css -> appends the `[data-text-size="..."]`
    font-size mapping once (no new select styling needed -- .theme-select /
    .theme-select-option are reused verbatim)
  - index.html, dashboard.html -> inserts a `#text-size-select` <label>+<select>
    right after the existing #theme-select </select>, and a
    `<script type="module" src="js/text-size-select.js">` tag alongside the
    existing theme-select.js / locale-select.js tags

Usage:
  bin/html-text-size-select-refactor --check   # CI drift check (no writes)
  bin/html-text-size-select-refactor --apply   # write changes

Only touches forms whose header has a `#theme-select` control (the standard
shape produced by bin/html-theme-locale-select-refactor). Forms without one
(the bespoke THEME_COLLISION_SLUGS pages, locale-select only) are skipped and
reported for hand migration.

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="html-theme-locale-select-refactor"><code>bin/html-theme-locale-select-refactor</code></h2>

```text
bin/html-theme-locale-select-refactor — build multi-theme CSS
infrastructure and add theme-select + locale-select controls to every
form's `front-end-with-html/` header (index.html + dashboard.html).

front-end-with-html/ previously shipped a single self-contained
css/style.css (own hardcoded design tokens) with no theme-switching at
all. This tool:

  1. Vendors the full Lily theme CSS catalogue (~45 standalone theme
     stylesheets, each inlining all Lily component CSS) from the pinned
     Lily checkout into css/themes/<name>.css. Re-synced on every run
     regardless of whether steps 2-4 below have anything left to do for a
     given form (copy_theme_css has its own idempotent size-compare skip)
     -- otherwise, once a form is fully patched by steps 2-4, this step
     would never run again and the vendored catalogue would go stale
     forever. See bin/svelte-theme-css-sync for the equivalent on the
     front-end-with-svelte side, which has no steps 2-4 to piggyback on.
  2. Aliases each form's own css/style.css and css/dashboard.css design
     tokens (--color-bg, --color-primary, etc.) onto the swappable
     theme's tokens (--color-base-100/200/300/content, --color-primary,
     --color-error, --color-warning, --color-success) — the same
     mapping front-end-with-svelte's app.css already uses — so switching
     #theme-select re-skins the whole page, not just the new controls.
     --color-primary-dark has no Lily equivalent and stays static.
  3. Inserts a swappable <link id="theme-stylesheet"> plus a small
     blocking inline FOUC-prevention script into <head>.
  4. Inserts a `.page-header-controls` block (locale-select then
     theme-select, before any existing header content) and two new
     `js/theme-select.js` / `js/locale-select.js` ES modules.

Both controls reuse the `theme-select`/`theme-select-option` Lily
classes (matching the front-end-with-svelte LocaleSelect convention —
see bin/svelte-locale-select-refactor). Presentation-only: locale-select
sets <html lang> and persists the choice; no message catalogue is wired
up — see docs/i18n.md for the deferred full-i18n rollout.

Usage:
  bin/html-theme-locale-select-refactor --check   # CI drift check (no writes)
  bin/html-theme-locale-select-refactor --apply   # write changes
  bin/html-theme-locale-select-refactor --lily-dir PATH --apply

Skips forms with no css/style.css (a handful of stub forms with no
front-end-with-html styling at all yet).

Permanently excludes THEME_COLLISION_SLUGS (see below): bespoke pages
whose own CSS defines classes that collide with real Lily component
names (`.card`, `.container`, `.panel`, `.progress`, `.select`, …) with
different HTML structure. Loading the swappable Lily theme there doesn't
just no-op — the theme's rules for those class names apply to the page's
unrelated elements (e.g. `--lily-text` leaking onto a `.card` that never
declared its own text colour), which can make body text unreadable.
These forms keep only the locale-select control, hand-styled locally, and
never get the swappable `#theme-stylesheet` link. Do not "fix" this by
re-running the tool on them — the exclusion is load-bearing, verified by
rendering in a browser (see forms/*/CLAUDE.md history around
bin/html-theme-locale-select-refactor's addition).

Idempotent: re-running on an already-refactored form makes no further
changes.
```

<h2 id="lily-html-refactor"><code>bin/lily-html-refactor</code></h2>

```text
bin/lily-html-refactor — mechanically refactor a form's
`front-end-form-with-html/` and/or `front-end-dashboard-with-html/`
to the Lily Design System HTML headless class contract.

Scope: HTML and JS class swaps only. CSS rewrites and semantic
restructuring (sectionCard → fieldset, radio-group restructure,
new step-list/validation wiring) are out of scope — the tool
reports those locations so a subagent pass can handle them.

See forms/AGENTS-front-end-html.md for the class contract and
forms/plan.md §7 Phase 2 for the rationale.

Usage:
  bin/lily-html-refactor <slug>            # one form
  bin/lily-html-refactor --all             # all forms in forms/
  bin/lily-html-refactor --dry-run <slug>  # show what would change
  bin/lily-html-refactor --check --all     # CI drift check (non-zero on drift)
  bin/lily-html-refactor --scope=form <slug>
  bin/lily-html-refactor --scope=dashboard <slug>

The tool is idempotent: re-running on an already-refactored form
makes no further changes.

--check implies --dry-run and exits non-zero if any safe swaps would
be applied. Risky lines (structural patterns the tool won't auto-fix)
are reported but do not fail --check, since they require subagent
attention rather than mechanical correction.
```

<h2 id="lily-svelte-refactor"><code>bin/lily-svelte-refactor</code></h2>

```text
bin/lily-svelte-refactor — mechanically refactor a form's
`front-end-form-with-svelte/` and/or `front-end-dashboard-with-svelte/`
toward the Lily Design System Svelte headless contract.

Scope: safe class-attribute swaps inside Svelte template / TypeScript /
TSX-like fragments AND a risky-pattern report listing old-style
components, imports, and markup that require a subagent rewrite (the
structural rewrite is too varied to mechanise — see Phase 5.4 pilot
commit for the canonical shape).

See forms/AGENTS-front-end-svelte.md for the class contract, the
component vocabulary, and the prop conventions; forms/plan.md §7
Phase 5 for the rationale.

Usage:
  bin/lily-svelte-refactor <slug>            # one form
  bin/lily-svelte-refactor --all             # all forms in forms/
  bin/lily-svelte-refactor --dry-run <slug>  # show what would change
  bin/lily-svelte-refactor --check --all     # CI drift check (non-zero on drift)
  bin/lily-svelte-refactor --scope=form <slug>
  bin/lily-svelte-refactor --scope=dashboard <slug>

The tool is idempotent: re-running on an already-refactored form makes
no further changes.
```

<h2 id="lily-svelte-status"><code>bin/lily-svelte-status</code></h2>

```text
bin/lily-svelte-status — Report each form's Lily Svelte conformance level.

Inspects every `forms/<slug>/front-end-with-svelte/` and emits a
status line:

  PASS    — canonical Lily UI components present (Form, Fieldset, Field,
            Button, ErrorSummary, Panel, Progress) AND no legacy
            SectionCard/SelectInput/TextArea/ProgressBar/StepNavigation.
  PARTIAL — emits Lily classes but retains legacy component filenames.
  EMPTY   — no real implementation (no src/lib/components/steps/ or
            placeholder +page.svelte only).
  TODO    — has implementation, no Lily conversion yet.

Usage:
  bin/lily-svelte-status                # full report
  bin/lily-svelte-status --counts       # just the totals
  bin/lily-svelte-status --slugs-only   # one slug per line, filterable by --status=<value>
  bin/lily-svelte-status --status=TODO  # only forms needing work
```

<h2 id="lily-svelte-sync"><code>bin/lily-svelte-sync</code></h2>

```text
bin/lily-svelte-sync — Snapshot Lily Svelte headless component specs into this repo.

Walks the Lily Svelte checkout at
~/git/lilydesignsystem/lily-design-system/lily-design-system-svelte-headless/components/
and copies each component's source files into forms/lily-svelte-spec/, then
records the pinned upstream commit hash and today's date in
forms/lily-svelte-version.md.

Lily Svelte is consumed as a *contract* at authoring time. There is no
runtime dependency on the upstream package — each form's local
`src/lib/components/ui/` mirrors the Lily API. See
forms/AGENTS-front-end-svelte.md §2 for context.

Per component, the following files are snapshotted:

  <Name>.svelte
  <Name>.stories.svelte   (if present)
  <Name>.test.ts          (if present)
  index.md                (if present, copied as <Name>.md)

Usage:
  bin/lily-svelte-sync                 # snapshot from default checkout
  bin/lily-svelte-sync --lily-dir PATH # alternate checkout
  bin/lily-svelte-sync --check         # verify snapshot matches upstream (no writes)

Idempotent: re-running with no upstream change is a no-op.
```

<h2 id="lily-svelte-theme-locale-select-refactor"><code>bin/lily-svelte-theme-locale-select-refactor</code></h2>

```text
bin/lily-svelte-theme-locale-select-refactor -- migrate every form's
Svelte ThemeSelect/LocaleSelect from the old native-<select> pattern to the
new headless button+listbox pattern (lily-design-system-svelte-helpers'
lily-design-system-svelte-theme-select / -locale-select, vendored as a
contract -- see forms/AGENTS-front-end-svelte.md and
forms/lily-svelte-helpers-version.md).

What changes per form (front-end-with-svelte/):
  - src/lib/components/ui/ThemeSelect.svelte   -> rewritten (button + listbox)
  - src/lib/components/ui/LocaleSelect.svelte  -> rewritten (button + listbox)
  - src/lib/components/ui/ThemeSelectOption.svelte  -> deleted (no longer used)
  - src/lib/components/ui/LocaleSelectOption.svelte -> deleted (no longer used)
  - src/routes/<slug>/+layout.svelte -> ThemeSelect/LocaleSelect now manage
    their own <link>/data-theme/lang/dir/localStorage; the manual $state +
    $derived + $effect + <link> boilerplate is removed, and the components
    are called with themes/themesUrl/themeLabels (resp. locales/localeLabels)
    instead of iterating *Option children.
  - src/app.css -> baseline CSS for .lily-theme-select-*/.lily-locale-select-*
    appended once (headless: no default styling). Prefixed `lily-` because
    the vendored theme catalogue (static/themes/*.css) already claims the
    bare `.theme-select` / `.theme-select-button` / `.theme-select-option`
    class names for an unrelated picker-chip / native-select look -- reusing
    them verbatim (the literal upstream class hooks) visually breaks the
    control.

Usage:
  bin/lily-svelte-theme-locale-select-refactor --check   # CI drift check (no writes)
  bin/lily-svelte-theme-locale-select-refactor --apply   # write changes

Only touches forms whose +layout.svelte matches the standard shape produced
by the earlier bin/svelte-locale-select-refactor rollout. Forms with a
bespoke locale integration (currently just
medical-language-speaking-assessment-for-cymraeg, which drives LocaleSelect
from a shared i18n store) are skipped and reported for hand migration.

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="lily-sync"><code>bin/lily-sync</code></h2>

```text
bin/lily-sync — Snapshot Lily HTML headless component specs into this repo.

Reads HTML component files from the Lily checkout at
~/git/lilydesignsystem/lily-design-system/lily-design-system-html-headless/components/,
copies them into forms/lily-spec/, and records the pinned upstream commit
hash + today's date in forms/lily-version.md.

Lily is consumed as a *spec* at authoring time. There is no runtime
dependency on Lily — this tool is a doc-snapshotting helper so a
contributor can read the class/attribute contract without needing the
external checkout. See forms/AGENTS-front-end-html.md §2 for context.

Usage:
  bin/lily-sync                 # snapshot from default Lily checkout
  bin/lily-sync --lily-dir PATH # use a different Lily checkout location
  bin/lily-sync --check         # verify snapshot matches upstream (no writes)

The tool is idempotent: re-running with no upstream changes is a no-op.
```

<h2 id="loco-config-refactor"><code>bin/loco-config-refactor</code></h2>

```text
bin/loco-config-refactor — mechanically refactor each form's
`back-end-with-loco/` Loco crate to the canonical
background-queue and observability conventions documented in
`AGENTS/back-end-with-loco.md`:

  - Postgres-backed background queue (`worker`, loco-rs 1.0's backend-
    agnostic queue feature; the runtime backend is selected by `queue.kind:`
    in `config/*.yaml`, not by a Cargo feature)
  - The Redis-backed queue add-on (`worker_redis`) excluded
  - OpenTelemetry OTLP exporter dependencies
  - Prometheus `/metrics` dependency (`axum-prometheus`)
  - `Cargo.lock` tracked in git (see `spec/cargo-lock-tracking.md`)

Edits per Loco crate (a crate is any dir containing a `Cargo.toml` whose
contents reference `loco-rs`):

  Cargo.toml:
    - Rewrite the `loco-rs = { ... }` declaration to set
      `default-features = false` and an explicit features list that
      includes `worker` and excludes `worker_redis`.
    - Append OTel + Prometheus deps under `[dependencies]` if missing.

  config/development.yaml, config/test.yaml, config/production.yaml:
    - Set `workers.mode`: BackgroundQueue (development/production) or
      ForegroundBlocking (test, so queued mailer jobs run inline).
    - Insert/replace a `queue:` block with `kind: Postgres`, reusing the
      same Postgres URI as the existing `database.uri` and setting
      `dangerously_flush` and `num_workers` per environment.

  .gitignore:
    - Flip a bare `Cargo.lock` ignore line to `!Cargo.lock` so the
      lockfile is tracked (binary crate — reproducible builds).

The tool is idempotent: re-running on an already-refactored crate
makes no further changes.

Usage:
  bin/loco-config-refactor <slug>              # one form
  bin/loco-config-refactor --all               # every form's Loco crate
  bin/loco-config-refactor --dry-run <slug>    # show what would change
  bin/loco-config-refactor --check --all       # CI drift check (non-zero on drift)
```

<h2 id="loco-forbid-unsafe"><code>bin/loco-forbid-unsafe</code></h2>

```text
bin/loco-forbid-unsafe — add `#![forbid(unsafe_code)]` to every crate root
in every form's `back-end-with-loco/`.

Nothing in this monorepo's Rust needs `unsafe`: the crates are axum + Loco +
SeaORM request handlers over a relational schema, and a fleet-wide grep before
this tool was written found not one `unsafe` token in any crate source (the
sole match was the word "unsafe" inside a doc comment). `forbid` — rather than
`deny` — states that as a compiler-enforced invariant that a later inner
`#![allow(unsafe_code)]` cannot quietly reopen.

The attribute is per **crate root**, not per file, so each Cargo target needs
its own. Every form's crate has exactly four:

    src/<form_snake_case>/lib.rs           the library
    src/<form_snake_case>/bin/main.rs      the `<form_snake_case>-cli` binary
    migration/src/lib.rs                   the `migration` library
    tests/<name>.rs                        the integration-test target
                                           (`mod.rs` in 350 crates,
                                           `engine_tests.rs` in 5)

Insertion point, per file: after any leading `//!` crate-doc block and any
leading blank lines, and before everything else — so the attribute lands above
the existing `#![allow(...)]` runs (`migration/src/lib.rs` starts with two of
them) rather than between them. A file that already carries the attribute is
left alone: the twelve crates carrying hand-written rustdoc already have a
`// Always start with high quality coding conventions.` block, and eight of
those already had `#![forbid(unsafe_code)]` in `lib.rs` before this tool
existed.

This is an ongoing convention, not a one-shot migration. `cargo loco generate
scaffold` does not emit the attribute, so each form's generated
`back-end-with-loco-setup` script calls this tool as its final step, right
after `bin/route-loco-layout`; `--check` is the CI drift detector that catches
a crate which skipped it.

Usage:
  bin/loco-forbid-unsafe <slug>...        # named forms
  bin/loco-forbid-unsafe --all            # every form's Loco crate
  bin/loco-forbid-unsafe --dry-run --all  # show what would change
  bin/loco-forbid-unsafe --check --all    # CI drift check (non-zero on drift)
  bin/loco-forbid-unsafe --verbose --all  # list every file touched
```

<h2 id="loco-migration-defaults"><code>bin/loco-migration-defaults</code></h2>

```text
bin/loco-migration-defaults — mirror each form's `sql/` column defaults into
its `back-end-with-loco/migration/`.

`sql/` is the source of truth for every form's schema (see `AGENTS/sql.md`), and
it declares most columns `NOT NULL DEFAULT <value>`. The Loco crates are
bootstrapped by `cargo loco generate scaffold`, whose column DSL has no syntax
for defaults, so every generated migration declares those same columns `NOT
NULL` with no default at all. The back-end schema therefore disagrees with the
schema it is supposed to mirror, and any insert that omits a column fails with a
not-null violation instead of taking the documented default.

This tool closes that gap by rewriting the plain `ColType` entries to their
`*WithDefault` counterparts:

    ("status",     ColType::String)   ->  ColType::StringWithDefault("draft".to_string())
    ("vte_notes",  ColType::Text)     ->  ColType::TextWithDefault(String::new())
    ("sort_order", ColType::Integer)  ->  ColType::IntegerWithDefault(0)

Only columns that `sql/` declares `NOT NULL DEFAULT <literal>` are touched, and
only where the migration's own column is a non-null scalar of a matching type.
Defaults expressed as SQL function calls (`now()`, `gen_random_uuid()`) are
handled by Loco itself and are ignored here.

Tables are paired between the two representations by name, allowing for the
singular/plural convention (`CREATE TABLE soap_note` <-> `create_table(m,
"soap_notes")`). Columns are then matched by name *within* a paired table, so
that a column name appearing in several tables with different defaults — such as
`status` — is never crossed over.

Anything the tool cannot confidently rewrite is reported rather than guessed at:

  - a column `sql/` declares NOT NULL but the migration declares nullable
    (a nullability divergence, which is a separate defect — not fixed here)
  - a migration `ColType` with no `*WithDefault` counterpart
  - a table in one representation with no counterpart in the other

The tool is idempotent: a column already carrying a `*WithDefault` is left
alone, so re-running changes nothing.

Note that `cargo loco generate scaffold` still cannot express defaults, so
re-scaffolding a crate from its `back-end-with-loco-setup` script reintroduces
the divergence. Re-run this tool afterwards.

Usage:
  bin/loco-migration-defaults <slug>…            # named forms
  bin/loco-migration-defaults --all              # every form's Loco crate
  bin/loco-migration-defaults --dry-run --all    # show what would change
  bin/loco-migration-defaults --check --all      # CI drift check (non-zero on drift)
```

<h2 id="loco-migration-nullability"><code>bin/loco-migration-nullability</code></h2>

```text
bin/loco-migration-nullability — restore each form's `sql/` column
nullability in its `back-end-with-loco/` crate.

`sql/` is the source of truth for every form's schema (see `AGENTS/sql.md`).
Where it declares a column nullable, the Loco crate must agree — in the
migration, in the generated entity, and in the controller's `Params` struct,
all three of which have to move together or the entity starts lying about the
database.

The dominant case is a **nullable UNIQUE** column, of which
`united_kingdom_nhs_number` is the archetype:

    sql/        united_kingdom_nhs_number VARCHAR(20) UNIQUE       -- nullable
    migration   ("united_kingdom_nhs_number", ColType::StringUniq) -- NOT NULL
    entity      pub united_kingdom_nhs_number: String              -- NOT NULL

Loco has no nullable-unique `ColType`: `StringUniq` is `NOT NULL UNIQUE`. The
consequence is not cosmetic. A `NOT NULL UNIQUE` text column can hold the empty
string exactly **once**, so the schema admits at most one patient without an NHS
number — every subsequent one collides:

    ERROR: duplicate key value violates unique constraint
    DETAIL: Key (united_kingdom_nhs_number)=() already exists.

`sql/` is right: under a nullable UNIQUE column, NULLs do not collide, so any
number of patients may lack the identifier while those that have one stay
unique. Overseas visitors and unidentified emergency admissions are ordinary,
so this matters clinically.

This tool restores that, per divergent column:

  - migration — `ColType::XUniq` becomes `ColType::XNull`, and the uniqueness
    is re-expressed as an explicit unique index appended to the same `up()`,
    following the `m.create_index(Index::create()…)` idiom already used
    elsewhere in the fleet. A plain `ColType::X` simply becomes `ColType::XNull`.
  - entity — `pub col: T` becomes `pub col: Option<T>`.
  - controller — the same field in the resource's `Params` struct.

The opposite direction is handled too: a column `sql/` declares NOT NULL while
the migration declares it nullable is tightened, and its entity and controller
field lose the `Option<…>`. Note that Loco's `ColType` cannot express a
`DEFAULT now()` on a timestamp, so such a column becomes NOT NULL without its
default and callers must supply a value — a smaller divergence from `sql/` than
admitting NULL, but not a perfect one.

The tool is idempotent, and anything it cannot rewrite confidently is reported
rather than guessed at.

Two limits worth knowing:

  - Controllers are located by their `use …_entities::<table>::` import. A
    consolidated controller that imports differently — as
    `architecture-decision-record` does — will not be found, and its `Params`
    struct must be adjusted by hand.
  - The tool only retypes struct fields. Hand-written logic *around* those
    fields still has to be reworked, because the meaning of "absent" moves from
    `None` to the empty string. `architecture-decision-record` needed exactly
    that in its Markdown renderer.

Usage:
  bin/loco-migration-nullability <slug>…            # named forms
  bin/loco-migration-nullability --all              # every form's Loco crate
  bin/loco-migration-nullability --dry-run --all    # show what would change
  bin/loco-migration-nullability --check --all      # CI drift check (non-zero on drift)
```

<h2 id="loco-msrv-set"><code>bin/loco-msrv-set</code></h2>

```text
bin/loco-msrv-set — set the Rust MSRV (current stable N-2) fleet-wide,
per spec/rust-msrv-n-minus-2/.

The spec's guidance assumes a single repo-root Cargo workspace
(`[workspace.package]` with `rust-version`, every member crate inheriting
via `rust-version.workspace = true`). This repo has no such root: each
form's `back-end-with-loco/` is its OWN self-contained workspace (`[workspace]`
with no explicit `members`, which still auto-includes `migration/` as a
member via its path dependency — confirmed by `migration/Cargo.toml`'s
`loco-rs = { workspace = true }`). So the same pattern is applied 355 times,
once per form's workspace, rather than once at a repo root that doesn't
exist:

- `back-end-with-loco/Cargo.toml` gains a `[workspace.package]` table with
  `rust-version = "<MSRV>"`, and its own `[package]` gets
  `rust-version.workspace = true`.
- `back-end-with-loco/migration/Cargo.toml` (a member of the same implicit
  workspace, confirmed above) gets `rust-version.workspace = true` too.

MSRV is computed from the locally installed `rustc`'s stable version minus
two minor releases (e.g. stable 1.98 -> MSRV 1.96), matching the spec's
rule exactly: `--msrv` overrides this for a specific value instead.

This is an ongoing convention, not a one-shot migration: it must be
re-applied (with a new --msrv) every time stable Rust advances, per the
spec's "Maintenance" section. `--check` is the CI drift detector.

Usage:
  bin/loco-msrv-set --msrv 1.96 <slug>...        # named forms
  bin/loco-msrv-set --msrv 1.96 --all            # every form's Loco crate
  bin/loco-msrv-set --msrv 1.96 --dry-run --all  # show what would change
  bin/loco-msrv-set --msrv 1.96 --check --all    # CI drift check (non-zero on drift)
```

<h2 id="loco-rs-1-migration"><code>bin/loco-rs-1-migration</code></h2>

```text
bin/loco-rs-1-migration — one-shot loco-rs 0.16 -> 1.0.1 major-version
migration for every form's `back-end-with-loco/` crate.

loco-rs 1.0.1 (2026-07-31) is the framework's first stable release, bumping
`sea-orm` 1.1 -> 2.0 along the way. Two changes hit every crate in this
monorepo mechanically:

  1. Feature-flag rename: `auth_jwt` -> `auth`, and the Postgres-only
     background-queue feature `bg_pg` -> the now-backend-agnostic `worker`
     (queue backend selection moved to the `config/*.yaml` `queue.kind:`
     value, already `Postgres` in every crate — no YAML change needed).
  2. `ColType::PkAuto` (used for every table's `id` column, and for every
     `:references` foreign-key column, across all 348 crates — this repo
     has never used `ColType::PkUuid`) now renders `BIGINT`/`BIGSERIAL`
     instead of `INTEGER`/`SERIAL` (loco-rs 1.0 changelog: "Generated
     primary/foreign keys are now 64-bit"). The generated migration SQL
     changes the moment the crate recompiles against loco-rs 1.0's
     `schema.rs`, even though no migration *source* line changed - so every
     entity's `id`/`*_id` field, and every controller Param/Path/`load_item`
     that carries one, must move `i32` -> `i64` to match.

Confirmed by hand on the reference crate
(forms/pre-operative-assessment-by-clinician/back-end-with-loco): after these
edits, `cargo build --all-targets`, `cargo test`, and `cargo clippy` are all
clean with zero migration-related errors. No other 0.16 -> 1.0 breaking change
(raw `Statement` calls, manual `AppContext` construction, `PageResponse`,
`Worker::perform_later`, `JWT::algorithm`, `Queue::None`) appears anywhere in
this monorepo's Loco crates (grepped fleet-wide before writing this tool).

What it rewrites, per crate:

  Cargo.toml
    loco-rs version 0.16 -> 1.0.1; feature list auth_jwt,bg_pg,... ->
    auth,...,worker (alphabetical, matching existing style); sea-orm version
    1.1 -> 2.0.
  migration/Cargo.toml
    sea-orm-migration version -> 2.0.
  src/**/*.rs (entities, controllers, and any hand-written module)
    Any `(id|*_id): i32` / `(id|*_id): Option<i32>` -> i64 / Option<i64>;
    any `Path<i32>` -> `Path<i64>`. Matched by identifier shape (bare `id`
    or `*_id`), not by file location, since one form
    (inpatient-clinical-note) carries a hand-written grading module with the
    same pattern outside controllers/_entities.

Cargo.lock is deliberately NOT regenerated by this tool (that needs `cargo
update`, which hits the network per crate) — run `cargo update` in each
touched crate afterwards, or see bin/loco-rs-1-migration's companion fleet
sweep in AGENTS/back-end-with-loco.md.

This is a one-shot migration tool (like bin/migrate-sql-filenames.py), not an
ongoing convention to re-enforce: once every crate is on loco-rs 1.0.1,
--check has nothing left to find and this tool has no more work to do.

Usage:
  bin/loco-rs-1-migration <slug>...        # named forms
  bin/loco-rs-1-migration --all            # every form's Loco crate
  bin/loco-rs-1-migration --dry-run --all  # show what would change
  bin/loco-rs-1-migration --check --all    # CI drift check (non-zero on drift)
```

<h2 id="loco-seed-base-rename"><code>bin/loco-seed-base-rename</code></h2>

```text
bin/loco-seed-base-rename — rename the unused `base` param in every
crate's `App::seed()` to `_base`.

`loco new` scaffolds `async fn seed(ctx: &AppContext, base: &Path)` in
src/<slug>/app.rs and never uses `base` in the body (fixtures load via
`env!("CARGO_MANIFEST_DIR")` instead) — so `cargo clippy --all-targets --
-D warnings` fails every crate that still carries the bare name, which is
346 of 355. This is a genuine, fleet-wide CI-breaking bug: the CI Rust job
has never gone green on this repository (checked against its run history).
`register_tasks` right above `seed` gets `#[allow(unused_variables)]` from
the same scaffold template for the identical reason; `seed`'s parameter is
simply renamed instead, matching the 9 crates that were already correct
(6 hand-authored with `_ctx, _base`; 3 fixed ad hoc during earlier pedantic
cleanup).

Confirmed fleet-wide before writing this tool: `base` appears exactly once
per file (the parameter declaration itself), so the rename is unconditionally
safe — nothing else in `app.rs` references it.

This is an ongoing convention, not a one-shot migration: `loco new` re-creates
the same bare `base` on every newly scaffolded crate, so the generated
`back-end-with-loco-setup` script calls this tool as a final step (after
`bin/loco-forbid-unsafe`); `--check` is the CI drift detector that catches a
crate which skipped it.

Usage:
  bin/loco-seed-base-rename <slug>...        # named forms
  bin/loco-seed-base-rename --all            # every form's Loco crate
  bin/loco-seed-base-rename --dry-run --all  # show what would change
  bin/loco-seed-base-rename --check --all    # CI drift check (non-zero on drift)
```

<h2 id="loco-seed-base-stray-usage-fix"><code>bin/loco-seed-base-stray-usage-fix</code></h2>

```text
bin/loco-seed-base-stray-usage-fix — remove the stray `let _ = base;`
line left behind in `App::seed()` after the route-nesting-layout move.

When each form's fixtures moved from a caller-supplied `base` path to
`src/<form_snake_case>/fixtures/` (resolved via `env!("CARGO_MANIFEST_DIR")`
instead — see the route-layout convention in AGENTS.md), 11 forms' hand-
edited `seed()` picked up an explanatory comment plus a `let _ = base;`
line to silence the then-unused `base` parameter. `bin/loco-seed-base-
rename` later renamed that same parameter to `_base` fleet-wide (the
`_`-prefix convention already silences the warning on its own), but its
mechanical sed-style rename touched only the parameter's declaration,
not this stray body reference — so these 11 files were left with a
`let _ = base;` referring to a binding that no longer exists, a hard
compile error (E0425 `cannot find value 'base' in this scope`), not a
lint. Found via a real, verified CI run: Rust CI shard 5/8 failed
compiling `dietic_assessment` on exactly this error.

The `_base` parameter itself is untouched (still intentionally unused,
still correctly prefixed) — only the now-invalid `let _ = base;` line is
removed; the explanatory comment above it, where present, stays.

This is a one-shot fix, not an ongoing convention: no scaffold or other
generator produces this stray line, so `--check` exists purely as a
completeness/regression gate, not a routine CI drift detector.

Usage:
  bin/loco-seed-base-stray-usage-fix <slug>...        # named forms
  bin/loco-seed-base-stray-usage-fix --all             # every form's Loco crate
  bin/loco-seed-base-stray-usage-fix --dry-run --all   # show what would change
  bin/loco-seed-base-stray-usage-fix --check --all     # drift check (non-zero on drift)
```

<h2 id="loco-test-auth-header-fix"><code>bin/loco-test-auth-header-fix</code></h2>

```text
bin/loco-test-auth-header-fix — drop the redundant `&` in every crate's
test `auth_header()` helper.

`loco new` scaffolds `tests/requests/prepare_data.rs` with
`HeaderValue::from_str(&format!("Bearer {}", &token))` — the `&token` is
redundant (`token: &str` is already a reference) and
`clippy::useless_borrows_in_formatting` fails every crate that still
carries it under `-D warnings`. Confirmed fleet-wide before writing this
tool: `&token` appears exactly once per file, so the fix is unconditionally
safe.

Discovered alongside bin/loco-seed-base-rename while diagnosing why CI's
Rust job has never gone green on this repository: both are `loco new`
scaffold boilerplate, never touched by any of our generators, so the bug
is identical and invariant across the fleet.

This is an ongoing convention, not a one-shot migration: `loco new`
re-creates the same redundant `&token` on every newly scaffolded crate, so
the generated `back-end-with-loco-setup` script calls this tool as a final
step; `--check` is the CI drift detector.

Usage:
  bin/loco-test-auth-header-fix <slug>...        # named forms
  bin/loco-test-auth-header-fix --all            # every form's Loco crate
  bin/loco-test-auth-header-fix --dry-run --all  # show what would change
  bin/loco-test-auth-header-fix --check --all    # CI drift check (non-zero on drift)
```

<h2 id="loco-test-max-connections-fix"><code>bin/loco-test-max-connections-fix</code></h2>

```text
bin/loco-test-max-connections-fix — raise the scaffold's `max_connections: 1`
default in every crate's config/test.yaml.

`cargo loco generate scaffold` writes `max_connections:
{{ get_env(name="DB_MAX_CONNECTIONS", default="1") }}` fleet-wide — a pool
that admits exactly one connection at a time, paired with a 500ms
`connect_timeout`. `cargo test` runs its test binary's tests concurrently
across CPU threads by default; the moment two DB-touching tests in the same
crate happen to run at once, the second blocks behind the first's single
connection and times out if it takes longer than 500ms, surfacing as
`SqlxError(PoolTimedOut)`. Found via a real, verified CI run: the nightly
full-matrix sweep's Rust shard 3/8 failed exactly this way on
`hearing-test-request` — 33 of its 35 tests passed; the 2 that lost the race
for the single connection did not. This is not simple flakiness with no
cause: it is a race with a deterministic mechanism, just an intermittent
outcome, so it can resurface on any crate, not only this one.

Raises the default to 10 — comfortable headroom for a CI runner's handful of
parallel test threads against a single-purpose, freshly created database,
well inside PostgreSQL's own default server-side `max_connections` of 100.
Scoped to config/test.yaml only: this is specifically about `cargo test`'s
concurrency, and the fleet's `config/development.yaml` carries the same
scaffold default but isn't implicated in the observed failure.

5 forms (the hand-authored gold-standard reference pair cardiology-
request/-response and the neurodiversity-adjustment-request/-response/
-review trio) predate the `get_env(...)`-templated scaffold and carry a
bare `max_connections: 1` instead — same bug, different literal shape.
Handled as a second, narrower replacement.

This is an ongoing convention, not a one-shot migration: a newly scaffolded
crate inherits the same low default from whatever `cargo loco generate
scaffold` version produced it, so `--check` is the CI drift detector.

Usage:
  bin/loco-test-max-connections-fix <slug>...        # named forms
  bin/loco-test-max-connections-fix --all             # every form's Loco crate
  bin/loco-test-max-connections-fix --dry-run --all   # show what would change
  bin/loco-test-max-connections-fix --check --all     # CI drift check (non-zero on drift)
```

<h2 id="make-github-pages"><code>bin/make-github-pages</code></h2>

```text
bin/make-github-pages — publish formexamples.github.io/, per
 spec/monorepo-github-pages/. Delegate of `make github-pages`.

 This monorepo's GitHub Pages subproject (formexamples.github.io/) is
 maintained here, in-tree, like any other subproject. It is PUBLISHED by
 exporting its tree via `git subtree push` into the sibling, top-level,
 read-only repo github.com/FormExamples/formexamples.github.io — the
 GitHub-convention <org>.github.io repo, which GitHub auto-serves at the
 domain root (unlike a project repo's Pages, which nests under
 /<repo-name>/). The spec's own directive: never work directly in the
 sibling; always re-publish it from here via this tool.

 formexamples.github.io/.github/workflows/deploy.yml is inert in the
 monorepo (GitHub only reads .github/workflows/ at a repo's root) but
 becomes the sibling repo's real, root-level deploy workflow once
 exported — so the sibling repo builds and deploys itself on every push
 this tool makes to it, no separate setup needed there.

 Usage:
   bin/make-github-pages              # export + push (same as `make github-pages`)
   bin/make-github-pages --dry-run    # split only, don't push
```

<h2 id="migrate-sql-filenamespy"><code>bin/migrate-sql-filenames.py</code></h2>

```text
Full forward migration of every form's sql/ to the canonical
filename convention used by bin/test-form.

Canonical filename layout per form:

    00_create_extensions.sql                        -- CREATE EXTENSION pgcrypto
    01_create_function_set_updated_at.sql    -- trigger function
    02_create_table_patient.sql              -- canonical patient
    03_create_table_clinician.sql            -- canonical clinician
    04_create_table_<slug>.sql               -- per-form main assessment
    05_create_table_grade.sql
    06_create_table_grading_fired_rule.sql
    07_create_table_grading_additional_flag.sql
    (and any additional CREATE TABLE statements renumbered sequentially)

Actions per form:

- Overwrite the four canonical files with corrected content (the existing
  copies distributed across all 114 forms contain known syntax errors:
  the patient file is missing a comma, has a duplicate UPDATE comment, and
  a COMMENT refers to a renamed column; the clinician file has a trailing
  comma before `)` and references a non-existent `clinician_role` in its
  CHECK constraint).
- Delete the legacy `01_patient.sql` (conflicts numerically and
  semantically with the canonical `02_create_table_patient.sql`).
- Rename every remaining legacy `NN_<name>.sql` file that has a
  `CREATE TABLE` inside to `MM_create_table_<table>.sql`, where MM is
  sequential starting at 04, preserving the file order.
- Add the `.sql` extension to any `NN_create_table_*` files that are
  missing it.
- If `04_main.sql` exists (a consolidated copy of an older schema-flat.sql
  containing duplicated patient + assessment + grading blocks), split it
  on its `-- === <filename> === --` section markers, keep only the
  assessment + assessment_<section> blocks as individual per-table files,
  and discard the duplicated extensions / patient / grading blocks. Then
  delete `04_main.sql` and continue with the normal rename pass.

Idempotent. Safe to re-run.
```

<h2 id="node-current-version-set"><code>bin/node-current-version-set</code></h2>

```text
bin/node-current-version-set — apply spec/node-current-version/ fleet-wide.

The spec is a small, generic per-project checklist (deliberately phrased as
"if file X exists, then...", never "create X"): every existing package.json
gets an `engines.node` pin, every existing `.npmrc` gets `engine-strict=true`
so the pin can't silently become a no-op, every existing GitHub Actions
workflow's `node-version:` gets bumped, and any `.nvmrc`/`.tool-versions`
(none exist in this repo yet) would get the exact locally-installed patch
version. Nothing is ever created that doesn't already exist — that is the
spec's own scope, not an oversight.

This repo has no single Node project: there are 358 package.json files
(355 forms' front-end-with-svelte, one stray front-end-with-html, plus
e2e/ and formexamples.github.io/), so this scans the whole tree via
`git ls-files` rather than the forms/<slug> --all|<slug> pattern most bin/
tools use — there is no meaningful "one form" scope for a repo-wide
toolchain-version policy.

The target version is read from spec/node-current-version/index.md's
"Node current version is N." line, not hardcoded here, so re-running this
after the spec is bumped (mirroring bin/loco-msrv-set's pattern for Rust)
needs no code change.

Usage:
  bin/node-current-version-set              # apply fleet-wide
  bin/node-current-version-set --dry-run     # show what would change
  bin/node-current-version-set --check       # CI drift check (non-zero on drift)
```

<h2 id="normalize"><code>bin/normalize</code></h2>

_No header documentation._

<h2 id="page-header-layout-refactor"><code>bin/page-header-layout-refactor</code></h2>

```text
bin/page-header-layout-refactor -- re-layout each HTML front-end's
page header so the title sits on the left and the nav link(s) + locale/theme
select controls sit on the right, instead of the controls row stacked above
the title.

What changes per form (front-end-with-html/):
  index.html, dashboard.html:
    Before:
      <div class="page-header-inner">
      <div class="page-header-controls no-print">
        ...locale-select / theme-select...
      </div>
        <h1>Title</h1>
        <p class="subtitle">Description</p>
        <p class="subtitle"><a href="...">Nav link -></a></p>   [optional]

    After:
      <div class="page-header-inner">
        <div class="page-header-bar">
          <div class="page-header-title">
            <h1>Title</h1>
            <p class="subtitle">Description</p>
          </div>
          <div class="page-header-controls no-print">
            <p class="subtitle page-header-link"><a href="...">Nav link -></a></p>   [optional]
            ...locale-select / theme-select...
          </div>
        </div>

    Whatever follows (progress/step-list on index.html; nothing on
    dashboard.html) is left untouched.

  css/style.css, css/dashboard.css:
    Appends a `.page-header-bar` / `.page-header-title` / `.page-header-link`
    rule block once, if not already present.

Only touches forms whose header matches the standard shape (exactly one
<h1>, exactly one plain <p class="subtitle">, at most one link
<p class="subtitle"><a ...>). Forms with a bespoke header (no
`<header class="page-header">`, e.g. the privacy-notice / tracker pages
predating the wizard template) are skipped and reported for hand migration.

Usage:
  bin/page-header-layout-refactor --check   # CI drift check (no writes)
  bin/page-header-layout-refactor --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="route-loco-layout"><code>bin/route-loco-layout</code></h2>

```text
route-loco-layout <slug> : move a form's Loco crate source into the
 route layout  back-end-with-loco/src/<form_snake_case>/*.rs
   - flat   (src/*.rs)            -> src/<snake>/*.rs
   - nested (<snake>/src/*.rs +   -> src/<snake>/*.rs, crate files hoisted
             top-level symlinks)     to back-end-with-loco/
 Idempotent: skips if src/<snake>/lib.rs already exists.
```

<h2 id="route-svelte-layout"><code>bin/route-svelte-layout</code></h2>

```text
route-svelte-layout <slug> : nest a form's SvelteKit routes under
 front-end-with-svelte/src/routes/<form-kebab-case>/  and prefix internal
 absolute route links (href / goto / redirect, plus the "/" home link) with
 /<slug>. /api/ fetch paths are left untouched. Idempotent (skips if routed).
```

<h2 id="svelte-date-time-picker-vendor"><code>bin/svelte-date-time-picker-vendor</code></h2>

```text
bin/svelte-date-time-picker-vendor -- vendor DateTimePicker.svelte, the
fifth Lily Svelte helper, into every form's
front-end-with-svelte/src/lib/components/ui/, matching how the other four
helpers (ThemePicker, LocalePicker, TextSizePicker, SharePicker) are already
vendored there.

Deliberately vendor-only: this does NOT wire DateTimePicker into any
+layout.svelte, route, or step component, and does NOT touch any existing
DateInput.svelte usage. date-time-picker's own spec explicitly documents
that a hand-rolled calendar dialog has weaker assistive-technology support
than the native <input type="date"> that DateInput.svelte already wraps
("the right default for many services") -- swapping every form's date
fields for the dialog is a real accessibility tradeoff, not a pure
upgrade, and is a separate, unstarted decision. This tool only makes the
component available for a form to opt into later, exactly as the Svelte
canonical's own docs frame it as a form-value control, not a page-header
control -- there is nothing to place it into by default.

Usage:
  bin/svelte-date-time-picker-vendor --check   # CI drift check (no writes)
  bin/svelte-date-time-picker-vendor --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="svelte-helpers-chooser-rename"><code>bin/svelte-helpers-chooser-rename</code></h2>

```text
bin/svelte-helpers-chooser-rename -- rename the four Lily Svelte helper
controls from their old *-select / share-button names to their new
*-chooser names, matching the upstream rename
(lily-design-system-svelte-helpers commit "Rename the helpers from
*-select / *-button to *-chooser").

  ThemeSelect.svelte     -> ThemeChooser.svelte     (.theme-chooser*, no more lily- prefix)
  LocaleSelect.svelte    -> LocaleChooser.svelte    (.locale-chooser*, no more lily- prefix)
  TextSizeSelect.svelte  -> TextSizeChooser.svelte  (.text-size-chooser*)
  ShareButton.svelte     -> ShareChooser.svelte     (.share-chooser*; share-button-trigger
                                                      -> share-chooser-button, dropping the
                                                      old share-button naming exception)

Reads the fresh component source directly from the pinned upstream checkout
(~/git/lilydesignsystem/lily-design-system/lily-design-system-svelte-helpers/)
at --apply time, the same way bin/lily-svelte-sync does for the unrelated
svelte-headless family, converting its 4-space indent to this repo's tab
convention.

What changes per form (front-end-with-svelte/):
  - src/lib/components/ui/{Old}.svelte  -> deleted
  - src/lib/components/ui/{New}Chooser.svelte -> new (fresh vendored copy)
  - src/app.css -> renames the old class family to the new one (regex,
    in place -- keeps whatever else is around it)
  - src/routes/<slug>/+layout.svelte -> renames the import + component tag
    (props are unchanged -- none of them said "select" literally)

Usage:
  bin/svelte-helpers-chooser-rename --check   # CI drift check (no writes)
  bin/svelte-helpers-chooser-rename --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="svelte-helpers-picker-rename"><code>bin/svelte-helpers-picker-rename</code></h2>

```text
bin/svelte-helpers-picker-rename -- rename the four Lily Svelte helper
controls from their current *-chooser names to their new *-picker names,
matching the upstream rename (lily-design-system-svelte-helpers commit
"Rename *-chooser to *-picker to harmonize with Adobe").

  ThemeChooser.svelte    -> ThemePicker.svelte    (.theme-chooser*    -> .theme-picker*)
  LocaleChooser.svelte   -> LocalePicker.svelte   (.locale-chooser*   -> .locale-picker*)
  TextSizeChooser.svelte -> TextSizePicker.svelte (.text-size-chooser* -> .text-size-picker*)
  ShareChooser.svelte    -> SharePicker.svelte    (.share-chooser*    -> .share-picker*)

Reads the fresh component source directly from the pinned upstream checkout
(~/git/lilydesignsystem/lily-design-system/lily-design-system-svelte-helpers/)
at --apply time, the same way bin/lily-svelte-sync does for the unrelated
svelte-headless family, converting its 4-space indent to this repo's tab
convention.

What changes per form (front-end-with-svelte/):
  - src/lib/components/ui/{Old}.svelte  -> deleted
  - src/lib/components/ui/{New}.svelte  -> new (fresh vendored copy)
  - src/app.css -> renames the old class family to the new one (regex,
    in place -- keeps whatever else is around it)
  - src/routes/<slug>/+layout.svelte -> renames the import + component tag
    (props are unchanged -- none of them said "chooser" literally)

Usage:
  bin/svelte-helpers-picker-rename --check   # CI drift check (no writes)
  bin/svelte-helpers-picker-rename --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="svelte-kit-3-theme-url-fixpy"><code>bin/svelte-kit-3-theme-url-fix.py</code></h2>

```text
bin/svelte-kit-3-theme-url-fix.py — one-shot fix for a bug the `sv migrate
sveltekit-3` codemod introduced fleet-wide in every `front-end-with-svelte`
root `+layout.svelte`.

Before the SvelteKit 3 migration (2026-08-15, "Update Svelte" commit), every
form's `+layout.svelte` built the Lily theme-catalogue URL by hand:

    import { base } from "$app/paths";
    ...
    themesUrl={`${base}/themes/`}

`sv migrate sveltekit-3` mechanically rewrote every occurrence to:

    import { resolve } from "$app/paths";
    ...
    themesUrl={resolve(`themes/`)}

which is wrong on two counts: (1) `resolve()` in SvelteKit 3 only accepts a
known route ID or pathname, not an arbitrary static-asset directory prefix,
and (2) even the asset-flavoured `asset()` function only accepts one of the
finite literal `static/themes/*.css` filenames it can see at build time, not
a directory prefix a component concatenates a runtime-selected theme slug
onto. Both fail `svelte-check` with a "not assignable" error on every single
form. `base`/`assets` are also no longer part of `$app/paths`'s public type
surface at the pinned `@sveltejs/kit: "next"` version, so reverting to the
pre-migration `${base}/themes/` form doesn't type-check either.

None of the 353 affected forms configures `kit.paths.base` (confirmed
fleet-wide before writing this tool), so `base` is always `''` and the
pre-migration expression always evaluated to the literal string
`/themes/` at runtime anyway. The fix hardcodes that literal, which
type-checks cleanly and is behaviourally identical to the pre-migration code:

    themesUrl="/themes/"

and drops the now-unused `import { resolve } from "$app/paths";` line (every
affected file uses `resolve(` exactly once, for this expression, confirmed
before writing this tool).

It also deletes each form's `front-end-with-svelte/MIGRATION_TASKS.md` —
the `sv migrate` codemod's own per-form task list — once confirmed resolved
(see the reference fix on `forms/blood-test-result/front-end-with-svelte`).

Usage:
  bin/svelte-kit-3-theme-url-fix.py --check          # CI drift detector
  bin/svelte-kit-3-theme-url-fix.py --apply          # rewrite in place
```

<h2 id="svelte-locale-select-refactor"><code>bin/svelte-locale-select-refactor</code></h2>

```text
bin/svelte-locale-select-refactor — add a hand-authored LocaleSelect
control (Lily headless mirror, before ThemeSelect) to every form's
`front-end-with-svelte/` root layout.

Lily is consumed as a contract, not a runtime dependency (see
forms/AGENTS-front-end-svelte.md §2), so this mirrors the ThemeSelect
convention exactly: a local LocaleSelect.svelte/LocaleSelectOption.svelte
pair reusing the `theme-select`/`theme-select-option` Lily classes, plus a
`src/lib/config/locales.ts` with a fixed four-locale catalogue (en-GB,
en-US, cy-GB, de-DE). Presentation-only: it sets `<html lang>` and
persists the choice, matching the front-end-with-svelte theme mirror
effect. No message catalogue is wired up — see docs/i18n.md for the
deferred full-i18n rollout.

Usage:
  bin/svelte-locale-select-refactor --check   # CI drift check (no writes)
  bin/svelte-locale-select-refactor --apply   # write changes

Skips forms whose root layout has no ThemeSelect anchor yet (the
`*-test-result` family predates the Lily theming rollout) and forms that
already have a LocaleSelect (the medical-language-speaking-assessment-
for-cymraeg i18n pilot, which ships its own translated LocaleSelect).

Idempotent: re-running on an already-refactored form makes no further
changes.
```

<h2 id="svelte-pnpm-workspace-fix"><code>bin/svelte-pnpm-workspace-fix</code></h2>

```text
bin/svelte-pnpm-workspace-fix — fix every form's
`front-end-with-svelte/pnpm-workspace.yaml`.

Two bugs, found diagnosing CI's Svelte matrix (which had never gone green):

  1. Every one of the 355 files was missing a `packages:` key. pnpm 9 (what
     `pnpm/action-setup` pins in CI) rejects a `pnpm-workspace.yaml` with no
     `packages:` field outright — `ERROR packages field missing or empty` —
     and refuses to install anything. The local pnpm 11 on the maintainer's
     machine tolerates the omission, which is why this went unnoticed:
     reproduced fleet-wide with a real pnpm 9 binary before writing this
     tool. Every front-end is a single, standalone package (never an actual
     multi-package pnpm workspace), so `packages: ['.']`  is the correct,
     minimal fix — not a null workaround.
  2. `allowBuilds.esbuild` — approval for esbuild's postinstall binary
     fetch — is `true` in 321/355 files but a stray unfilled template
     string (`"set this to true or false"`) in 32 and `false` in 1.
     Confirmed this does NOT itself break `pnpm install` (only the missing
     `packages:` key does), but it is dead-wrong data left over from
     whatever produced it originally. Normalized to `true`, matching the
     fleet majority and the sensible default (esbuild's script only fetches
     its own platform binary; nothing to gate).

This is an ongoing convention, not a one-shot migration: a newly scaffolded
form's `pnpm-workspace.yaml` needs the same fix, so `--check` is the CI
drift detector.

Usage:
  bin/svelte-pnpm-workspace-fix <slug>...        # named forms
  bin/svelte-pnpm-workspace-fix --all            # every form's Svelte front-end
  bin/svelte-pnpm-workspace-fix --dry-run --all  # show what would change
  bin/svelte-pnpm-workspace-fix --check --all    # CI drift check (non-zero on drift)
```

<h2 id="svelte-share-button-refactor"><code>bin/svelte-share-button-refactor</code></h2>

```text
bin/svelte-share-button-refactor -- add a fourth header control,
ShareButton, to every form's Svelte front-end, alongside
LocaleSelect/ThemeSelect/TextSizeSelect.

Mirrors lily-design-system-svelte-helpers/lily-design-system-svelte-share-button:
a single-glyph icon button (U+21AA RIGHTWARDS ARROW WITH HOOK, "↪") that opens
the native OS share sheet where available, and otherwise a small list —
here, just "Copy link" to the clipboard.

Editorial choice for this monorepo: `targets` stays empty. This package
ships no social-network URLs on purpose (see its own docs: "which networks
belong in your product is an editorial and privacy decision"), and a
341-form medical/clinical monorepo covering everything from patient-data
wizards to public calculators has no single defensible answer, so
copy-link is the only destination offered everywhere.

What changes per form (front-end-with-svelte/):
  - src/lib/components/ui/ShareButton.svelte -> new (vendored contract
    copy of lily-design-system-svelte-share-button; no app-specific logic)
  - src/app.css -> appends the `.share-button` baseline CSS once
  - src/routes/<slug>/+layout.svelte -> imports ShareButton, renders
    <ShareButton .../> immediately after <TextSizeSelect .../> in the
    header controls row

Usage:
  bin/svelte-share-button-refactor --check   # CI drift check (no writes)
  bin/svelte-share-button-refactor --apply   # write changes

Only touches forms whose +layout.svelte ends its <TextSizeSelect> invocation
with the standard `storageKey={TEXT_SIZE_STORAGE_KEY}` / `/>` shape produced
by bin/svelte-text-size-select-refactor. Forms without it are skipped and
reported for hand migration.

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="svelte-test-result-theming-backport"><code>bin/svelte-test-result-theming-backport</code></h2>

```text
bin/svelte-test-result-theming-backport — backport the gold-standard
Lily theme system to the `*-test-result` family's `front-end-with-svelte/`,
which predates the theming rollout (plain hardcoded Tailwind tokens, no
`static/themes/`, no `ThemeSelect`).

One-shot, narrowly scoped migration for exactly the 37 forms whose root
layout still has the legacy `bg-gray-50` nav shell (verified byte-identical
across all 37 before writing this). For each form:

  1. Replaces app.css's `@theme` + first `:root` block (hardcoded hex
     tokens) with the gold-standard oklch Lily token set + alias block —
     the same mapping used everywhere else in the repo (see
     bin/html-theme-locale-select-refactor). The rest of app.css (component
     CSS) is untouched.
  2. Vendors `static/themes/*.css` from the pinned Lily checkout.
  3. Adds `ThemeSelect.svelte` / `ThemeSelectOption.svelte` (byte-identical
     to every other form) and `src/lib/config/themes.ts`.
  4. Re-skins the nav shell (`bg-gray-50` → `bg-base-200 text-base-content`,
     etc.) and adds the theme state/effect + swappable `<link>` + a
     `ThemeSelect` control — bringing the layout to the exact gold-standard
     shape so `bin/svelte-locale-select-refactor` picks it up afterwards.

Usage:
  bin/svelte-test-result-theming-backport --check   # CI drift check (no writes)
  bin/svelte-test-result-theming-backport --apply   # write changes
  bin/svelte-test-result-theming-backport --lily-dir PATH --apply

Idempotent: re-running on an already-migrated form makes no further changes.
Run `bin/svelte-locale-select-refactor --apply` afterwards to add LocaleSelect.
```

<h2 id="svelte-text-size-select-refactor"><code>bin/svelte-text-size-select-refactor</code></h2>

```text
bin/svelte-text-size-select-refactor -- add the Lily
lily-design-system-svelte-text-size-select headless control (a third
header switcher, alongside LocaleSelect/ThemeSelect) to every form's
Svelte front-end.

What changes per form (front-end-with-svelte/):
  - src/lib/components/ui/TextSizeSelect.svelte  -> new (vendored contract
    copy of lily-design-system-svelte-text-size-select; no app-specific
    logic, byte-identical across forms)
  - src/lib/config/text-sizes.ts -> new (TEXT_SIZE_OPTIONS, DEFAULT_TEXT_SIZE,
    TEXT_SIZE_STORAGE_KEY, storage key namespaced per form slug)
  - src/app.css -> appends the `:root[data-text-size="..."]` font-size
    mapping and `.text-size-select` baseline CSS once (headless: no default
    styling otherwise; no `lily-` prefix needed since the vendored theme
    catalogue in static/themes/*.css does not define this class, unlike
    theme-select/locale-select)
  - src/routes/<slug>/+layout.svelte -> imports TextSizeSelect + the new
    config, derives textSizeValues/textSizeLabels alongside the existing
    themeValues/localeValues, and renders <TextSizeSelect .../> immediately
    after <ThemeSelect .../> in the header controls row

Usage:
  bin/svelte-text-size-select-refactor --check   # CI drift check (no writes)
  bin/svelte-text-size-select-refactor --apply   # write changes

Only touches forms whose +layout.svelte ends its <ThemeSelect> invocation
with the standard `storageKey={THEME_STORAGE_KEY}` / `/>` shape produced by
the theme/locale-select rollout. Forms with a bespoke header (currently
medical-language-speaking-assessment-for-cymraeg, which drives LocaleSelect
from its own i18n store) are skipped and reported for hand migration.

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="svelte-theme-css-sync"><code>bin/svelte-theme-css-sync</code></h2>

```text
bin/svelte-theme-css-sync -- re-sync the 45 Lily reference theme
stylesheets vendored into every form's front-end-with-svelte/static/themes/
from the pinned Lily checkout (~/git/lilydesignsystem/lily-design-system/themes/).

front-end-with-svelte/static/themes/ was originally populated once by
bin/lily-svelte-theme-locale-select-refactor (a one-shot migration, now
superseded, that never had an ongoing re-sync path). This tool is the
recurring drift detector/fixer for that vendored copy on its own -- it does
not touch ThemeChooser.svelte/ThemePicker.svelte or any other part of that
one-shot migration.

Comparison is by file size only (matching bin/html-theme-locale-select-refactor's
copy_theme_css), which is enough to detect the kind of drift that matters
here: Lily adding/removing CSS rules (new helper glyph corrections, changed
tokens, etc.), not a same-length content edit.

Usage:
  bin/svelte-theme-css-sync --check   # CI drift check (no writes)
  bin/svelte-theme-css-sync --apply   # write changes

Idempotent: re-running after a full --apply makes no further changes.
```

<h2 id="svelte-vitest-app-env-alias-fix"><code>bin/svelte-vitest-app-env-alias-fix</code></h2>

```text
bin/svelte-vitest-app-env-alias-fix — fix the `$app/environment` vs
`$app/env` alias-key mismatch in hand-written `vitest.config.ts` files.

`@sveltejs/kit@3.0.0-next.23` (the fleet-standard pin) renamed the
`browser`/`dev`/`building`/`version` module from `$app/environment` to
`$app/env`, keeping `$app/environment` only as a deprecated runtime-only
compatibility shim (`export * from '../env/index.js'`, with a
dev-time `console.warn`) — it carries no ambient type declaration at all
in this prerelease, so `svelte-check` fails outright on any source file
that still imports it: "Cannot find module '$app/environment' or its
corresponding type declarations". Every form's actual source already
imports the correct, current `$app/env` (confirmed fleet-wide; `svelte-
check`, `vite build`, and `svelte-kit sync` all resolve it cleanly).

A handful of forms' reactive stores are also covered by plain Vitest
(not the full SvelteKit test integration, which has no virtual-module
runtime outside a real SvelteKit app), so their `vitest.config.ts` stubs
out the browser/dev/building/version exports via a `resolve.alias` entry
pointing at a local stub file. That alias key was written against the
pre-rename module path `'$app/environment'`, so it never matches what
the source code actually imports (`$app/env`) — Vite falls through to
try resolving the literal bare specifier `$app/env`, which does not
exist for plain Vitest (no SvelteKit plugin, no runtime), and fails with
`Cannot find module '$app/env'`. Fixed by renaming the alias key only;
the stub file path is untouched. Confirmed fleet-wide: exactly the
string `'$app/environment':` at the start of an alias entry, in 7 of the
332 forms whose `vitest.config.ts` stubs this module at all — the other
325 don't exercise `browser`/`dev`/etc. from a Vitest-covered file, so
they never needed the alias and are unaffected either way.

This is an ongoing convention, not a one-shot migration: a newly
authored Vitest suite that stubs `$app/environment` for its store tests
would reintroduce the same mismatch, so `--check` is the CI drift
detector.

Usage:
  bin/svelte-vitest-app-env-alias-fix <slug>...        # named forms
  bin/svelte-vitest-app-env-alias-fix --all            # every form with a vitest.config.ts
  bin/svelte-vitest-app-env-alias-fix --dry-run --all  # show what would change
  bin/svelte-vitest-app-env-alias-fix --check --all    # CI drift check (non-zero on drift)
```

<h2 id="sync-from-skel-to-forms"><code>bin/sync-from-skel-to-forms</code></h2>

_No header documentation._

<h2 id="test"><code>bin/test</code></h2>

```text
https://github.com/sixarm/unix-shell-script-kit
```

<h2 id="test-e2e"><code>bin/test-e2e</code></h2>

```text
bin/test-e2e — run the Playwright smoke + accessibility sweep over form
 front-ends. The HTML harness drives every form's single-page wizard from a
 static server; the Svelte harness builds and previews each app, then checks
 its welcome route.

 Usage:
   bin/test-e2e [--html] [--svelte] [--all | <slug> ...]

   --html      run the HTML front-end sweep (default if neither flag given)
   --svelte    run the SvelteKit front-end sweep (build + preview per form)
   --all       every form (default when no slugs are listed)
   <slug> ...  restrict to the named forms

 Requires e2e/ deps installed (cd e2e && npm ci) and browsers
 (cd e2e && npx playwright install chromium).
```

<h2 id="test-engines"><code>bin/test-engines</code></h2>

_No header documentation._

<h2 id="test-examples-conformance"><code>bin/test-examples-conformance</code></h2>

```text
bin/test-examples-conformance — check example fixtures against SQL schema.

Each form's examples/assessment.json is an entity-keyed, camelCase filled-form
fixture. Its shape must track the form's sql/ migrations (the source of truth):
every top-level key must name a real table, and every property must name a real
column of that table. This gate catches fixtures that drift after a schema
change — a renamed column, a dropped table, a typo'd property.

Name matching is separator-insensitive: a JSON key and a SQL identifier match
when they are equal after lowercasing and removing underscores. This tolerates
the ambiguous digit boundaries in legacy identifiers (countryAsIso31661Alpha2
<-> country_as_iso_3166_1_alpha_2) without a brittle camel<->snake round-trip.

A light type check also flags a numeric column holding a boolean value, or a
boolean column holding a number — hard mismatches that indicate real drift.

Usage:
  bin/test-examples-conformance            # every form
  bin/test-examples-conformance <slug> ... # only the named forms

Exit status is non-zero if any fixture does not conform, with one line per
problem.
```

<h2 id="test-form"><code>bin/test-form</code></h2>

```text
test-form: test one form directory in this project for implementation

 Syntax:

     test-form <form-name-slug>

 Example:

     test-form pre-operative-assessment-by-clinician

 Structural checks print "Error: ..." lines and the script exits non-zero
 if any check failed. The Loco crate's `cargo test` is the only executable
 gate (it needs the Rust toolchain and a running Postgres).
```

<h2 id="test-loco-project"><code>bin/test-loco-project</code></h2>

```text
https://github.com/sixarm/unix-shell-script-kit
```

<h2 id="test-loco-routes"><code>bin/test-loco-routes</code></h2>

```text
bin/test-loco-routes — assert every Loco crate exposes its domain HTTP API.

 Each back-end-with-loco crate has a model per SQL table AND should register a
 scaffold controller per domain table, wired into app.rs routes() via
 `.add_route(controllers::<name>::routes())`. A crate whose routes() wires
 only `auth::routes()` (a single add_route) has a full data layer but exposes
 NO domain entities over HTTP — a real, easily-missed regression. This gate
 catches it: every crate must wire at least two routes (auth + >=1 domain).

 Usage: bin/test-loco-routes
 Exit non-zero listing any crate that wires only auth.
```

<h2 id="test-personas"><code>bin/test-personas</code></h2>

_No header documentation._

<h2 id="test-sql-apply"><code>bin/test-sql-apply</code></h2>

```text
test-sql-apply: apply each form's numbered SQL migrations, in filename
 order, to a fresh scratch PostgreSQL database. This is the gate that
 proves the sql/ directory is a working migration set (no missing
 extensions, no child-before-parent ordering, no duplicate CREATEs, no
 syntax errors) — not just files that look right.

 Syntax:

     test-sql-apply              # gate every form
     test-sql-apply <slug> ...   # gate only the named forms

 Environment:

     PGHOST (default localhost), PGPORT (default 5432),
     PGUSER (default loco) — connection for createdb/dropdb/psql.

 Exit status is non-zero if any form fails, with one line per failure
 naming the first file that errored and the first error line.
```

<h2 id="test-tools"><code>bin/test-tools</code></h2>

```text
bin/test-tools — exercise every Lily-system tool's --check / --counts /
 --help modes and confirm contract drift is zero across the corpus.

 A green run means:
   • every per-form Lily HTML conforms to the class contract,
   • every per-form Lily Svelte conforms to the canonical UI shape,
   • the Lily HTML + Svelte upstream snapshots match what is pinned,
   • every form has an up-to-date spec.md,
   • the conformance tracker reports 0 PARTIAL and 0 TODO.

 Usage: bin/test-tools

 Exits non-zero on first failing check.
```

<h2 id="test-tutorials"><code>bin/test-tutorials</code></h2>

```text
bin/test-tutorials — honest, fast doc-rot check for docs/tutorials/.

 What it does
 ------------
 For every `docs/tutorials/*.md` file it:
   1. extracts the fenced ```sh code blocks (only ```sh, not ```ts/```json/…);
   2. scans each line for `bin/...` and `forms/...` path tokens;
   3. asserts each referenced path is real:
        • bin/<tool>            — must exist; if it has no filename extension
                                  (a directly-invoked shell tool such as
                                  bin/create-form) it must also be executable.
                                  Scripts with an extension (bin/foo.py) are
                                  invoked via an interpreter (python3 foo.py),
                                  so only existence is required.
        • forms/<slug>/...      — must exist, UNLESS it is a disposable example
                                  the tutorial itself creates then deletes
                                  (any path matching forms/example-*), which is
                                  skipped.

 What it does NOT do
 -------------------
 It starts no servers, runs no builds, and executes none of the tutorial
 commands. It is a static reference check: it catches a tutorial pointing at a
 tool or form path that has been renamed or removed (doc rot). It is fast and
 deterministic.

 Usage: bin/test-tutorials
 Exit status: 0 if every referenced path resolves, 1 otherwise.
```

<h2 id="test-vendored-uniformity"><code>bin/test-vendored-uniformity</code></h2>

```text
bin/test-vendored-uniformity — verify vendored assets are byte-identical
across every form.

The fleet vendors several asset sets per form that must be identical
everywhere: the 45-stylesheet Lily theme catalogue in each front-end, and the
five Lily Svelte helper components plus their locales companion. The tools
that re-sync them (bin/svelte-theme-css-sync, bin/html-theme-locale-select-
refactor, bin/svelte-helpers-picker-rename) compare against the local Lily
checkout, which CI does not have — so this gate proves the CI-checkable half
of the same invariant: every form carries the SAME bytes as the rest of the
fleet. Upstream currency (fleet vs the pinned checkout) remains the
maintainer-run half, guarded locally by those tools' --check modes and
bin/lib/lily_pin.py.

Checked per form:
  front-end-with-svelte/static/themes/*.css           (all 355 identical)
  front-end-with-html/css/themes/*.css                (identical, except the
      four THEME_COLLISION_SLUGS forms, whose page content collides with
      theme selectors and which bin/html-theme-locale-select-refactor
      deliberately skips — they are exempted here for the same reason)
  front-end-with-svelte/src/lib/components/ui/{ThemePicker,LocalePicker,
      TextSizePicker,SharePicker,DateTimePicker}.svelte and locales.ts

The majority hash is the reference: any form whose copy differs from the
fleet majority is reported. Exit is non-zero on any outlier.

Usage:
  bin/test-vendored-uniformity            # check the whole fleet
  bin/test-vendored-uniformity --verbose  # list every checked set's hash
```

<h2 id="update"><code>bin/update</code></h2>

_No header documentation._

<h2 id="update-group-b-planspy"><code>bin/update-group-b-plans.py</code></h2>

```text
Update plan.md for the 11 Group B forms whose front-end-form-with-svelte
was just implemented. Replace stub status with accurate "implemented"
status for the SvelteKit patient form, and note the dashboard + Rust
backend remaining.
```

<h2 id="protobufgenerate-protobuf-representationspy"><code>bin/protobuf/generate-protobuf-representations.py</code></h2>

```text
Generate Protocol Buffers (.proto) representations from SQL migrations.

For each form's sql/ directory, parses CREATE TABLE statements
and writes one .proto file per top-level SQL entity into protobuf/.

Conventions documented in AGENTS/protobuf.md:
  - syntax = "proto3";
  - package form_examples.<form_slug_in_snake_case>;
  - PascalCase message name per table, snake_case fields, sequential field
    numbers starting at 1.
  - assessment_<section> child tables fold into the assessment.proto
    message (mirrors the FHIR R5 and XML generators).
  - SQL CHECK (... IN (...)) constraints become proto enums with a
    leading _UNSPECIFIED = 0 value.
```

<h2 id="openapigenerate-openapi-combinedpy"><code>bin/openapi/generate-openapi-combined.py</code></h2>

```text
bin/openapi/generate-openapi-combined.py — one combined OpenAPI spec per form.

The per-entity OpenAPI files (generate-openapi-representations.py) each describe
a single table. API consumers (Swagger UI, client codegen) want ONE document
per form, so this merges every `forms/<slug>/openapi/*.yaml` into a single
`forms/<slug>/openapi/openapi.yaml` — the union of their `paths` and
`components.schemas`, under a form-level `info` block. Paths and schema names do
not collide across a form's entities, so the union is unambiguous.

Generated artefact: do not hand-edit. Idempotent.

Usage:
  bin/openapi/generate-openapi-combined.py          # every form
  bin/openapi/generate-openapi-combined.py <slug>…  # only named forms
  bin/openapi/generate-openapi-combined.py --check  # exit non-zero if stale
```

<h2 id="openapigenerate-openapi-representationspy"><code>bin/openapi/generate-openapi-representations.py</code></h2>

```text
Generate OpenAPI 3.1 (.yaml) representations from SQL migrations.

For each form's sql/ directory, parses CREATE TABLE statements
plus COMMENT ON TABLE / COMMENT ON COLUMN, and writes one .yaml file per
top-level SQL entity into openapi/.

Conventions documented in AGENTS/openapi.md:
  - One .yaml per top-level table; assessment_<section> children fold
    into a single assessment.yaml (mirrors FHIR R5, XML, protobuf).
  - openapi: 3.1.0
  - info.title = "<Form Slug Titlecased> — <Resource>"
  - info.description = COMMENT ON TABLE (or the table name if absent)
  - Five operations per resource: GET list, POST create, GET by-id,
    PATCH update, DELETE.
  - Property descriptions sourced from COMMENT ON COLUMN.
  - required = NOT NULL columns except id.
  - CHECK (... IN (...)) constraints become string enums.
```

<h2 id="back-end-with-locogenerate-back-end-with-loco-setuppy"><code>bin/back-end-with-loco/generate-back-end-with-loco-setup.py</code></h2>

```text
Generate setup script for subprojects from SQL migration files.

For each form's sql/ directory, parses CREATE TABLE statements and
emits a `setup.sh` script containing:

- Create application databases for development, test, production (if not exists).
- Create Cargo Loco commands to generate scaffolds.

Tables are scaffolded in the same order as the form's sql/ 
so that FK targets already exist when referencing tables are created.

Loco field-type syntax:

- Types: string, text, int, bigint, float, double, bool, date, ts, uuid,
  json, jsonb, blob, references, references:<col>
- Suffix `!` marks NOT NULL, suffix `^` marks UNIQUE, no suffix means nullable.
- `id`, `created_at`, `updated_at` are added automatically by Loco and are
  therefore skipped here.
```

<h2 id="back-end-with-locogenerate-loco-agentspy"><code>bin/back-end-with-loco/generate-loco-agents.py</code></h2>

```text
bin/back-end-with-loco/generate-loco-agents.py — back-end AGENTS.md docs.

Regenerate a form's back-end-with-loco/AGENTS.md to describe the crate as it
actually is: a Loco JSON API with a RESTful scaffold controller per domain
table (the relational per-table design), nested under src/<snake>/.

Historically many of these docs described an obsolete design — a single
`assessments` table with a JSONB `data` column and an `/api/assessments`
controller. That design no longer exists; this generator replaces such stale
docs with an accurate description derived from the crate's real controllers.

Usage:
  bin/back-end-with-loco/generate-loco-agents.py <slug> ...   # named forms
  bin/back-end-with-loco/generate-loco-agents.py --stale       # every crate
                                                               # with stale docs
  bin/back-end-with-loco/generate-loco-agents.py --list-stale  # just list them
```

<h2 id="back-end-with-locogenerate-rust-docspy"><code>bin/back-end-with-loco/generate-rust-docs.py</code></h2>

```text
Insert rustdoc on undocumented `pub` items in the Loco back-end crates.

Idempotent: skips items that already carry a doc comment. Operates line-by-line
with brace/context tracking so struct fields and enum variants are distinguished
from top-level items, and so function bodies are never touched.
```

<h2 id="sqlgenerate-sql-combinedpy"><code>bin/sql/generate-sql-combined.py</code></h2>

```text
Combine each form's numbered SQL migrations into one sql/schema.sql file.

For each form with a `sql/` directory, concatenates every
`NN-*.sql` migration file (in numeric order) into a single `schema.sql`
file at `forms/<slug>/sql/schema.sql`. The combined file is
a convenience rollup of the whole schema suitable for one-shot apply in
development databases, editor inspection, or LLM context windows.

The generator only consumes files whose name begins with a digit; it
ignores `schema.sql` itself so re-running is idempotent.
```

<h2 id="sqlgenerate-sql-commentspy"><code>bin/sql/generate-sql-comments.py</code></h2>

```text
Add missing COMMENT ON TABLE and COMMENT ON COLUMN statements to every
numbered SQL migration file.

For each form's sql/NN-*.sql file, this generator:

- Parses every CREATE TABLE statement and its column definitions.
- Detects existing `COMMENT ON TABLE <name>` and
  `COMMENT ON COLUMN <table>.<column>` entries already present anywhere in
  the same file.
- Appends a `COMMENT ON TABLE` for every table that lacks one, and a
  `COMMENT ON COLUMN` for every column that lacks one, to the end of the
  file.
- Leaves existing comments untouched; re-running is idempotent.

Comment text is produced by a simple heuristic (well-known columns like
`id`, `created_at`, `updated_at`, FK columns, CHECK-constrained enum
columns) with a humanized column name as a fallback. The intent is
correctness-by-presence, not clinical precision; domain experts can later
edit individual comments where the heuristic is too generic.
```
