# Fix `pre-operative-assessment-by-patient` Doc Stubs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four "Not yet implemented." stub files that cause
`bin/test-form pre-operative-assessment-by-patient` to fail, with accurate
descriptions of the code that already exists in each sub-project.

**Architecture:** Documentation-only. Each of the four target files is
rewritten to describe the existing source tree verbatim — no invented
features, no aspirational content. The fully-implemented sibling form
`forms/pre-operative-assessment-by-clinician/` provides the house style.

**Tech Stack:** Markdown; verified by the `bin/test-form` shell script,
which greps for the literal string `"Not yet implemented."`.

**Spec:** `docs/superpowers/specs/2026-04-22-pre-op-patient-doc-stubs-design.md`

---

## Task 1: Establish baseline

**Files:** none (read-only).

- [ ] **Step 1: Run the validator to capture the current failure set**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test-form pre-operative-assessment-by-patient
```

Expected output (exactly four `Error: not yet implemented` lines):
```
Error: not yet implemented: /Users/jph/git/joelparkerhenderson/medical-forms/forms/pre-operative-assessment-by-patient/front-end-form-with-html/AGENTS.md
Error: not yet implemented: /Users/jph/git/joelparkerhenderson/medical-forms/forms/pre-operative-assessment-by-patient/front-end-form-with-html/plan.md
Error: not yet implemented: /Users/jph/git/joelparkerhenderson/medical-forms/forms/pre-operative-assessment-by-patient/front-end-form-with-svelte/plan.md
Error: not yet implemented: /Users/jph/git/joelparkerhenderson/medical-forms/forms/pre-operative-assessment-by-patient/full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md
```

If any other error appears, stop and investigate before proceeding — the
plan scope only covers these four files.

---

## Task 2: Rewrite `front-end-form-with-svelte/plan.md`

**Files:**
- Modify: `forms/pre-operative-assessment-by-patient/front-end-form-with-svelte/plan.md`

**Context:** The source tree under
`forms/pre-operative-assessment-by-patient/front-end-form-with-svelte/src/`
contains:
- Engine: `src/lib/engine/{types.ts,utils.ts,asa-rules.ts,flagged-issues.ts,asa-grader.ts,asa-grader.test.ts}`
- Store: `src/lib/stores/assessment.svelte.ts`
- Config: `src/lib/config/steps.ts`
- UI library: `src/lib/components/ui/` (RadioGroup, SelectInput, NumberInput, TextInput, TextArea, CheckboxGroup, SectionCard, StepNavigation, ProgressBar, Badge, AllergyEntry, MedicationEntry)
- Steps: `src/lib/components/steps/Step1Demographics.svelte` … `Step16Pregnancy.svelte`
- Routes: `src/routes/+page.svelte`, `src/routes/+layout.svelte`, `src/routes/assessment/+page.svelte`, `src/routes/assessment/+layout.svelte`, `src/routes/report/+page.svelte`, `src/routes/report/pdf/+server.ts`

- [ ] **Step 1: Replace the file with the content below**

Write this exact content to
`forms/pre-operative-assessment-by-patient/front-end-form-with-svelte/plan.md`:

```markdown
# Plan: SvelteKit patient front-end

## Status

Implemented. 16-step patient wizard, ASA grading engine, safety-flag engine,
reactive store, shared UI library, and server-rendered PDF report endpoint
all in place.

## Build order

1. [x] `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`.
2. [x] Tailwind CSS 4 config and `app.css`.
3. [x] Engine: `types.ts`, `utils.ts`, `asa-rules.ts`, `flagged-issues.ts`,
       `asa-grader.ts` (42 ASA rules across 11 body systems; 20+ safety flags).
4. [x] Vitest unit tests in `src/lib/engine/asa-grader.test.ts`.
5. [x] Reactive store `src/lib/stores/assessment.svelte.ts` using `$state` runes.
6. [x] Step configuration `src/lib/config/steps.ts`.
7. [x] Shared UI components under `src/lib/components/ui/` (RadioGroup,
       SelectInput, NumberInput, TextInput, TextArea, CheckboxGroup,
       SectionCard, StepNavigation, ProgressBar, Badge, AllergyEntry,
       MedicationEntry).
8. [x] 16 step components `src/lib/components/steps/Step1Demographics.svelte`
       through `Step16Pregnancy.svelte`.
9. [x] Routes: landing, single-page assessment wizard, report preview,
       server-side PDF endpoint `/report/pdf/+server.ts`.

## Future enhancements

- Zod runtime validation of the assessment payload.
- Axe-core accessibility audit.
- Playwright end-to-end smoke tests.
- LocalStorage autosave.
- Internationalisation (i18n).
```

- [ ] **Step 2: Verify the file is accepted by the validator**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test-form pre-operative-assessment-by-patient 2>&1 | grep "front-end-form-with-svelte/plan.md" || echo "CLEAN"
```

Expected: prints `CLEAN` (this file no longer appears in the error list).

- [ ] **Step 3: Commit**

```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/pre-operative-assessment-by-patient/front-end-form-with-svelte/plan.md
git commit -m "$(cat <<'EOF'
Document implemented SvelteKit patient form

Replace "Not yet implemented." stub with an accurate plan describing the
16-step patient wizard, ASA grading engine, Vitest tests, and routes that
already exist in the source tree.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Rewrite `front-end-form-with-html/plan.md`

**Files:**
- Modify: `forms/pre-operative-assessment-by-patient/front-end-form-with-html/plan.md`

**Context:** The source tree under
`forms/pre-operative-assessment-by-patient/front-end-form-with-html/`
contains:
- `index.html` (776 lines — single-page wizard shell with all 16 step panels)
- `report.html` (145 lines — printable report page)
- `js/app.js`, `js/data-model.js`, `js/steps.js`, `js/asa-rules.js`,
  `js/asa-grader.js`, `js/flagged-issues.js`, `js/utils.js`, `js/api.js`
- `css/` (stylesheets)

- [ ] **Step 1: Replace the file with the content below**

Write this exact content to
`forms/pre-operative-assessment-by-patient/front-end-form-with-html/plan.md`:

```markdown
# Plan: Static HTML patient wizard

## Status

Implemented. Single-page HTML + Alpine.js wizard backed by a JavaScript ASA
grading engine, no build step required.

## Build order

1. [x] `index.html` — 16-step single-page wizard shell with Tailwind CDN
       and Alpine.js 3.
2. [x] `js/data-model.js` — default assessment shape (camelCase, empty
       strings, `null` for unanswered numerics).
3. [x] `js/steps.js` — step metadata (id, title, body-system grouping).
4. [x] `js/asa-rules.js` — 42 ASA rules across 11 body systems, each with a
       stable `ruleId`.
5. [x] `js/flagged-issues.js` — safety-flag rule catalogue.
6. [x] `js/asa-grader.js` — pure grader that runs the rule set and returns
       the computed ASA grade plus fired rules.
7. [x] `js/utils.js` — formatting helpers.
8. [x] `js/api.js` — optional thin client for backend persistence.
9. [x] `js/app.js` — Alpine.js component wiring state, step navigation,
       grader invocation, and report handoff.
10. [x] `report.html` — printable report template (browser print-to-PDF).

## Future enhancements

- Offline-first service worker.
- LocalStorage autosave.
- Accessibility audit with axe-core.
```

- [ ] **Step 2: Verify**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test-form pre-operative-assessment-by-patient 2>&1 | grep "front-end-form-with-html/plan.md" || echo "CLEAN"
```

Expected: prints `CLEAN`.

- [ ] **Step 3: Commit**

```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/pre-operative-assessment-by-patient/front-end-form-with-html/plan.md
git commit -m "$(cat <<'EOF'
Document implemented HTML patient form

Replace "Not yet implemented." stub with an accurate plan describing the
single-page HTML + Alpine.js wizard and JS ASA engine that already exist
in the source tree.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Rewrite `front-end-form-with-html/AGENTS.md`

**Files:**
- Modify: `forms/pre-operative-assessment-by-patient/front-end-form-with-html/AGENTS.md`

**Context:** Style baseline is the sibling clinician form's equivalent file
at `forms/pre-operative-assessment-by-clinician/front-end-form-with-html/AGENTS.md`,
adapted to the patient-form filenames.

- [ ] **Step 1: Replace the file with the content below**

Write this exact content to
`forms/pre-operative-assessment-by-patient/front-end-form-with-html/AGENTS.md`:

```markdown
# HTML patient wizard — Agent Instructions

Single-page static HTML + Alpine.js implementation of the 16-step patient
pre-operative self-assessment wizard. Produces an ASA Physical Status
Classification grade (I–VI) and a list of fired safety flags.

## Stack

- HTML, CSS, Alpine.js 3, Tailwind CSS via CDN.
- No build step, no `node_modules`, no server.
- Browser print-to-PDF via `report.html`.

## Files

- `index.html` — wizard shell and all 16 step panels.
- `report.html` — printable report page.
- `css/` — stylesheet overrides layered on top of the Tailwind CDN.
- `js/data-model.js` — default assessment shape (camelCase fields, empty
  strings for unanswered text / enum, `null` for unanswered numeric).
- `js/steps.js` — step metadata (id, title, body system).
- `js/asa-rules.js` — 42 ASA grading rules with stable `ruleId` values.
- `js/flagged-issues.js` — safety-flag rule catalogue.
- `js/asa-grader.js` — pure grader function.
- `js/utils.js` — small formatting helpers.
- `js/api.js` — optional client for the Rust backend.
- `js/app.js` — Alpine.js component: state, navigation, grader invocation,
  report handoff.

## Engine

Implements the 42-rule ASA grader and safety-flag engine in plain
JavaScript, with the same `ruleId` values as the SvelteKit port at
`../front-end-form-with-svelte/src/lib/engine/`. The two engines must stay
aligned rule-for-rule.

## Conventions

- camelCase JavaScript property names on the assessment object.
- Empty string `''` for unanswered text / enum fields.
- `null` for unanswered numeric fields.
- Single-page wizard — no multi-page forms (monorepo rule).

## Adding a new rule

1. Add the rule to `js/asa-rules.js` (or `js/flagged-issues.js` for safety
   flags) with a fresh `ruleId`.
2. Add the same rule, with the same `ruleId`, to
   `../front-end-form-with-svelte/src/lib/engine/asa-rules.ts`.
3. If the rule depends on a field that does not yet exist in
   `js/data-model.js`, add the field with the correct empty-value
   convention.
4. Re-run `bin/test-form pre-operative-assessment-by-patient`.

## Verify

```sh
bin/test-form pre-operative-assessment-by-patient
```
```

- [ ] **Step 2: Verify**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test-form pre-operative-assessment-by-patient 2>&1 | grep "front-end-form-with-html/AGENTS.md" || echo "CLEAN"
```

Expected: prints `CLEAN`.

- [ ] **Step 3: Commit**

```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/pre-operative-assessment-by-patient/front-end-form-with-html/AGENTS.md
git commit -m "$(cat <<'EOF'
Document implemented HTML patient form agent instructions

Replace "Not yet implemented." stub in AGENTS.md with concrete instructions
for the existing HTML + Alpine.js wizard: stack, file map, engine contract,
conventions, and the procedure for keeping the JS and Svelte rule
catalogues in sync.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Rewrite `full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md`

**Files:**
- Modify: `forms/pre-operative-assessment-by-patient/full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md`

**Context:** The source tree under the Rust sub-project contains:
- `Cargo.toml`
- `config/`
- `migration/` (SeaORM migration crate)
- `assets/`, `templates/` (`base.html.tera`, `dashboard.html.tera`,
  `landing.html.tera`, `report.html.tera`, `_dashboard_results.html.tera`,
  `assessment/`)
- `src/bin/main.rs`, `src/lib.rs`, `src/app.rs`
- `src/models/mod.rs`, `src/models/assessments.rs`
- `src/controllers/mod.rs`, `src/controllers/assessment.rs`,
  `src/controllers/dashboard.rs`
- `src/views/mod.rs`, `src/views/assessment.rs`, `src/views/dashboard.rs`
- `src/engine/mod.rs`, `src/engine/types.rs`, `src/engine/utils.rs`,
  `src/engine/asa_rules.rs`, `src/engine/asa_grader.rs`,
  `src/engine/flagged_issues.rs`
- `tests/engine_tests.rs`, `tests/engine/`

- [ ] **Step 1: Replace the file with the content below**

Write this exact content to
`forms/pre-operative-assessment-by-patient/full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md`:

```markdown
# Plan: Rust full-stack

## Status

Implemented. Loco/axum backend with SeaORM models, HTMX-driven Tera
templates, and a Rust port of the ASA grading engine in place.

## Build order

1. [x] `Cargo.toml`, `Cargo.lock`, workspace `migration/` crate.
2. [x] Loco application bootstrap: `src/bin/main.rs`, `src/lib.rs`,
       `src/app.rs`.
3. [x] SeaORM migration wiring under `migration/src/`.
4. [x] Models: `src/models/mod.rs`, `src/models/assessments.rs`
       (SeaORM entity, snake_case fields, `serde(rename_all = "camelCase")`).
5. [x] Controllers: `src/controllers/assessment.rs`,
       `src/controllers/dashboard.rs` (assessment CRUD, dashboard listing).
6. [x] Views: `src/views/assessment.rs`, `src/views/dashboard.rs`.
7. [x] Tera templates: `base.html.tera` (HTMX 2.0.8 + Alpine 3.14.8 + hx-boost),
       `landing.html.tera`, `dashboard.html.tera`,
       `_dashboard_results.html.tera`, `report.html.tera`, `assessment/`.
8. [x] Engine port: `src/engine/{types,utils,asa_rules,flagged_issues,asa_grader}.rs`.
9. [x] Integration tests: `tests/engine_tests.rs`, `tests/engine/`.

## Future enhancements

- Authentication and per-clinician audit trail.
- Pagination tuning and full-text search on the dashboard.
- Server-side PDF export (currently delegated to the SvelteKit front-end).
- Clinical safety-case evidence collection endpoint.
```

- [ ] **Step 2: Verify**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test-form pre-operative-assessment-by-patient 2>&1 | grep "full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md" || echo "CLEAN"
```

Expected: prints `CLEAN`.

- [ ] **Step 3: Commit**

```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
git add forms/pre-operative-assessment-by-patient/full-stack-with-rust-axum-loco-tera-htmx-alpine/plan.md
git commit -m "$(cat <<'EOF'
Document implemented Rust full-stack backend

Replace "Not yet implemented." stub with a plan describing the Loco/axum
backend, SeaORM models, Tera templates, and Rust-ported ASA engine that
already exist in the source tree.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Final verification

**Files:** none (read-only).

- [ ] **Step 1: Run the full form validator**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test-form pre-operative-assessment-by-patient
echo "exit=$?"
```

Expected:
- No output on stdout or stderr before the `exit=` line.
- `exit=0`.

If any `Error:` line is printed, identify which file triggered it and fix
only that file — do not expand scope to unrelated issues.

- [ ] **Step 2: Run the whole-repo validator as a regression check**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
bin/test 2>&1 | grep -c "pre-operative-assessment-by-patient" || true
```

Expected: `0` (the patient form produces no errors). Other forms may still
produce errors from their own stubs — those are out of scope.

- [ ] **Step 3: Confirm git state**

Run:
```sh
cd /Users/jph/git/joelparkerhenderson/medical-forms
git status
git log --oneline -6
```

Expected: working tree clean; the four per-task commits from Tasks 2–5
visible plus the earlier spec commit.
