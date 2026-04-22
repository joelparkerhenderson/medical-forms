# Design: Fix `pre-operative-assessment-by-patient` documentation stubs

**Date:** 2026-04-22
**Scope:** documentation-only — no application code changes.

## Problem

`bin/test-form pre-operative-assessment-by-patient` fails with four "not yet
implemented" errors:

1. `front-end-form-with-html/AGENTS.md`
2. `front-end-form-with-html/plan.md`
3. `front-end-form-with-svelte/plan.md`
4. `full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md`

The application code in all three sub-projects is already fully implemented
(16-step SvelteKit wizard with ASA engine; single-page HTML + Alpine.js form
with a JavaScript ASA engine; Loco/axum Rust full-stack with SeaORM models,
Tera templates, HTMX, and a Rust-ported ASA engine). Only the sub-project
metadata files remain as stubs.

## Goal

Replace the four stub files with accurate descriptions of what is already
implemented, so that `bin/test-form` reports zero errors and the sub-projects
are self-describing.

## Non-goals

- No changes to any `.svelte`, `.ts`, `.js`, `.rs`, `.sql`, `.html`, or
  template file.
- No new features, tests, or clinical content.
- Not fixing the stray `#claude.md#` emacs backup file (out of scope; separate
  cleanup).

## Reference pattern

The fully-implemented sibling form
`forms/pre-operative-assessment-by-clinician/` contains equivalent files that
follow the monorepo convention. Each new file will:

- Mirror the structure of the sibling's equivalent file.
- Describe only the code that actually exists in this sub-project (verified
  by reading the source before writing the doc).
- Use the same clinical vocabulary and directory-map idiom already used
  elsewhere in the monorepo.

## Deliverables

### 1. `front-end-form-with-svelte/plan.md`

Short plan document describing:

- Current status: *Implemented.*
- Scoring engine: 42-rule ASA grader across 11 body systems plus 20+ safety
  flags. Engine file locations under `src/lib/engine/`.
- Front-end shape: 16 dynamic-route step components
  (`Step1Demographics`…`Step16Pregnancy`), shared UI library under
  `src/lib/components/ui/`, assessment runes store.
- Report generation: server endpoint `/report/pdf` via `pdfmake`.
- Tests: Vitest unit tests for the engine.
- Future enhancements (pulled from the parent-level `plan.md`).

### 2. `front-end-form-with-html/plan.md`

Short plan document describing:

- Current status: *Implemented.*
- Single-page architecture: `index.html` (776 lines) with Alpine.js state,
  JS ASA engine split across `asa-rules.js`, `asa-grader.js`,
  `flagged-issues.js`, `data-model.js`, `steps.js`, `utils.js`, and `api.js`.
- Report rendering: static `report.html`.
- Future enhancements.

### 3. `front-end-form-with-html/AGENTS.md`

Agent instructions following the standard monorepo AGENTS.md shape:

- Directory map (`css/`, `js/`, `index.html`, `report.html`).
- Conventions: single-page wizard, Alpine.js state bag, empty-string for
  unanswered text, `null` for unanswered numeric.
- How to add a new ASA rule / safety flag (where to edit, what to test).
- Verify command: `bin/test-form pre-operative-assessment-by-patient`.

### 4. `full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md`

Short plan document describing:

- Current status: *Implemented.*
- Backend stack: Rust 2024, Loco on axum, SeaORM, PostgreSQL, Tera
  templates with HTMX and Alpine.
- Layout: SeaORM `migration/`, `src/models/assessments.rs`, controllers
  (`assessment.rs`, `dashboard.rs`), views (`assessment.rs`,
  `dashboard.rs`), Rust-ported engine under `src/engine/`
  (`types.rs`, `utils.rs`, `asa_rules.rs`, `asa_grader.rs`,
  `flagged_issues.rs`).
- Tests directory under `tests/`.
- Future enhancements.

## Authoring rule

For each deliverable, before writing the file I will:

1. Read the target sub-project's existing source files to confirm every
   named path, module, and filename exists.
2. Read the sibling clinician form's equivalent document to match house
   style.

No invented feature names, invented test files, or aspirational descriptions.

## Verification

After all four files are written:

```sh
bin/test-form pre-operative-assessment-by-patient
```

must exit zero.
