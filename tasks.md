# Tasks

Executable checklist for [`plan.md`](plan.md) (Round 2, 2026-08; Round 1,
2026-07, below).
Work phases in order; within a phase, mechanical per-form items may be
batched across parallel subagents. After every phase run the full gate:

```sh
bin/test
bin/test-sql-apply
bin/lily-html-refactor --check --all && bin/lily-svelte-refactor --check --all
bin/lily-sync --check && bin/lily-svelte-sync --check
bin/generate-llms-txt.py --check && bin/generate-spec.py --check
bin/generate-changelog-and-examples.py --check
bin/loco-config-refactor --check --all
```

## Status summary (2026-08-26) — Round 2

Round 2 (see [`plan.md`](plan.md) "Round 2") opened after a research pass:
355 forms, all Round 1 build-out claims still hold, but several gates have
stopped telling the truth. Special files + `forbid(unsafe_code)` landed the
same day (Phase 7 below, complete); Phases 8–12 are open. **Start at Phase 8
(R0 gate truth) — everything else sequences behind it.**

Gate-truth repair (Phase 8) largely landed same-day: **all 29 cheap verify
gates green** (`test-tools` 21 ok / 0 failed) after the ESM engine-loader
rebuild (test-engines PASS 279/SKIP 76/FAIL 0; test-personas PASS 109, zero
oracle diff), the es-modules indent fix, and the Lily re-pin to `e05a138e6`
with fleet theme re-sync. **Phases 8 and 9 completed the same day**
(gate truth; CI completeness — see each phase), and Phase 10's tooling half
too. v1.0.0 tagged 2026-08-26. Open: two maintainer decisions in Phase 10
(Zenodo DOI; licence fit), then Phases 11-12.

**2026-08-27/28 — Phase 9 correction, repeated eight more times, then
confirmed green.** Checked GitHub's actual CI run history for the first
time since Phase 9 claimed "complete" — every run had failed or been
cancelled, Rust and Svelte matrices had never once gone green. What
followed was a real-CI-run-at-a-time loop, not a single fix: each push's
own run was watched through to its actual result rather than assumed,
and nine more times it surfaced a bug the previous fix hadn't touched —
a scaffold clippy default, `npm ci` against pnpm-only front-ends, a
missing PyYAML install, a missing `pnpm-workspace.yaml` key, a merge-
regressed `locales.ts`, an XML-escaping/orphan-file generator bug, a
SvelteKit 3.0-next rename (after one wrong diagnosis was caught and
reverted before landing), a stray post-rename reference left in
`seed()`, the Rust runner filling its own disk, an FHIR validator that
had never once completed plus every real error it was masking, a
concurrency group that let a delayed cron cancel real work, a test-only
connection-pool race, and a gitignored E2E lockfile. Persona work
continued in parallel: 109 → 186 this session. **Confirmed, not
assumed:** run
[33213955606](https://github.com/FormExamples/form-examples/actions/runs/33213955606)
— every job green, first time in this repository's history. See Phase
9's correction entries below for the full account of each bug.

## Status summary (2026-07-13)

Phases **0, 1, 4, 5 complete**; **2** complete bar the engine-oracle-dependent
fixture `expected` blocks; **3** has print CSS + dashboard CSV/TSV export + the
i18n pilot delivered (export/import + Loco seed/serve still open); **6** has the
engine + persona oracle with **108 forms** carrying verified personas.

Beyond the plan, an audit-fix-gate loop found and closed a long chain of latent
bugs, each fenced with a new gate:

- 81 mangled `*_grade_flag.sql` migrations (lost `.sql` extension) restored.
- 170 missing `front-end-with-html/README.md` symlinks added.
- `mobility-assessment`'s stub dashboard implemented.
- `medical-operation-note` missing domain controllers → added; `bin/test-loco-routes`.
- 135 stale back-end `AGENTS.md` (obsolete JSONB API) regenerated; `--list-stale` gate.
- 1652 false-positive scaffold request tests (trailing-slash → welcome page) fixed.
- **The big one:** a route-nesting seed-path regression had broken ~4000
  back-end tests (every seeding test); fixed corpus-wide + gated.
- 7 invalid OpenAPI specs (YAML-indicator enum values) + 3 invalid protobuf
  (proto3 enum-name collisions) → generator fixes + `protoc`/`openapi` CI gates.
- All 4 generated representation formats (XML, FHIR, OpenAPI, protobuf) now
  validate end-to-end; a combined OpenAPI spec per form added.

New verification tooling (all in CI): `bin/generate-forms-tsv.py`,
`bin/test-examples-conformance`, `bin/forms-shard`, `bin/generate-tools-doc.py`,
`e2e/` (Playwright + axe-core) + `bin/test-e2e`, `bin/test-engines`,
`bin/test-personas`, `bin/test-loco-routes`, `bin/test-tutorials`,
`bin/back-end-with-loco/generate-loco-agents.py`,
`bin/openapi/generate-openapi-combined.py`.

**Remaining large/deliberate items** (documented in-place below): snake_case↔
camelCase API contract (283 crates + ~1400 insta-snapshot regen; latent),
form export/import (per-form state seam), serve-OpenAPI second half (per-crate
Rust route serving `combined/openapi.yaml`), and the Phase 6 persona rollout to
the remaining scorable forms.

## Phase 0 — Repair & hygiene ✅ COMPLETE (2026-07-12)

- [x] Regenerate `forms.tsv` to cover all 286 forms. Created
      `bin/generate-forms-tsv.py [--check]` (derives rows from `forms/*/`
      dirs that contain `index.md`; excludes support dirs); wired `--check`
      into `bin/test`. `bin/forms-as-kebab-case | wc -l` → 286.
- [x] Rewrote `.github/workflows/ci.yml` for the current layout (see Phase 1).
- [x] Removed the stray empty root route dirs
      `glasgow-blatchford-bleeding-scores/[id]/report/pdf` and
      `substance-abuse-assessments/[id]/report/pdf` (untracked, zero files).
- [x] Brought the 2 Lily-Svelte TODO forms to PASS (canonical UI ports).
      `bin/lily-svelte-status --counts` → PASS 286 / TODO 0.
- [x] Recorded the `orthopedic-assessment` spelling decision in its
      `spec/index.md`: UK "Orthopaedic" display title, stable American slug
      (renaming would churn every derived artefact for no clinical benefit).
- [x] **BONUS defect found + fixed:** commit 40794d6d4 had stripped `.sql`
      from 81 forms' `92_create_table_*_grade_flag` migrations, silently
      dropping `grading_additional_flag` from `schema.sql`, the SQL-apply
      gate, protobuf, and OpenAPI (FHIR/XML/Loco already had it). Restored
      the extension (`git mv`), regenerated `schema.sql` + protobuf +
      OpenAPI, and validated: `bin/test-sql-apply` → 286/286 PASS,
      `bin/test-examples-conformance` → 286/286 conform.
- [x] **BONUS structure gap fixed:** 170/286 forms were missing
      `front-end-with-html/README.md` (the `-> index.md` symlink required by
      `bin/test-form`), which halted `bin/test` at the first form. Added all
      170 symlinks. **All 286 forms now pass `bin/test-form` structure
      validation** (the DB-dependent `cargo test` portion needs Postgres,
      supplied by the CI `rust` job / `TEST_FORM_SKIP_CARGO=1` locally).

## Phase 1 — CI and verification depth (WS1) ✅ COMPLETE (2026-07-12)

- [x] Rewrote `.github/workflows/ci.yml` as a full matrix:
  - [x] `structure` — `bin/test`.
  - [x] `drift` — regenerates all artefacts + every `--check` gate
        (forms-tsv, tools-doc, llms, spec, changelog/examples, all four Lily
        checks, loco-config, examples-conformance) + XML/DTD validation +
        fail-on-uncommitted-diff.
  - [x] `sql-apply` — `bin/test-sql-apply` against a `postgres:18` service.
  - [x] `rust` — 8-way sharded (`bin/forms-shard`) `cargo check` +
        `clippy -D warnings` + `cargo test`, each shard with a Postgres
        service and per-crate DB creation; `Swatinem/rust-cache`.
  - [x] `svelte` — 8-way sharded `npm ci && check && build && vitest run`.
  - [x] `fhir` — official HL7 `validator_cli.jar` (pinned 6.3.11, cached)
        over generated `fhir/r5/*.json` + example Bundles.
- [x] Wrote `bin/test-examples-conformance` (entity/property vs SQL schema,
      separator-insensitive, light numeric/boolean type check). Wired into
      `bin/test`, `bin/test-tools`, and the CI `drift` job. Found + fixed 8
      genuine fixture bugs (3 forms regenerated).
- [x] Added `bin/forms-shard <i> <n>` (deterministic split; sums to 286).
- [x] Added the 4 missing Svelte Vitest suites (diabetes-assessment,
      heart-health-check, systematic-coronary-risk-evaluation-2-diabetes,
      vaccinations-assessment) — all 286 front-ends now have engine tests.
- [x] Added the nightly `schedule` trigger + `e2e` job (`if: schedule`).
- [x] **BONUS:** `bin/generate-tools-doc.py [--check]` → `docs/tools.md`
      (Phase 4 item, built here); wired into `bin/test-tools` + CI drift.

## Phase 2 — E2E and accessibility (WS2) — harness + a11y done; oracles pending

- [x] Built the shared Playwright harness at `e2e/` (config, static server,
      form-list resolver) + specs:
  - [x] `tests/html-smoke.spec.ts` — every HTML front-end: loads with no
        uncaught JS error, primary action responds, **axe-core** WCAG 2 A/AA
        (fails on serious/critical).
  - [x] `tests/svelte-smoke.spec.ts` — welcome route render + a11y (env-driven).
  - [x] `bin/test-e2e [--html|--svelte] [--all|<slug>…]` wrapper.
- [x] Integrated `@axe-core/playwright`. Fixed **all** WCAG 2 AA
      color-contrast debt across the shared Lily palette (step-list
      in-progress `#2563eb`→`#1e40af`; finished-step greens; alert grays;
      flag/mandatory badges; blue button/link) and 3 genuine per-form a11y
      bugs (unlabeled controls in vaccinations-assessment; invalid `<ol>`
      structure in workplace-safety-assessment; non-focusable scroll regions
      in the UK LPA form). **Full sweep: 286/286 HTML front-ends pass** smoke
      + a11y (from ~2/286 at the start). Harness retries once to absorb
      parallel-load flakes.
- [ ] Extend `examples/` fixtures with an `expected` block (score/grade/flags)
      as the E2E oracle — REQUIRES running each form's JS engine over the
      fixture (Python generator cannot; needs a Node oracle harness). Pending.
- [ ] Fill `expected` for all 286 typical fixtures (mechanical; needs oracle).
- [ ] Wire changed-forms E2E subset into PR CI (nightly full sweep done).

## Phase 3 — Functionality rollout (WS3) — ASSESSED; remaining as batch rollout

**2026-07-12 assessment (read before starting):** this phase is genuinely
heterogeneous per-form work, NOT a clean mechanical sweep. Findings:
- **Autosave is partially present but inconsistent.** 531 HTML `js/` files
  touch `localStorage`, but the `STORAGE_KEY` convention varies wildly: 75
  forms use `<slug>.front-end-with-html.v1`, 108 use the legacy
  `<slug>.front-end-form-with-html.v1`, a handful are bespoke
  (`icvp-form-state`, `adr.form.v1`, `who-surgical-safety-checklist-draft`),
  and ~100 form-app.js files have no `STORAGE_KEY` constant at all (state is
  persisted elsewhere or not at all). So a generic "export the localStorage
  blob" approach is not reliable — **first normalize the STORAGE_KEY
  convention** (a `bin/` normalizer + `--check`) as a prerequisite.
- Export/import exists in only 2 forms; each `form-app.js` is bespoke (the
  `state` object is module-local), so export needs per-form wiring OR a
  refactor to expose a common `getState()`/`setState()` hook per form.
- Recommended sequencing: (0) normalize STORAGE_KEY; (1) add a shared
  `getState()`/`setState()` seam to each form-app.js (mechanical once the key
  is normalized); (2) drop in a shared `js/form-io.js` (export JSON/XML/CSV/
  TSV + import) referenced from index.html; (3) roll out via subagents in
  batches, verified by the E2E harness (round-trip export→import→same report).

Design each feature on the reference forms
(`pre-operative-assessment-by-clinician` HTML,
`cardiology-request` Svelte), spot-check, then batch-roll to all forms.

- [ ] **Export**: JSON / XML / CSV / TSV download of a completed form —
      HTML front-end (vanilla JS shared snippet) and Svelte front-end
      (shared `src/lib/` module). Filenames `<slug>-<date>.<ext>`.
- [ ] **Import**: JSON upload re-populates the wizard (both front-ends);
      round-trip test in the E2E harness (export → import → same report).
- [ ] **Autosave**: localStorage persistence keyed by slug, restore banner
      on load, clear-on-submit + explicit clear control; both front-ends.
      E2E test: fill half, reload, assert restored.
- [x] **Print CSS (HTML)**: added a shared, idempotent `@media print` block
      (`print-report-styles v1`) to every HTML front-end — hides wizard chrome
      (buttons, progress, step-list, theme switcher), flattens colours/shadows
      for paper, `@page` margins. Applied to all 286 (283 external `style.css`
      + 3 inline `<style>`). Verified by a print-media assertion in the E2E
      harness (buttons `display:none` under `@media print`). Svelte print CSS
      still pending.
- [x] **Dashboard CSV/TSV export (HTML)** on all 286 dashboards. Shared,
      form-agnostic `js/table-export.js` self-injects "Download CSV" / "Download
      TSV" buttons above the dashboard's data table and serializes the rendered
      header + visible rows (respecting filters/sort) with correct delimiter
      escaping. Rolled out mechanically (283 via `<script src>`, 3 inline for
      the no-`js/` dashboards). Verified by `e2e/tests/dashboard-export.spec.ts`
      (buttons present, CSV downloads with a real header) → 286/286.
- [x] **Fixed `mobility-assessment`'s stub dashboard** (found via the export
      harness): its `dashboard-app.js` was a 2-line "Implementation pending"
      scaffold — the ONLY unimplemented front-end across all 286 forms
      (audited: 0 stubs remain). Implemented it (12 Tinetti sample rows, 6
      columns, filters, sort) + its scaffold CSS; html-smoke + dashboard-export
      + a11y all pass.
- [ ] **Loco seed data**: per-crate seeder loading `examples/` typical
      fixture; document `cargo loco db seed` (or task equivalent).
- [x] **Fixed a real back-end bug found by audit:** `medical-operation-note`
      — the crate the notes call the "gold reference" — was the ONLY crate of
      286 missing its domain HTTP controllers (its `controllers/` had just
      `auth.rs`; `app.rs routes()` wired only `auth`, vs 2–23 domain routes in
      every other crate). Its API exposed no domain entities. Added the 13
      per-model controllers + wired routes (mirroring apgar-score); REST now at
      `/api/<table>/`. `cargo check --all-targets` clean; loco-config-refactor
      `--check` still passes. (A cross-crate `add_route`-count audit is a cheap
      future gate to prevent recurrence.)
- [x] **Fixed 135 stale back-end `AGENTS.md`** (found following the
      medical-operation-note fix): 135/286 crate docs still described the
      obsolete single-`assessments`-table JSONB API (`/api/assessments`,
      `data JSONB`, `src/bin/main.rs` layout) that no longer exists — the
      crates are relational per-table. Added
      `bin/back-end-with-loco/generate-loco-agents.py` (emits an accurate doc
      from each crate's real controllers) + a `--list-stale` gate wired into
      `bin/test-tools` and CI; regenerated the 135, left the 151 correct
      hand-authored docs untouched.
- [x] **FIXED — 3 invalid generated Protocol Buffers (found by audit).** The
      protobuf generator emitted `<FIELD>_UNSPECIFIED = 0` and then a CHECK
      value literally `'unspecified'` produced the SAME constant at index N;
      proto3 scopes enum value names to the package, so it was a duplicate →
      `protoc` rejected it. Hit body-mass-index-…-calculator, international-
      certificate-of-vaccination-or-prophylaxis, partogram. Fixed the generator
      to dedup by generated constant name (pre-seeding the UNSPECIFIED
      sentinel); regenerated (3 files); all 1850 `.proto` now compile. Added a
      `protoc` validation step to the CI drift job.
- [x] **FIXED — 7 invalid generated OpenAPI specs (found by audit).** The
      OpenAPI generator emitted CHECK-enum values unquoted, so a value with a
      leading YAML indicator char (`>=80`, an adult age band) parsed as a block
      scalar → invalid YAML. Affected bhutani-bilirubin-nomogram, chronic-
      kidney-disease-review, COPD-review, epilepsy-review, heart-failure-review,
      hypertension-review, partogram. Fixed `yaml_enum_value()` to quote such
      values; regenerated (7 files); all 1850 specs now validate. Added an
      OpenAPI 3.1 validation step to the CI drift job (previously only XML +
      FHIR were validated).
- [x] **FHIR: role-based resource classification — dangling Encounter refs 178→0.**
      `classify_table` matched FHIR resource types by LITERAL table names
      (`assessment`→Encounter, `grade`→ClinicalImpression), so the ~178 forms
      with a form-specific main table (`apgar_score`, not `assessment`) got no
      Encounter/ClinicalImpression — everything fell to Observation — and their
      `Encounter/<uuid>` references dangled (the uuid came from a hardcoded
      `get_uuid("assessment")` seed matching no resource). Rewrote it to
      identify the core table by role (`find_main_table`: non-patient/clinician,
      non-grade, prefix of the most others) and classify grade tables by suffix
      (`_grade`/`_grade_rule`/`_grade_flag`), aliasing the `"assessment"` uuid to
      the real main table so refs resolve; defensively drop the `encounter`
      element when a form has no core table. Result: **dangling Encounter refs
      178→0**, resource types now correct (289 Encounter / 383 ClinicalImpression
      / 547 DetectedIssue), 0 structural problems, idempotent. Uses the same
      builders CI already HL7-validates for the generic-named forms (the 2-min
      tool cap prevents a local HL7 run; the CI `fhir` job is authoritative).
      Also (prior round) bundle references rewritten to `urn:uuid:` fullUrls.
- [x] **FHIR: orphan cleanup + patient-aware refs — 0 dangling bundle refs.**
      (Follow-up to the row above, now closed.) Two root causes remained:
      (1) the generator never deleted stale `*.json` for renamed/dropped tables
      (`grading_result`→`grade`, `arc42_documentation`→its split tables) — **139
      orphans across 115 forms**, each duplicating a live resource and carrying
      cross-refs baked against an older UUID assignment, which is what actually
      produced the dangling `Encounter/<patient-uuid>` refs. Generalized the
      cleanup from `assessment_*.json` to any `*.json` outside the current table
      set. (2) builders hardcode `subject: Patient/<uuid>`, so the **13
      non-clinical forms with no patient table** (arc42, meeting, issue-tracker,
      agile/OKR/LPA/neurodiversity) dangled 118 `Patient/` refs. Made
      `build_fhir_resource` reference-aware (`has_patient`): drop the optional
      `subject` (Observation/Encounter/DetectedIssue) and downgrade the grade
      table's ClinicalImpression (subject 1..1 required) to a neutral Observation
      (subject 0..1). **Result: unresolved refs 0 across 0 forms** (was Patient
      221 / Encounter 104 across 117); idempotent; xml/openapi/protobuf
      unchanged; `--check` green. Commit `c779754a1`.
- [x] **psychology-assessment stub SQL — FIXED.** The form's SQL was a
      patient+clinician stub with its entire DASS-21 schema absent (so every
      generated representation was empty of domain content and it could not
      score). Added the canonical four domain migrations mirroring the
      item-based pattern (autism/attention-deficit): minimal `assessment`
      parent, a `grade` child with the three DASS-21 subscale scores (0-42,
      raw doubled) + severity categories, plus `grading_fired_rule` and
      `grading_additional_flag`. Verified on scratch Postgres 18 — all 6
      migrations apply, full patient→assessment→grade→rule/flag insert chain
      succeeds, CHECK constraints reject invalid severities. Regenerated all
      representations; FHIR now emits the correct Encounter/ClinicalImpression/
      DetectedIssue set. Commit `fcd9df60f`.
- [x] **psychology-assessment Loco crate — completed (`8ed5d7e40`).** The crate
      lagged its schema (patient+clinician only). Added the full relational
      stack for all four domain entities (assessment/grade/grading_fired_rule/
      grading_additional_flag), mirroring the sibling autism-assessment crate:
      SeaORM migrations, _entities with relations, model wrappers, JSON-API
      controllers wired into app.rs, and model + request tests. Verified on
      scratch Postgres 18 — cargo check clean; full suite 35 tests, 0 failed
      (up from 27); loco route + config drift gates green.
- [x] **Loco setup-script drift (81 forms) — FIXED + gated.** Surfaced while
      regenerating for psychology-assessment: 81 `back-end-with-loco-setup`
      scripts were missing the `grading_additional_flag` scaffold call. Root
      cause: they were generated during Phase 0 while the 81
      `92_*_grade_flag.sql` migrations still lacked their `.sql` extension, so
      the grade_flag table was invisible. Regenerated all 81 (pure additions,
      idempotent; commit `f40c11605`). The generator had **no `--check` mode**,
      which is why this drifted silently — added `--check` + slug filtering and
      wired the gate into CI (commit `62b306f67`).
- [x] **vaccinations-assessment broken submit — FIXED (`b22d0662d`).** Found by
      auditing front-end architecture: its HTML wizard's submit navigated to
      `report.html`, which does not exist → clinician landed on a 404 and never
      saw the result. index.html already had the intended inline `#report`
      region; replaced the redirect with an inline renderReport() (status,
      score, fired rules, flags — escaped + priority-coloured), matching the
      single-page convention. Verified with Playwright (no navigation, `#report`
      fills, 0 page errors; smoke+a11y green). **Stub audit was otherwise clean:
      psychology-assessment was the only stub SQL; no other broken submits.**
      **Gated (`394bd2aa7`):** the html-smoke sweep now asserts the primary
      action never changes the pathname (single-page-wizard invariant) — it
      catches this whole class and passed 572/572 across all 286 forms with the
      new assertion (the old sweep only checked for thrown JS errors, which a
      404 navigation does not raise, so the bug had slipped through).
- [x] **ES-modules front-end refactor — DONE (2026-07-15).** Reverses the
      earlier item (1): rather than de-module the 3 outliers to match the
      classic `window.<Namespace>` scripts, the project decision flipped — **all
      HTML front-ends now use native ES modules** (`import`/`export` +
      `<script type="module">`). Recorded in [`spec/es-modules.md`](spec/es-modules.md)
      (incl. the accepted `file://` tradeoff — modules must be served over HTTP).
      Built `bin/es-modules-refactor` (offset-based, namespace-aware converter:
      strips IIFE + namespace plumbing, resolves a per-(namespace,symbol)→file
      map, emits import/export, re-declares non-namespace IIFE params, rewrites
      HTML to a single module entry; idempotent; `--check` CI drift detector,
      wired into AGENTS.md Verify). It handles the many real idioms found in the
      corpus (per-symbol + `Object.assign` publishes, two-line & parenthesised &
      reverse `|| {}` inits, `const NS = window.X` aliases, global-param IIFEs
      incl. multi-param `(root, doc)`, inline member-access consumes, same-name
      shadows via `as`-aliased imports, function-RHS publishes with inner refs).
      **283 forms tool-converted; 3 bare-global forms (issue-tracker, meeting,
      architecture-decision-record) hand-converted (the tool aborts + reports
      those rather than silently dropping scripts).** `--check --all` clean; all
      2809 JS files pass `node --check`; full `bin/test-e2e --html --all`
      smoke+a11y+dashboard-export sweep green. Updated
      `forms/AGENTS-front-end-html.md` §5 and the gold-standard example.
      *Note:* the `file://` self-contained property in earlier notes no longer
      holds — that was the whole tradeoff.
- [x] **Front-end autosave rollout — DONE (2026-07-15).** Added
      `localStorage`/`STORAGE_KEY` autosave (`<slug>.front-end-with-html.v1`,
      try/catch save/load, save-on-edit + hydrate-on-load) to the 5 forms that
      lacked it: objectives-and-key-results-tracker, issue-tracker,
      vaccinations-assessment, agile-principles-assessment, and uk-lpa-health
      (LP1H). issue-tracker uses a DOM-level variant (no central state object);
      the rest persist their state object deep-merged onto the canonical shape,
      LP1H's dynamic lists included. Verified per form: `node --check`, a
      fill→reload→persists check, and `bin/test-e2e --html <slug>` green.
      *(Superseded note (3): `agile-consulting-scorecard-for-hiring-help` is NOT
      a single-page-wizard violation — it is a single inline `<script>` form with
      `onsubmit="return false;"` + live recompute-on-input and no `js/` dir; its
      `report.html` is an intentional standalone printable artifact, not wizard
      navigation. The full `bin/test-e2e --html --all` sweep passes it. The
      ES-modules refactor correctly skipped it — nothing to modularize.)*
- [i] **Representation-coverage audit — CORRECTED (2026-07-14).** The earlier
      audit (2026-07-13) wrongly called the FHIR-only extra file a "synthetic
      `grading_result`" and declared it intentional. It was NOT: `grading_result`
      was a stale ORPHAN left by the `grading_result`→`grade` table rename, now
      deleted (see the orphan-cleanup row above). The one genuinely intentional
      fold remains: XML is per-table, while FHIR/protobuf/OpenAPI fold
      `assessment_<section>` children into the parent `assessment` entity
      (documented in the generator headers). Post-cleanup, FHIR file counts match
      the current table set exactly (0 orphans).
- [x] **Loco API round-trip integration test** (template DONE on apgar-score):
      `tests/requests/patients.rs` POSTs a patient to `/api/patients`, asserts
      200 + id, GETs `/api/patients/{id}`, asserts every field round-trips, and
      confirms list membership. Verified against a real Postgres (1 passed).
      Domain routes need NO auth. Ports to other crates by swapping the field
      set per that crate's `Params`. Also fixed apgar's stale `Cargo.lock` and
      dropped `--locked` from the CI rust job (lock hygiene isn't maintained
      across all 286 crates; matches `bin/test-loco-project`).
- [ ] **FINDING — API serves snake_case, not camelCase (283/286 crates).**
      The scaffold `Params`/`_entities` models derive plain serde with NO
      `rename_all = "camelCase"`, so the Loco JSON API emits snake_case keys —
      contradicting the repo convention ("camelCase on structs shared with the
      front-end") and the camelCase front-ends. A latent contract mismatch
      (nothing currently wires the front-ends to the API). Fixing = add the
      rename to 283 crates + regenerate + refresh insta snapshots + cargo
      verify: a dedicated effort, not a quick sweep.
- [x] **FIXED — 1652 false-positive scaffold request tests.** They GET
      `/api/<table>/` (trailing slash → Loco's HTML welcome page, 200) and
      asserted 200, so they passed without reaching the handler (confirmed:
      `/api/patients` → 200 `application/json` `[]`; `/api/patients/` → 200
      `text/html` welcome page). Removed the trailing slash so each hits the
      real list handler, and added a content-type assertion so it verifies the
      JSON response, not the welcome page. Verified on a sample against real
      Postgres — all domain list tests pass.
- [x] **FIXED — broken seed path broke ~4000 tests (route-nesting regression).**
      What looked like an "auth magic-link mailer" failure was really a broken
      `App::seed`: the nesting refactor moved fixtures to
      `src/<snake>/fixtures/users.yaml`, but `seed()` still used
      `base.join("users.yaml")` where the harness's `base` resolves to the old
      flat path → seed failed with "No such file or directory". Every seeding
      test (models, requests, AND the magic-link tests, which seed first)
      failed — ~14 per crate × 280 ≈ 4000 tests, silent because nothing ran the
      full suite to completion. Fixed all 279 crates to seed via
      `CARGO_MANIFEST_DIR`; verified full suites now pass 0-failed (apgar 38,
      stroke 35, patient-intake 32, mental-health 32). This is what actually
      unblocks the CI rust job's `cargo test`. Added a `bin/test-loco-routes`
      gate rejecting the broken `base.join("users.yaml")` pattern. (The 6
      crates without a users.yaml never call seed — genuinely fine.)
- [ ] **Loco API integration test rollout** (per crate) once the two findings
      above are resolved — the apgar template is the pattern.
- [x] **Combined OpenAPI spec per form** (the first half of "serve OpenAPI"):
      `bin/openapi/generate-openapi-combined.py [--check]` merges each form's
      per-entity `openapi/*.yaml` into one `openapi/combined/openapi.yaml`
      (union of paths + component schemas, form-level info). Written to a
      `combined/` subdir so the per-entity generator's non-recursive dir
      cleanup never touches it. All 286 validate; wired into the CI drift
      regenerate + `--check` + recursive OpenAPI validation. Useful directly
      for Swagger UI / client codegen.
- [ ] **Serve OpenAPI**: static route in each crate serving its
      `openapi/*.yaml` at `/api/openapi.yaml`.
- [i] **Svelte build audit (2026-07-13): CLEAN.** Sampled `npm run build`
      across diverse forms (incl. the re-ported Lily forms + a test-request
      form) → all build; `npm run check` + `vitest` also green on the sample.
      Unlike the Rust suite, the Svelte CI job is genuinely sound.
- [x] **i18n pilot DONE** on `medical-language-speaking-assessment-for-cymraeg`:
      message layer (`src/lib/i18n/messages.ts` typed `{en,cy}` catalogue +
      `locale.svelte.ts` runes store, localStorage-persisted, `t()` with en
      fallback, mirrors `<html lang>` en-GB/cy) + `LocaleSelect` switcher
      mirroring ThemeSelect. Welcome + layout chrome in en-GB + Cymraeg
      (incl. NHS Wales "Mwy na Geiriau"). `npm run check` 0/0, build ok, Lily
      no drift. Step/clinical content + other locales deferred; `docs/i18n.md`
      updated to the shipped-pilot pattern.
- [ ] Update every touched form's `CHANGELOG.md` (batchable; group features
      per release entry).

## Phase 4 — Documentation (WS4) ✅ COMPLETE (2026-07-12)

- [x] `CONTRIBUTING.md` — setup, spec-driven workflow, generated-artefact
      rules, the full verify-gate list, scratch-Postgres recipe, batching.
- [x] Populated `arc42/` — `index.md` + all 12 sections
      (`01-introduction-and-goals.md` … `12-glossary.md`), with Mermaid
      context/building-block/runtime/pipeline diagrams and 5 ADRs.
- [x] `docs/` suite — `index.md`, `architecture.md`, `data-model.md`,
      `generator-pipeline.md`, `scoring-engines.md`, `lily.md`,
      `back-end.md`, `verification.md`, `i18n.md`, `tools.md`. All
      cross-linked; grounded in the ACTUAL repo (corrected several brief
      assumptions: real grade-flag table names, Rust edition 2021, i18n
      unimplemented, semantic Lily class names).
- [x] `bin/generate-tools-doc.py [--check]` → `docs/tools.md` (parses each
      tool's source header — safe, no `--help` execution which has side
      effects). Wired into `bin/test-tools` + CI drift.
- [x] Linked `docs/index.md`, `docs/tutorials/`, `arc42/`, and
      `CONTRIBUTING.md` from `README.md` (index.md) and `AGENTS.md`.
      All doc/arc42/tutorial internal links verified resolving (0 broken).

## Phase 5 — Tutorials (WS5) ✅ COMPLETE (2026-07-12)

All under `docs/tutorials/`, numbered, each ending with a "verify you got
here" block; linked from `docs/index.md`.

- [x] `01-quickstart.md` — run one form locally (HTML static server, Svelte
      dev, Loco API + scratch Postgres).
- [x] `02-new-form.md` — full standard workflow on a disposable worked
      example (`example-screening-score`), with cleanup.
- [x] `03-scoring-engine.md` — pure engine + Vitest + golden vectors.
- [x] `04-generator-pipeline.md` — add a SQL column, regenerate, show diffs
      + what each `--check` catches.
- [x] `05-consume-the-api.md` — seeded crate, curl CRUD vs OpenAPI, FHIR
      Bundle export.
- [x] `06-lily.md` — theming + the lily `status`/`refactor`/`sync` tools.
- [x] `bin/test-tutorials` — fast, honest static check: extracts fenced `sh`
      blocks and fails if any referenced `bin/` tool or `forms/` path is
      missing (doc-rot gate). Runs clean: 6 tutorials, 110 references, 0
      failures. (Does NOT execute servers/builds — deliberate; those are
      covered by the other gates.)

## Phase 6 — Examples deepening (WS6) — BLOCKED on engine oracle

**2026-07-12 assessment:** the personas need an `expected` block (score/grade/
flags), and those values can only come from RUNNING each form's scoring engine
over the fixture. The Python fixture generator cannot compute them (the engines
are JS/TS/Rust). **Prerequisite: build a Node "oracle" harness** that, per form,
imports `front-end-with-html/js/{grader,rules,flags}.js`, runs it over a fixture,
and records the result — reused by both the Phase 2 `expected` block and these
personas. Once the oracle exists, persona scaffolding + fill is mechanical
(subagents, per-form spec defines what "flagged" means).

- [x] **Oracle foundation built:** `bin/test-engines` — a headless Node gate
      that loads each HTML front-end's scoring engine (retry-until-stable,
      types→rules→flags→grader order), discovers the grader + default-state
      factory, runs the grader over the default state, and asserts structured
      output. **PASS 220 / SKIP 63 / FAIL 0** (0 broken engines; 63 SKIP are
      ESM engines, inline computation, or unrecognized entry points, reported
      honestly via `--verbose`). Wired into `bin/test-tools` + CI. This is the
      reusable engine-execution half of the oracle; the remaining work is the
      per-form fixture→engine-state adapter that yields the actual `expected`
      score/grade/flags.
- [ ] Extend the fixture convention to three personas per form:
      `example-minimal.json`, `example-typical.json` (rename of current),
      `example-flagged.json` — each with `expected` scores/flags. Update
      `bin/generate-changelog-and-examples.py` scaffold + `--check`.
- [x] **Persona format + verifier built:** `bin/test-personas` — authors write
      realistic filled states in the engine's shape under
      `forms/<slug>/examples/personas.json`; `--update` computes `expected` by
      running the engine, default mode verifies it (regression oracle). Shared
      engine loader at `bin/lib/engine-loader.js`. Template authored +
      verified for `apgar-score` (3 personas: reassuring 8/10, moderately-low
      4/9, low 2/3). Wired into `bin/test-tools` + CI.
- [x] **44 forms** now have verified, deterministic, clinically-coherent
      personas (`bin/test-personas` PASS 44 / FAIL 0, twice-identical,
      `--update` yields zero diff). Reference batch (9) + 4 parallel batches
      (35): AAA, allergy, anaesthesiology, asthma, ADHD, audio-vestibular,
      audiology, blood-donation, bone-marrow, FIT, breast, CAGE, Caprini,
      Centor, cervical, Child-Pugh, COPD, C-SSRS, CAM, contraception, dental,
      derm, diabetic-eye, EPDS, EMT, endocrine, epilepsy, ergonomic (REBA),
      fall-risk (Morse), fertility, Framingham, gastro, Glasgow-Blatchford,
      GRACE, HAS-BLED — plus the reference 9.
- [ ] **Finding:** ~6 forms were skipped because their only whole-state
      grader stamps a live `new Date()` timestamp (dyslexia-, endometriosis-,
      first-responder-assessment; bhutani-bilirubin-nomogram;
      birth-control-assessment) with no deterministic band-producing entry to
      pin. Their `expected` cannot be reproduced. Worth a follow-up: refactor
      those graders to take an injected clock / split the timestamp out, so
      they become testable.
- [x] **108 forms** now have verified personas (`bin/test-personas` PASS 108 /
      FAIL 0, deterministic across the full corpus). Rounds: 9 reference + 35
      + 18 (F,H) + 18 (E,G re-authored) + 19 (I,J) + 9 (timestamp-unlocked).
- [x] **Timestamp-skip category CLOSED:** `bin/test-personas` now strips
      volatile timestamp fields (`timestamp`/`gradedAt`/…) before comparing,
      so graders that stamp `new Date()` are coverable. Re-authored all 9
      previously-skipped forms (dyslexia, endometriosis, first-responder,
      bhutani-bilirubin, birth-control, mental-state-examination,
      newborn-blood-spot, plastic-surgery, return-to-work). This obviated the
      earlier "refactor the graders to an injected clock" follow-up.
- [ ] Continue persona batches for the remaining scorable forms
      (subagents on the proven rail; `spec/index.md` defines the bands).
      63 forms are `test-engines` SKIPs (ESM/inline/nonstandard) — those need
      a bespoke driver first.
- [!] **Parallel-subagent hazard (lesson):** a leftover bulk-generator script
      in the shared scratchpad was found + run by two concurrent persona
      subagents; each script's "clean up my strays" `rm` deleted the OTHER
      batches' legitimate files (18 lost, then re-authored). When fanning out
      writers over a shared tree, instruct them to Write only their own target
      paths, never delete another item's output, and never run a pre-existing
      scratchpad script. Audit new-file counts against the dispatched set
      before committing.
- [ ] `example-invalid.json` per form + expected validation errors list;
      assert in the E2E harness (wizard blocks submission).
- [ ] CSV and TSV export samples per form matching the typical persona
      (generate via the Phase 3 export feature to guarantee fidelity).
- [ ] API transcripts per form: `examples/api-create.http` (or .md) with
      recorded request/response against the seeded crate.
- [ ] FHIR Bundles for the new personas; validate in the `fhir` CI job.
- [ ] Examples gallery page on `formexamples.github.io` (per-form card:
      description, personas, score ranges, links).
- [ ] Run E2E sweep against all three personas per form.

## Phase 7 — Special files + unsafe-forbid ✅ COMPLETE (2026-08-26)

- [x] `spec/special-files-for-public-repos/` implemented: `AI_STATEMENT.md`,
      `GOVERNANCE.md`, `MAINTAINERS.md`, `SECURITY.md`, `CODEOWNERS`,
      root `CHANGELOG.md`, `NEWS.md`, `INSTALL.md`, `COMPARISONS.md`,
      `BENCHMARKS.md`; SPDX in `LICENSE.md`; `CITATION.cff` enriched;
      ways-to-contribute in `CONTRIBUTING.md`; docs table in `index.md`;
      spec marked implemented with per-file status table.
- [x] `#![forbid(unsafe_code)]` on all 1,412 crate roots via new
      `bin/loco-forbid-unsafe` (idempotent; `--check` in CI drift job);
      generated `back-end-with-loco-setup` scripts now run it post-scaffold
      (355 regenerated); 5 sample crates compile clean.
- [x] `#![warn(clippy::clippy::pedantic)]` typo → `clippy::pedantic` in the
      3 crates carrying it (which surfaces real pedantic findings — Phase 8).

## Phase 8 — R0 gate truth ✅ COMPLETE (2026-08-26)

- [x] **Engine loader (2026-08-26):** deeper than the skip-list — the
      `STORAGE_KEY` collision was masking that the 2026-07 ES-modules
      conversion had made every engine unloadable by the classic-vm harness.
      Rebuilt `bin/lib/engine-loader.js` with a real-`import()` ESM path
      (temp-dir copy + `{"type":"module"}` package.json, browser-global
      stubs, merged exports; classic-vm fallback kept), added the helpers to
      `NON_ENGINE`, refactored `bin/test-engines` onto the shared lib
      (deleting its inlined duplicate loader). Result: `bin/test-engines`
      **PASS 279 / SKIP 76 / FAIL 0** (up from PASS 220 pre-breakage — the
      ESM path recovers forms the old harness couldn't load);
      `bin/test-personas` **PASS 109 / FAIL 0**, and `--update` produced a
      **zero diff** across all 109 personas.json — the ESM loader computes
      byte-identical results to the recorded oracle.
- [x] **Engine loader, second bug found 2026-08-27:** `NON_ENGINE` also
      excluded `form-validator.js` as a presumed generic DOM utility — but
      it's the actual scoring engine's entry file in all 4 forms that use
      that name (`code-of-conduct-notice`, `consent-to-treatment`,
      `medical-records-release-permission`,
      `research-and-planning-privacy-notice`), so the exclusion silently
      broke both `bin/test-engines` and `bin/test-personas` for all 4 —
      found authoring `consent-to-treatment`'s personas. Removed the
      exclusion (comment in the source records why). `test-engines`
      unaffected at the fleet level (still PASS 279/SKIP 76/FAIL 0 — the
      2 that now load land as PASS, offsetting 2 that were previously
      miscounted); `test-personas` PASS 183 after re-verifying.
- [x] **Dep bump (2026-08-26):** verified with a 4-way-parallel
      `cargo check --all-targets` over all 355 crates — **355/355 PASS,
      0 FAIL** (which also validates the forbid-unsafe rollout against
      loco-rs 1.1.0) — then committed as one change (`aa434eec9`).
- [x] **Clippy pedantic (2026-08-26):** cleared, not scoped out
      (`b2f26393c`). `cargo clippy --fix` for the mechanical tier; by hand:
      format_push_string → `write!`/`writeln!`, ptr_arg `&String`→`&str`,
      genuinely-redundant match arms merged, u64 counts → `usize::try_from`.
      Domain-shaped findings got scoped allows with one-line reasons
      (sql/-mirroring bool structs, linear rule lists, published band
      tables, 0-100 percentage casts). All 8 crates
      `clippy --all-targets -- -D warnings` clean; cardiology engine tests
      (12 + 15) pass unchanged.
- [x] **es-modules (2026-08-26):** diagnosed — the 36 forms are formatted
      at 8-space indent and the tool regenerated the script block hardcoded
      at 2-space, so `--check` flagged a byte diff that was pure whitespace.
      Fixed the tool to emit at the file's own indent (first script tag's
      leading whitespace). `--check --all` → 0 / 355 drifted.
- [x] **Re-pin + re-sync (2026-08-26):** re-pinned both Lily snapshots to
      upstream `e05a138e6` (HEAD had moved again past `7396cf295`). Content
      delta was tiny and inspected: HTML spec 491/491 unchanged; Svelte spec
      2 files (upstream's own ProgressCircle test ARIA fix
      `Progress`→`progressbar`, a Slider doc wording change) — no component
      source changed, no per-form rollout triggered. Then re-synced the theme
      catalogues fleet-wide (`svelte-theme-css-sync --apply`,
      `html-theme-locale-select-refactor --apply`): the only real change is
      the unwired date-time-picker's `:disabled`→`[data-disabled]` selectors
      (4 lines/theme). Canonicalized 2 divergent `locales.ts`
      (pre-anaesthesia-assessment, pre-operative-assessment-by-clinician)
      via `svelte-helpers-picker-rename --apply`. All Lily gates green;
      `bin/test-tools` 21 ok / 0 failed.
- [x] **Checkout-pin guards (2026-08-26):** new `bin/lib/lily_pin.py`
      (`assert_lily_pin`), wired into `svelte-theme-css-sync`,
      `html-theme-locale-select-refactor`, and
      `svelte-helpers-picker-rename` right after arg parsing. A resolvable
      checkout HEAD that contradicts the `forms/lily-version.md` pin now
      aborts with the two remedies (checkout the pin / deliberately re-pin);
      unverifiable checkouts (no `.git`, no pin file) proceed best-effort.
      Vindicated within the hour: upstream moved again (`e05a138e6` →
      `d891fff23`) and the tools now refuse cleanly instead of reporting
      355-form phantom drift. The pin deliberately stays at the inspected
      `e05a138e6` — no chasing an actively-moving upstream.
- [x] **`bin/test` without a DB (2026-08-26):** `bin/test-form` now probes
      `pg_isready` before the cargo-test gate and skips with an explicit
      per-crate notice when no Postgres is reachable (missing `pg_isready`
      counts as unreachable). Full `bin/test` on a DB-less machine:
      355/355 structural PASS in 33 s, exit 0, 355 honest notices —
      instead of dying at the first crate on `PoolTimedOut`.

## Phase 9 — R1 CI completeness + efficiency ✅ COMPLETE (2026-08-26)

- [x] **Drift job completeness (2026-08-26):** the ten repo-internal gates
      wired in (`416312a75`). `svelte-helpers-picker-rename` and
      `svelte-date-time-picker-vendor` turned out to read the local Lily
      checkout too, so all four checkout-readers stay maintainer-side with
      an in-YAML comment (same treatment as the lily-sync pair).
- [x] **Checkout-dependent gates (2026-08-26):** solved with a
      vendored-uniformity gate instead of cloning upstream in CI: new
      `bin/test-vendored-uniformity` proves both theme catalogues (4
      deliberate collision exemptions) and the five Svelte helper
      components + `locales.ts` are byte-identical across all 355 forms.
      Upstream currency remains the maintainer-run half, guarded by
      `bin/lib/lily_pin.py`.
- [x] **Changed-forms sharding (2026-08-26):** new `changes` job diffs the
      push/PR base and narrows the Rust + Svelte shard loops to touched
      forms; cross-cutting paths, unusable bases, `workflow_dispatch`, and
      the nightly schedule run the full fleet (so filtering narrows
      coverage by at most one day). npm dependency caching added to the
      svelte shards; `workflow_dispatch` trigger added.
- [x] **Weekly advisories job (2026-08-26):** Mondays 05:17 UTC, cargo-deny
      advisories over every crate's committed lockfile (no compilation);
      the other jobs are excluded from that cron. It caught a live finding
      before ever running: loco-rs 1.1's jsonwebtoken pulls rsa 0.9.10
      (RUSTSEC-2023-0071, no fixed release). deny.toml policy updated with
      the reachability argument (HS256 HMAC auth; no RSA algorithm
      configured), four stale 0.16-era ignores dropped, 355 regenerated,
      full `cargo deny` green on sampled crates.
- [x] **dependabot.yml (2026-08-26):** GitHub Actions + the site + the E2E
      harness, weekly; the 355-crate fleet deliberately excluded (lockstep
      sweeps, not 355 bump PRs — reasoning recorded in the file).
- [x] **Correction (2026-08-27) — "complete" above was gate-shape complete,
      not gate-*green*.** The first real push after v1.0.0 was checked
      against GitHub's actual run history: every CI run on this repository
      had failed or been cancelled — the Rust and Svelte matrices had
      never gone green, not once, including every run this phase's own
      commits triggered. Two independent, pre-existing, fleet-wide bugs,
      neither introduced this round:
      - **Rust, all 8 shards:** `loco new` scaffolds
        `App::seed(ctx: &AppContext, base: &Path)` (unused `base` —
        fixtures load via `env!("CARGO_MANIFEST_DIR")`) and the test
        `auth_header()` helper's `format!("Bearer {}", &token)` (redundant
        `&`, `token: &str` already a reference) — both fail
        `clippy -D warnings` by default, on 346/355 crates. New
        `bin/loco-seed-base-rename` and `bin/loco-test-auth-header-fix`
        (single-occurrence-per-file confirmed before writing, `--check`
        gated, wired into the setup script alongside `loco-forbid-unsafe`).
        24-crate sample across all 8 shards verified clippy-clean.
      - **Svelte, all 8 shards:** the job ran `npm ci`, but every
        `front-end-with-svelte` is its own pnpm project with no
        `package-lock.json` — `npm ci` has required one since npm 5 and
        failed immediately, every time. This predates the session; this
        round's own npm-caching addition pointed at the same nonexistent
        lockfile without catching the underlying bug. Switched to
        `pnpm/action-setup` + `pnpm install --frozen-lockfile` +
        `pnpm run check/build` + `pnpm exec vitest`, matching
        `bin/test-e2e --svelte` and the documented dev workflow. Full
        pipeline verified locally (check 0 errors, build green, vitest
        19/19) before committing.
      **Lesson for how "complete" gets claimed going forward:** a gate
      wired into `ci.yml` is a claim, not a fact, until a real CI run has
      gone green on it — local reproduction of individual steps is not a
      substitute for checking `gh run list`. Watch the next push's Rust
      and Svelte matrices before calling this phase actually done.
- [x] **Second correction, same day — the lesson above was immediately
      vindicated.** The push containing the fix above (`beea33fd4`) was
      watched through to its own real CI result rather than assumed green,
      and it wasn't: **Drift detectors failed** (`ModuleNotFoundError: No
      module named 'yaml'` — `bin/openapi/generate-openapi-combined.py`
      needs PyYAML, which the drift job's bare `actions/setup-python@v5`
      never installs; ran fine on the maintainer's machine only because
      PyYAML happens to be globally present there) and **all 8 Svelte
      shards failed again**, for a *different* reason than the one just
      fixed: `pnpm install --frozen-lockfile` under the CI-pinned pnpm 9
      hit `ERROR packages field missing or empty` — every one of the 355
      `pnpm-workspace.yaml` files was missing a `packages:` key, which
      pnpm 9 rejects outright and the maintainer's local pnpm 11 silently
      tolerates. Fixed both: `pip install pyyaml` added to the drift job;
      new `bin/svelte-pnpm-workspace-fix` adds `packages: ['.']`
      fleet-wide (355 files) and, found in the same file while there,
      normalizes `allowBuilds.esbuild` (a stray unfilled template string
      in 32 files, `false` in 1, `true` in the rest — confirmed the bad
      values don't themselves break the install, just wrong data) to
      `true`. Reproduced the original error and verified the fix with a
      **real pnpm 9 binary** (not the local pnpm 11, which cannot see
      this bug) across three sample forms: install, `check`, `build`, and
      `vitest run` all green. `--check`-gated, wired into the drift job.
      **Still unconfirmed by a real CI run — do not mark this phase
      actually done until the next push's Drift, Rust, and Svelte jobs
      are checked and green, not assumed.**
- [x] **Third correction, same investigation — confirmed, then found eight
      more.** Watching kept surfacing real bugs the local checks couldn't
      see, one real CI run at a time, right up to the first fully green
      run in this repository's history:
      - `test-vendored-uniformity` failed on two forms' `locales.ts`
        (regressed in a merge two days earlier) — restored from the
        fleet-uniform content.
      - The XML generator wrote unescaped element text (2 forms broke
        well-formedness on a literal `<` in a CHECK-constraint enum) and
        never cleaned up orphaned `.xml`/`.dtd` from a renamed/dropped
        table (260 files, 110 forms). Both fixed at the generator.
      - `@sveltejs/kit@3.0.0-next.23` renamed `$app/environment` to
        `$app/env`, dropping the old path's type declarations —
        `svelte-check` fails fleet-wide on it. **A first attempt
        misdiagnosed this as a missing `svelte.config.js`, applied it
        fleet-wide, and had to revert it** after re-verification showed
        kit 3.0-next hard-errors the moment that file exists; the actual
        fix (source imports already correct at `$app/env`; 7 forms'
        `vitest.config.ts` alias keys needed to follow) came from reading
        the installed `@sveltejs/kit` package's own bundled types, not
        from the error text alone.
      - 11 forms' `App::seed()` had a stray `let _ = base;` — a leftover
        reference to the parameter `bin/loco-seed-base-rename` had
        already renamed to `_base`, a hard compile error found only by
        actually compiling those 11 crates.
      - All 8 Rust shards failed identically on the runner's own "No
        space left on device" — ~44 independent crates per shard, no
        shared workspace, each leaving `target/` behind. Fixed by wiping
        each crate's `target/` once done, at the cost of rust-cache's
        cross-run warm start.
      - FHIR CI had never completed at all: the validator's default
        `tx.fhir.org` round-trip against 2,600+ files hung for hours.
        `-tx n/a` fixed the hang (~19s fleet-wide) and surfaced what it
        had been masking — 1,090 empty `valueString`s, every example
        Bundle's invalid `document` type, `DetectedIssue.severity` values
        outside FHIR's fixed set, two fabricated extension URLs.
      - The workflow's single `concurrency` group let a delayed nightly
        cron (GitHub queued a 03:17 UTC schedule run until 15:22 UTC)
        cancel a real, in-progress push run outright. Scoped by
        `github.event_name`.
      - `config/test.yaml`'s scaffold default `max_connections: 1`
        raced `cargo test`'s default concurrency
        (`SqlxError(PoolTimedOut)`) — a real, deterministic mechanism
        with an intermittent outcome, not unexplained flakiness. Raised
        to 10, fleet-wide.
      - The nightly E2E job's `e2e/.gitignore` excluded
        `package-lock.json` — `npm ci` had never had a lockfile to
        install from. Committed.
      **Confirmed, not assumed:** run
      [33213955606](https://github.com/FormExamples/form-examples/actions/runs/33213955606)
      — every job green: both matrices (8/8 Rust, 8/8 Svelte), FHIR,
      drift, SQL apply, structure. First fully green run in this
      repository's history. Phase 9 is now actually done.

## Phase 10 — R2 professionalization — tooling done; 3 maintainer decisions open

- [x] **Issue + PR templates (2026-08-26):** `.github/ISSUE_TEMPLATE/`
      (defect form; clinical-correctness form requiring a citation against
      the published instrument; config.yml contact links routing security
      to SECURITY.md's private path and press to NEWS.md) +
      `PULL_REQUEST_TEMPLATE.md` (spec-first / regenerate / gates /
      uniformity / CHANGELOG checklist, and the AI-disclosure section per
      `AI_STATEMENT.md` §10 — in the PR description, never trailers).
- [x] **Governance of settings (2026-08-26):** GOVERNANCE.md gains a
      Repository settings section (branch protection = the per-push CI
      checks required, no force push; review-requirement deliberately off
      at bus factor one — the honest control is the gates) and a 5-step
      release runbook. GitHub topics set from the fact sheet (14 topics,
      via gh); description left as the maintainer's wording.
- [x] **First release (2026-08-26):** the maintainer directed
      "commit, merge, push, publish" — v1.0.0 tagged per the GOVERNANCE.md
      runbook: CHANGELOG `[Unreleased]` cut to `[1.0.0]`, NEWS.md updated,
      annotated tag pushed to all three remotes, GitHub release created
      with the changelog section as notes. AI_STATEMENT.md reviewed —
      issued the same day, no changes needed.
- [ ] **Maintainer decision — Zenodo DOI** for `CITATION.cff` (link the
      GitHub repo to Zenodo before the first release so the release mints
      the DOI; then add the DOI to CITATION.cff and NEWS.md).
- [ ] **Maintainer decision — licence fit** of CC BY-NC-SA for a code
      corpus (COMPARISONS.md names it a weakness). Decide and record in
      the spec; if it ever changes, LICENSE.md, CITATION.cff, and
      AI_STATEMENT.md §8 move together.

## Phase 11 — R3 functionality carry-overs (from Phases 3/6)

- [ ] Form export/import (JSON/XML/CSV/TSV) — design on the reference forms,
      roll out mechanically with a `--check` tool (Conventions promise).
- [ ] Loco: per-crate seeder from `examples/` + serve `combined/openapi.yaml`
      at `/api/openapi.yaml` (second half of serve-OpenAPI).
- [ ] Personas: **225/355 verified** (`bin/test-personas` ground truth,
      not hand-tracked — the incrementally-tracked count in this entry had
      drifted from it; was 109). 2026-08-26: the whole
      `*-waiting-list-card` family (56 forms) done in one batch — the family
      engine is template-identical (2 comment lines differ), so three RTT
      scenarios (within-target / approaching-breach+interpreter /
      52-week-breach+harm-review) were authored once and specialized per
      specialty; `bin/test-personas` gained per-persona `options` so the
      family's clock-derived grader pins `todayIso` (without it the oracle
      rots daily — the reason this family was never covered). A separate
      batch of 39 bespoke single-document forms (not the `*-test-request`
      suffix family below — admin/clinical documents like referral letters
      and training checklists) had 21 done 2026-08-26 in 9 pairs, 3 personas
      each, grounded in the engines' own rule sets: cardiology-request/response,
      inpatient-clinical-note, medical-operation-note,
      who-surgical-safety-checklist, emergency-department-triage-note,
      partogram, post-anaesthesia-care-unit-record, soap-note,
      nursing-care-plan, medical-error-report, child-safeguarding-referral —
      the last with its live-clock overdue flag deliberately unexercised,
      noted in the persona file — general-practitioner-referral-letter,
      history-and-physical-examination, advance-decision-to-refuse-treatment,
      advance-statement-about-care, cardiopulmonary-resuscitation-training,
      consent-to-treatment, employee-onboarding-checklist,
      first-aid-training-checklist, medical-records-release-permission; 18 of
      that batch remain. Remaining frontier: 37 `*-test-result` (13 already
      had verified personas from earlier, pre-this-tracking work — this
      entry's "37 not started" had drifted from that ground truth, the
      same class of error the 2026-09-02 *-test-request correction below
      fixed; 24 remained as of 2026-09-02) and 39 `*-test-request` — NOT
      template-identical, per-form panels/rules, needs real per-form
      batches; confirmed 2026-09-02 that **all 39 have a working
      `calculateGrade` engine** (none are
      engine-SKIP) via `bin/test-engines --verbose`, so every one is
      immediately actionable. 18 done 2026-09-02 (angiography-test-request,
      blood-test-request, x-ray-test-request, mri-scan-test-request,
      coagulation-test-request, lumbar-puncture-test-request,
      allergy-skin-test-request, electrocardiogram-test-request,
      genetic-test-request, biopsy-test-request, cytology-test-request,
      cardiac-stress-test-request, ambulatory-blood-pressure-test-request,
      blood-cross-match-test-request, endoscopy-test-request,
      ct-scan-test-request, echocardiogram-test-request,
      urinalysis-test-request — each 3 personas spanning a
      well-formed/routine, a caution/escalated, and a
      contraindicated-or-reject/incomplete scenario, verified field-by-field
      against that form's own `js/rules.js` + `js/form-app.js` option lists
      before running `--update`, not just accepting whatever it computed;
      cytology-test-request's pre-analytical axis is clock-derived
      (`Date.now()`), so its personas were designed to land in a band that
      doesn't drift as real time passes — not-yet-collected or a timestamp
      far enough in the past — rather than a narrow window a fixed date
      would age out of, the same rot risk `*-waiting-list-card` hit first).
      3 more done 2026-09-02 (colonoscopy-test-request,
      dexa-bone-density-test-request, mammography-test-request — same
      per-form-verified methodology; colonoscopy's FIT-value and dexa's
      scan-region persona drafts each had a design error caught by
      cross-checking the computed `expected` against the intended clinical
      narrative before treating the persona as done, fixed before commit).
      3 more done 2026-09-02 (bronchoscopy-test-request,
      cystoscopy-test-request, electroencephalogram-test-request — same
      methodology; electroencephalogram's third persona exercises a
      distinctive rule unique to that engine — NICE NG217's
      eeg-not-to-exclude-epilepsy guideline-misuse flag, detected from
      clinical-question free text, forces query-referrer independently of
      the appropriateness band). 3 more done 2026-09-02
      (eye-vision-test-request, fluoroscopy-test-request,
      hearing-test-request — same methodology; fluoroscopy's third
      persona exercises a distinctive `redirect` recommendation unique to
      that engine — barium requested for suspected perforation forces a
      `contraindicated` safety band, which short-circuits straight to
      `redirect` in `deriveRecommendation` ahead of the appropriateness
      check, even though the same mismatch would independently have
      earned a `query-referrer` verdict on its own). 3 more done
      2026-09-02 (histopathology-test-request,
      holter-monitor-test-request, microbiology-culture-test-request —
      same methodology; holter-monitor's engine adjusts its raw
      indication-fit score by a symptom-frequency/monitor-duration match
      (+1/-1/-3, capped 1-9), so its `redirect` persona shows a score of
      5 despite an "ideal" indication pairing; microbiology-culture's
      `deriveRecommendation` is stricter than its siblings — a `caution`
      pre-analytical band alone (not just `reject-risk`) forces
      query-referrer, so its second persona is stat-tier triage yet
      still query-referrer, and its third persona is this backlog's
      first `reject` outcome, from a blood culture drawn after
      antibiotics were already started). 3 more done 2026-09-02
      (nerve-conduction-study-test-request, nuclear-medicine-test-request,
      pet-scan-test-request — same methodology; nerve-conduction-study's
      third persona isolates its procedural-risk-high query-referrer path
      from an otherwise-ideal indication pairing (needle EMG vs
      anticoagulation), distinct from the usual appropriateness-mismatch
      route; nuclear-medicine repurposes `redirect` to mean "Accept with
      safety caution" (a high-dose study alone lifts prep-safety from ok
      to caution) and contributed this backlog's second `reject` (confirmed
      pregnancy); pet-scan's sibling engine is stricter — caution forces
      plain query-referrer, not an accept-with-caution redirect — and its
      reject persona (confirmed pregnancy again) is a third such outcome;
      pet-scan's dose and prep-safety axes are also fully independent,
      unlike nuclear-medicine's, so even its well-formed persona carries a
      non-blocking high-dose flag). 3 more done 2026-09-02
      (pregnancy-ultrasound-test-request, pulmonary-function-test-request,
      sleep-study-test-request — same methodology; pregnancy-ultrasound's
      distinctive Axis B is a gestational-age window fit, not a safety
      band — its `redirect` persona is an ideal indication/scan-type
      pairing at a gestation far outside that scan's window, recommending
      the scan type that actually fits; sleep-study mirrors holter-
      monitor's score-adjustment pattern (+1/-1 for Epworth/STOP-BANG
      evidence on OSA-pathway indications) and its first persona
      deliberately has evidence present but below threshold, so neither
      adjustment fires; pulmonary-function's `redirect` means 'Defer /
      redirect' — a fourth distinct semantic for that label in this family
      (compare fluoroscopy's literal redirect, holter-monitor's redirect-
      to-a-different-monitor, and nuclear-medicine's accept-with-caution)).
      Final 3 done 2026-09-02 (toxicology-test-request,
      tumor-marker-test-request, ultrasound-test-request — same
      methodology; tumor-marker-test-request's third persona is a verified
      *engine finding*, not just a persona design choice — its `redirect`
      recommendation (interpretationBand === 'misuse-risk') is unreachable
      in practice, because `scoreAppropriateness` forces
      `usually-not-appropriate` in the exact same broad-screening case that
      `scoreInterpretation` forces `misuse-risk`, and `deriveRecommendation`
      checks the appropriateness band first — so screening misuse always
      resolves to query-referrer, confirmed by running `--update` rather
      than assumed).
      **`*-test-request` family COMPLETE: 39/39 forms have verified
      personas** (count re-verified directly against the fleet each
      update, not hand-tracked, after the 2026-09-02 tracking-drift
      correction). Moved on to the `*-test-result` family (the report/
      interpretation counterpart, per-form but structurally parallel:
      resultClassification / abnormalitySeverity+reportingCategory /
      reportCompletenessPercent / followUpUrgency, same
      read-rules.js-then-author-3-personas-then-`--update` method); all 37
      confirmed engine-actionable via `bin/test-engines --verbose` (none
      SKIP), and these engines stamp a `gradedAt` wall-clock ISO timestamp
      that `bin/test-personas` already strips via its volatile-key regex,
      so no special pinning was needed. 3 done 2026-09-02
      (blood-test-result, blood-cross-match-test-result,
      bronchoscopy-test-result — each form's `hasCriticalFinding`-style
      predicate bundles some, but not all, of its major-severity triggers;
      every form's second persona deliberately isolates a major/abnormal
      finding that is *not* in that predicate — blood-cross-match's
      insufficient-units, bronchoscopy's extrinsic central-airway
      compression — to verify the non-critical-alert path actually stays
      non-critical-alert, not just the obvious critical path). 3 more
      done 2026-09-03 (coagulation-test-result, colonoscopy-test-result,
      ct-scan-test-result — the last is this family's gold template;
      coagulation's second persona confirmed a genuine dead-code branch
      (`R-FU-RECOMMENDED-03`, an isolated-APTT-specific follow-up message)
      is unreachable, since `gradeSeverity` always routes isolated APTT
      prolongation through the generic 'moderate' severity first, which
      `gradeFollowUp`'s `severity === 'moderate'` check catches before
      ever reaching the dedicated branch — confirmed by running
      `--update`, the same class of finding as tumor-marker-test-request's
      unreachable `redirect` from the prior *-test-request batch;
      ct-scan's second persona instead covers the one severity band
      (`minor`, incidental-only) not yet exercised by this family's other
      forms this backlog, and confirmed that same follow-up branch IS
      reachable there, unlike coagulation's). 3 more done 2026-09-03
      (cystoscopy-test-result, cytology-test-result,
      eye-vision-test-result — same methodology; cytology's critical/
      low-grade detection is keyword-based (scans `cytologyResultCategory`
      + `reportingCategory` text for substrings like "high-grade" /
      "malignant" / "thy5" / "c5"), not purely boolean-driven, and its
      third persona's narrative deliberately includes "suspicious" (a
      low-grade trigger word) to confirm the sibling urgent-referral flag
      still correctly stays suppressed once hasCriticalFinding is already
      true; eye-vision's second persona confirms background diabetic
      retinopathy (R1) is deliberately not "referable" per NHS Diabetic
      Eye Screening Programme criteria, so it grades minor severity, not
      major, distinct from pre-proliferative / proliferative / maculopathy).
      3 more done 2026-09-03 (fluoroscopy-test-result,
      hearing-test-result, histopathology-test-result — same
      methodology; fluoroscopy's second persona isolates a fistula
      finding, which grades major severity via its own dedicated rule
      but is deliberately not one of the two triggers in
      `hasCriticalFinding` (perforation/leak, obstruction), so it
      escalates only to 'urgent' follow-up, not 'critical-alert';
      hearing's second persona isolates a conductive-component finding
      (bilateral otosclerosis) that grades only moderate severity via
      its own actionable-finding rule, distinct from the PTA-severity
      ladder and from `hasCriticalFinding`'s sudden-SNHL/asymmetry
      triggers; histopathology's engine has the richest split of this
      family — malignancy alone is not a critical finding, only an
      *unexpected* malignancy (no linked originating request) or an
      involved resection margin is — so the second persona confirms a
      biopsy-anticipated, originating-request-linked colorectal
      adenocarcinoma classifies abnormal + moderate severity and drives
      urgent MDT follow-up without ever reaching critical-alert, while
      the third persona's incidental appendiceal adenocarcinoma with no
      originating request confirms the true unexpected-malignancy
      critical path). 3 more done 2026-09-03 (holter-monitor-test-result,
      lumbar-puncture-test-result, mammography-test-result — same
      methodology; holter's second persona isolates paroxysmal atrial
      fibrillation with a controlled ventricular rate (max 132 bpm,
      below the 150 bpm `FAST_AF_MAX_HR_BPM` threshold), which grades
      only moderate via its own dedicated AF rule, distinct from
      `hasCriticalFinding`'s fast-AF/VT/pause>3s/high-grade-AV-block
      triggers — and separately confirmed `F-UNEXPECTED-FINDING-001`
      checks only AF/VT/high-grade-AV-block, not a significant pause, so
      the third (critical, pause-only) persona never raises it even with
      no originating request linked; lumbar-puncture's second persona
      isolates `viralPattern` (its own moderate-severity trigger) with
      an explicitly negative culture ('No growth'), confirming
      `culturePositive`'s negative-phrase matching correctly keeps a
      markedly raised white-cell count off the bacterial/critical
      pathway; mammography is the family's first BI-RADS-driven engine —
      classification and follow-up are keyed off the ACR BI-RADS final
      assessment category rather than the structured-finding booleans,
      and the second persona isolates BI-RADS 4a (`isBiRadsUrgent`,
      urgent biopsy referral) to confirm it stays short of
      `isBiRadsCritical` (BI-RADS 4c/5 only), distinct from the third
      persona's BI-RADS 5). 3 more done 2026-09-03
      (microbiology-culture-test-result, mri-scan-test-result,
      nerve-conduction-study-test-result — same methodology;
      microbiology-culture's second persona isolates MRSA on a
      significant wound-swab culture, which grades major severity via
      its own dedicated resistant-organism rule (R-SEV-MAJOR-02) yet
      classifies only abnormal (not critical) and escalates only to
      'urgent', since `hasCriticalOrganism` requires a positive blood
      culture, a CSF isolate, CPE, or the explicit criticalOrganism
      flag — none of which a resistant wound-swab organism trips; also
      caught and fixed a self-authored gap where the first ("complete")
      persona's antibiotic-sensitivities section was left blank for a
      no-growth culture, silently capping completeness at 80% instead
      of the intended 100%, verified and corrected via `--update` before
      accepting. mri-scan's second persona isolates a large (>= 30mm)
      but non-compressive meningioma, which grades major severity via
      its own dedicated large-lesion rule (R-SEV-MAJOR-02) entirely
      separate from `hasCriticalFinding` (cord compression, haemorrhage,
      infarct only), so it escalates only to 'urgent'. nerve-conduction-
      study's `isSevereAcuteNeuropathy` critical trigger requires
      severity 'severe' AND pattern 'demyelinating' specifically — the
      second persona's severe *axonal* diabetic polyneuropathy grades
      major severity via the general severe-abnormality rule but never
      trips the critical predicate, since only the acute demyelinating
      (GBS-like) pattern is treated as the medical emergency, distinct
      from the third persona's motor-neurone-disease critical path).
      3 more done 2026-09-03 (nuclear-medicine-test-result,
      pet-scan-test-result, sleep-study-test-result — same methodology;
      nuclear-medicine's second persona isolates a reduced ejection
      fraction (< 40%) on a myocardial perfusion gated SPECT, a
      dedicated major-severity rule checked BEFORE the perfusion-defect
      actionable-finding rule and entirely independent of
      `hasCriticalFinding` (a perfusion defect only counts toward
      critical on a `vq-lung-scan`, never on myocardial-perfusion), so
      it escalates only to 'urgent'; pet-scan's second persona isolates
      a high SUVmax (>= 10) primary lesion with no nodal or distant
      spread, a dedicated major-severity rule wholly separate from
      `hasCriticalFinding` (distant metastasis / progressive disease
      only); sleep-study's `hasCriticalFinding` requires severe OSA
      (AHI >= 30) TOGETHER WITH significant desaturation (or nocturnal
      hypoventilation alone) — the second persona's severe OSA (AHI 42)
      with no significant desaturation grades major severity via the
      AHI band alone but never trips the critical predicate, distinct
      from the third persona's severe-OSA-plus-desaturation critical
      path). Final 3 done 2026-09-03 (tumor-marker-test-result,
      ultrasound-test-result, x-ray-test-result — same methodology;
      tumor-marker's engine is the family's odd one out — measured
      NUMERIC marker values, not structured-finding booleans — and its
      `isCriticalResult` covers only a reported-critical overall status
      or a very-high-AFP/beta-hCG germ-cell pattern, so the second
      persona's markedly elevated but *stable* (not rising) CA125 on
      ovarian-cancer surveillance classifies abnormal and grades
      moderate via `hasActionSignal` without ever reaching critical;
      also confirmed `deriveRecommendation` maps moderate severity to
      'urgent-review' here (not 'specialist-referral' as in most
      siblings), since tumour markers are poor screening tests and any
      actionable elevation warrants prompt oncology correlation
      regardless of band. ultrasound's second persona isolates a large
      (>= 30mm) indeterminate hepatic mass, a dedicated major-severity
      rule wholly separate from `hasCriticalFinding` (DVT present or
      aneurysm only). x-ray's `hasCriticalFinding` requires an
      *unstable* fracture specifically — the second persona's stable,
      minimally displaced distal radius fracture grades only moderate
      severity via the general actionable-finding rule and never trips
      the critical predicate, distinct from the third persona's
      pneumothorax critical path.
      **All 37 of 37 `*-test-result` forms now have hand-curated
      personas — this sub-family of Phase 11 is COMPLETE** (count
      re-verified directly against the fleet each update, not
      hand-tracked — `bin/test-personas` ground truth: PASS 270/355,
      up from the family's starting baseline). Next frontier identified
      2026-09-03: of the 76 engine-SKIP forms (`bin/test-engines
      --verbose`), 355 - 279 PASS = 76 SKIP is unchanged, but
      cross-referencing the 85 forms fleet-wide still without a
      personas.json against that PASS list surfaced **19 forms with a
      working grader that were simply never reached** — not part of the
      `*-test-result`/`*-test-request`/`*-waiting-list-card` families,
      spanning several distinct older engine shapes (single custom
      grader function names rather than a uniform `calculateGrade`;
      one, gynecology-assessment, uses a `symptom-grader.js` +
      `symptom-rules.js` + `flagged-issues.js` split instead of the
      `rules.js`/`grader.js`/`flags.js` convention). 3 done 2026-09-03
      (neurodiversity-adjustment-request, neurodiversity-adjustment-response,
      arc42 — completing the neurodiversity request/response pair
      alongside the already-personad neurodiversity-adjustment-review).
      neurodiversity-adjustment-request's second persona isolates the
      weakest-tier `R-ELIG-NEURODIVERGENCE-PRESENT` eligibility rule and
      the 'soon' priority tier (burnout escalation, distinct from
      'urgent' which needs absence risk or severe impact).
      neurodiversity-adjustment-response's second persona isolates a
      *justified* decline (rationale + a real decline-reason category)
      which caps legal risk at 'caution' via R-LEGAL-DECLINE-JUSTIFIED,
      distinct from the third persona's unjustified, escalated decline
      that independently trips two separate high-risk rules; also
      confirmed a genuine engine quirk — `deriveRecommendation`'s
      waterfall bottoms out at 'implement' for a declined response with
      nothing agreed and no escalation, there is no dedicated "decline
      acknowledged" outcome. arc42's maturity algorithm needs ALL 12
      arc42 sections individually 'complete' before it even checks the
      four mature-band drivers (>=5 non-draft ADRs, >=3 fully-populated
      quality scenarios, >=3 mitigated risks, no medium-priority flag);
      the second persona meets every section's own (lower) threshold
      without meeting the mature drivers (ready, not mature), the third
      strengthens exactly those three counts to cross into mature with
      zero fired flags — all three bands (draft/ready/mature) matched
      hand-derived predictions exactly on first `--update`, including a
      literal 12-flag draft persona and a 0-flag mature persona.
      3 more done 2026-09-03 (genetic-assessment, gynecology-assessment,
      hernia-diagnostic-evaluation — same methodology, three more
      distinct older engine shapes: genetic-assessment's
      `calculateRisk` (a `risk-grader.js`/`rules.js`/`flagged-issues.js`
      weighted-score split, 23 individually-weighted risk rules summed
      into a 0-2/3-5/6+ Low/Moderate/High band) and
      gynecology-assessment's `calculateSymptomScore`
      (`symptom-grader.js`/`symptom-rules.js`/`flagged-issues.js`, a
      10-item 0-30 Menstrual Symptom Severity Score where items 7-10 are
      *derived* — `min(3, round(totalPhysical/6))` applied identically
      to all four — not independently rated) both compute their risk
      score/severity via one exported function while `flagged-issues.js`'s
      `detectAdditionalFlags` stays a separate, uncombined function not
      covered by `expected` (unlike the `*-test-result` family's single
      `calculateGrade` that already folds flags in) — noted explicitly
      in each persona file's top-level `note` rather than assumed;
      hernia-diagnostic-evaluation's `calculateHerniaEvaluation` is a
      real four-axis+flags composite (classification, reducibility,
      red-flag screen, red-flag-first urgency band) — its second and
      third personas isolate 'urgent' (irreducible, no red flags) from
      'emergency' (irreducible AND red-flag-positive, which fires only
      the emergency urgency rule since red-flag-first returns before
      the reducibility branch is ever reached), and both also verified a
      genuine engine quirk: `examInconclusive` trips whenever a
      cough-impulse is NOT elicited even with a confirmed palpable
      mass — true whenever the hernia doesn't currently reduce — so the
      occult-hernia-suspected flag fires in both the urgent and the
      emergency persona despite a clinically confirmed diagnosis in
      each. All three forms' personas matched hand-derived predictions
      exactly on first `--update` (one persona's descriptive prose,
      not its `expected` JSON, needed a same-turn arithmetic fix:
      gynecology-assessment's severe persona was hand-computed as 26,
      confirmed by the tool as 27, and the description corrected to
      match). 3 more done 2026-09-03
      (hip-replacement-surgery-evaluation, care-privacy-notice,
      international-patient-summary — all matched on first `--update`).
      hip-replacement's `deriveCandidacy` is rule-ordered with the
      conservative-not-exhausted gate checked first, so its first persona
      is a would-be 'candidate' on OHS 26 / KL 2 forced to
      'continue-conservative'; the second isolates the 'mdt-review'
      fallback (KL 3 imaging but OHS 34, outside the 'candidate' rule's
      OHS <= 29); the third exercises the clinician override
      (strong-candidate computed, mdt-review final, reason recorded) and
      confirms flags are unaffected by it. care-privacy-notice is a
      three-check acknowledgement validator with no severity axis and no
      flags module. international-patient-summary's `validateIPS` grades
      complete / partial / incomplete over 8 mandatory + 2 optional
      ISO 27269 sections, and the second persona confirms the
      'no-known-allergies' substance marker counts as a populated
      allergies section. **Two more `bin/test-engines` discovery
      mis-picks for the Phase 13 tooling item:** it chose `scoreOhs`
      (OHS sub-instrument, no candidacy/flags) over
      `calculateHipEvaluation`, and — worse — `classifyCompleteness`
      for the IPS, a function that takes a *counts* object, not the
      assessment; it only "passed" on the empty assessment because every
      property read was undefined and `undefined < undefined` is false,
      yielding 'complete'. Both persona files set `graderHint`
      explicitly. 3 more done 2026-09-03 (substance-abuse-assessment,
      systematic-coronary-risk-evaluation-2-diabetes,
      united-kingdom-statement-of-fitness-for-work — all nine personas
      matched on first `--update`, including a 21-rule / 11-flag critical
      substance case). substance-abuse's `deriveOverallRisk` is a max
      over three inputs (highest fired grade, AUDIT total, DAST total),
      so the second persona reaches 'high' with no grade-4 rule at all
      and zero flags; both it and SCORE2 fold `detectAdditionalFlags`
      into the graded result (so flags ARE pinned here, unlike the
      split engines) and stamp a `timestamp` the oracle strips.
      SCORE2's category is the max fired-rule level shifted one band up;
      the very-high persona verified the percent→mmol/mol IFCC
      conversion (10.2 % → 88.0) and that the metformin-first-line flag
      is deliberately suppressed at eGFR < 30. The fit note is a
      single self-contained engine whose `safetyFlags` are returned in
      push order, NOT sorted by priority (the only engine in this
      backlog that doesn't sort); its third persona confirms validity
      supersedes both the automatic-disability (regex on free-text
      diagnosis, explicit field blank) and over-max-period
      recommendations. 3 more done 2026-09-03 (vaccinations-checklist,
      post-operative-report, patient-reported-outcome-measures — all
      nine personas matched on first `--update`). vaccinations'
      `calculateVaccinationGrade` folds flags in; its critical persona
      (13 rules, three at grade 4, six flags, five missing vaccinations)
      confirms that anaphylaxis history alone does NOT reach the
      'contraindicated' status — that branch needs
      `liveVaccineContraindicated` or immunocompromised+anaphylaxis —
      so a needlestick-exposed HCA with prior vaccine anaphylaxis lands
      on 'non-compliant'/'critical' via the grade-4 rules instead.
      post-operative-report is a split engine (`calculateClavienDindo`
      + a separate `detectAdditionalFlags` that form-app.js composes at
      render time), so flags are unpinned there — and **a third
      discovery mis-pick:** `bin/test-engines` chose `gradeOrder` (the
      grade-key → ordinal helper) over the composite. Its edge persona
      pins the ungraded-entry behaviour: a blank middle complication is
      skipped for grading and count but still consumes its `CD-<index>`
      id, leaving a CD-1 / CD-3 gap. PROM's `computeAllScores` is a
      pure four-instrument aggregator with no bands beyond NDI/mJOA and
      no flags; the partial persona pins the answered-items-only
      denominators (SF-36 domain means drop nulls; NDI /45 for a
      non-driver) and the raw JavaScript floats (83.33333333333333,
      0.6910000000000001), and the all-worst persona pins the negative
      EQ-5D index (33333 → −0.594, worse-than-dead on the Dolan UK TTO
      scale). 3 more done 2026-09-03 (outpatient-outcome,
      recommended-summary-plan-for-emergency-care-and-treatment,
      ward-round-note — all nine matched on first `--update`).
      outpatient-outcome's OOCG is a worst-of-four-domains grade with
      flags folded in; its personas pin two quirks: `eq5dSummary`
      counts the VAS as a sixth "dimension" in FLAG-PROM-001's message,
      and the PROMIS item-9 recode reaches 6 at pain 0, so the linear
      T-score can exceed its nominal ceiling (personas stay on-scale).
      ReSPECT is a split engine (`gradePlan` + a wall-clock-dependent
      `detectFlaggedIssues`), so flags are unpinned; `completenessPercent`
      counts field-slots (14, or 15 when the person lacks capacity),
      not passed rules, and every mandatory rule is always listed with
      a `satisfied` boolean. ward-round-note's `assess` folds flags in;
      its two 5-of-8 (63 %) personas land on 'partial' vs 'incomplete'
      purely on whether the plan is documented, and pin that
      `vteStatus: 'not-done'` counts as documented while raising the
      high-priority VTE flag. **Two more `bin/test-engines` discovery
      mis-picks** (six total, Phase 13 item updated): ReSPECT
      `completenessPercent` (a bare number) and ward-round-note
      `calculateGrade` (the intermediate tally — no status, no flags —
      over `assess`). Last one done 2026-09-03
      (lifeguard-certification-checklist — all three matched on first
      `--update`): `gradeLifeguard` is a split engine (flags take the
      grading result and use `Date.now()` for the expired-certificate
      flag, so unpinned) that always lists all 46 rules with a tri-state
      status; its personas pin the numeric fallbacks (50 m time and CPR
      rate+depth derive the rule only when the explicit tri-state is
      blank), that 'na'/'' are excluded from `answeredCount`, that any
      number of non-critical 'no' is 'needs-development' (the >2 branch
      is dead — same outcome), and that an unmarked sheet is 'fail',
      not a vacuous pass. **The 19-form engine-actionable sub-family is
      COMPLETE (19/19)**, closing the persona backlog for every form
      `bin/test-engines` can currently load — `bin/test-personas`
      ground truth: PASS 289/355; verified by set intersection that all
      66 remaining "no personas" forms lie inside the 76-form
      engine-SKIP set (the other 10 SKIP forms already gained personas
      earlier via an explicit `graderHint`). The remaining
      66 of the 76 engine-SKIP forms (`grader not found` / needs a
      fuller input / returns a bare object or boolean / no engine
      namespace published) need discovery-hint fixes in their engines
      before any persona work is possible — a distinct, harder
      follow-on task from the 19 above. Then `example-invalid.json` +
      wizard-blocks-submission E2E assertion; API transcripts; FHIR bundles
      for personas; site examples gallery.
- [ ] Latent: snake_case↔camelCase API contract (283 crates + snapshot
      regen); i18n past the Welsh pilot.

## Phase 12 — R4 optimizations ✅ COMPLETE (2026-09-02)

- [x] **Document shared `CARGO_TARGET_DIR` + sccache in CONTRIBUTING.md
      (2026-09-02)** — new "Rust build performance (355 crates)" subsection
      under Environment, linking to the existing (but undiscoverable —
      no guide linked to it) `docs/rust/index.md` sccache setup page for
      detail. Also fixed that page's "sscache" → "sccache" typo (heading +
      two mentions in prose; the actual shell commands were already
      correct) while touching it.
- [x] **Add `--svelte` E2E sweep to the nightly job alongside `--html` (2026-09-02).**
      Found two real gate-truth bugs in `bin/test-e2e` while wiring this up —
      exactly the class of defect Phase 8/9 fixed elsewhere, so fixed rather
      than carried: (1) the svelte loop's `pnpm install && pnpm run build`
      had no failure guard, so under `set -eu` one bad form's install/build
      failure aborted the *entire* fleet sweep rather than being reported
      and skipped; (2) the per-form Playwright test result was swallowed by
      a trailing `|| true` with no aggregate failure tracking at all, so the
      svelte sweep could never turn the job red regardless of how many forms
      failed their a11y smoke check — a gate that cannot fail is not a gate.
      Both fixed: failures are now caught per-form, reported, and the script
      exits 1 if any form failed, while still running every other form.
      Verified against 25 forms (random sample across families) passing,
      plus both failure paths (install failure, and — by construction, same
      code path as the playwright branch — test failure) exercised directly.
      CI: added `pnpm/action-setup@v6` to the `e2e` job and a second step
      running `bin/test-e2e --svelte --all` after the existing `--html` one.
- [ ] Theme-catalogue size: leave as-is unless a need appears (byte-identical
      copies; git stores ~90 blobs — working-tree cost only); revisit only
      with a measurement.

## Phase 13 — R5 engine findings surfaced by the persona oracle (added 2026-09-03)

Every item here is a *verified* finding from hand-deriving personas against
an engine and confirming with `bin/test-personas --update` — not a guess.
The persona files record each one in their top-level `note`; this phase
turns them into work. Per `spec.md` §10, each engine change below starts by
updating that form's `spec/index.md`, then the engine in **all three stacks**
(HTML `js/`, Svelte `src/lib/engine/`, Loco), then the SQL `grade_rule` /
`grade_flag` seed rows where rule/flag IDs change, then `bin/test-personas
--update <slug>` to re-pin the oracle, then `bin/test-personas` fleet-wide.

### Engine correctness (decide: bug or spec'd behaviour; then fix or document)

- [x] **pre-operative-assessment-by-clinician: a recent stroke/TIA with no
      day count grades ASA I (silent, most severe finding of the three
      below).** FIXED 2026-09-06. `historyStrokeTia: 'yes'`,
      `recentStrokeTia: 'yes'`, `daysSinceStrokeTia: null` (clinician
      affirms it was recent but hasn't entered the day count yet):
      R-ASA-IV-02's `(daysSinceStrokeTia ?? 999) <= 90` evaluated `false`
      for a null day count, and R-ASA-III-04's own guard
      (`recentStrokeTia !== 'yes'`) was also false — neither fired, so
      `calculateASA` over that input (all else blank) returned
      `computedAsaGrade: 'I'` with only `R-RCRI-04` fired (a cardiac-risk
      component, not an ASA rule): a clinician-affirmed recent stroke
      silently passed as the *lowest possible* ASA grade instead of the
      fail-safe worst case. Fixed by changing R-ASA-IV-02's fallback from
      `?? 999` to `?? 0` in HTML `js/asa-rules.js` and the SvelteKit
      `src/lib/engine/asa-rules.ts`; R-ASA-III-04 needed no change (its own
      `?? 0` already correctly stays suppressed once `recentStrokeTia`
      reads `'yes'`). The current `back-end-with-loco` is a JSON-only API
      with no scoring logic of its own — `back-end-with-loco/todo/` is a
      superseded, unwired Tera/HTMX prototype, not one of this form's live
      stacks, so it was correctly left untouched. Documented the decision
      in `spec/index.md` §3, added a 4th persona
      (`asa-recent-stroke-tia-day-count-unrecorded`) pinning the fixed
      behaviour (now grades ASA IV, `compositeRisk: 'high'`), and updated
      the personas file's top-level `note`. Verified: the existing 3
      personas for this form were unaffected (none exercised this exact
      combination); `npx vitest run` on this form's
      `composite-grader.test.ts` still 29/29 passed (no prior test
      asserted the old, buggy behaviour); `bin/test-personas
      pre-operative-assessment-by-clinician` 4/4 PASS; `bin/test-e2e --html
      pre-operative-assessment-by-clinician` 2/2 passed. Fleet:
      `bin/test-personas` forms 352/352 PASS, personas 1173/1173 PASS,
      0 FAIL.
- [x] **perioperative-optimization: an entirely blank assessment reports
      'ready' with zero flags.** FIXED 2026-09-06. Five of the eight
      domain evaluators (anaemia, alcohol, nutrition, physical-fitness,
      cardiorespiratory) hard-coded `applicable: true` regardless of
      whether any field in the domain was ever answered — only
      glycaemic-control, smoking, and medication computed it from real
      data. `calculateOptimization` over an assessment with nothing
      entered except the two dates used to report those five domains all
      `'optimized'` — indistinguishable, per domain, from a genuinely-
      assessed, all-clear patient. Fixed by deriving `applicable` per
      domain from whether any of that domain's own measures are non-null/
      non-blank (anaemia: hb/ferritin/tsat; alcohol: units/auditC;
      nutrition: must/pct; physical-fitness: mets/dasi/walk/at;
      cardiorespiratory: sbp/dbp/ef/stopBang/spo2/asthmaControl/
      copdControl), mirroring the three domains that already did this
      correctly, in both `js/domain-rules.js` and
      `src/lib/engine/domain-rules.ts`. Checked for the Loco/`todo/`
      third stack this item's own text assumed exists: confirmed the
      current `back-end-with-loco` has no scoring logic of its own
      (JSON-API-only) and no `todo/` prototype exists for this form, so
      only two stacks actually needed the change. `computedReadiness` is
      unaffected either way for a wholly blank assessment (both
      `optimized` and `not-applicable` map to the same `ready` band, and
      `counts.optimized` counts both together) — the fix's real, visible
      effect is per-domain transparency in the report/dashboard, not the
      composite verdict; documented this explicitly in `spec/index.md`
      §4. Added a dedicated Vitest boundary test asserting every domain
      is `not-applicable` (not `optimized`) for a blank assessment — the
      existing `counts.optimized === 8` test passed either way and could
      not have caught this (111/111 passed, up from 110). All 3 existing
      personas were unaffected (real answered data in every domain);
      added a 4th persona pinning the fixed all-`not-applicable` blank
      case and updated the file's top-level `note`. `bin/test-personas
      --update perioperative-optimization` 4/4 PASS; `bin/test-e2e --html
      perioperative-optimization` 2/2 passed. Fleet: `bin/test-personas`
      forms 352/352 PASS, personas 1175/1175 PASS, 0 FAIL.
- [x] **diabetes-assessment: pre-proliferative retinopathy and maculopathy
      raise no eye rule or flag.** FIXED 2026-09-06. `retinopathyStatus`
      has five options (none, background, preProliferative, proliferative,
      maculopathy) but DM-004/DM-008 and FLAG-EYE-001 only recognised
      `'proliferative'` and `'background'` by exact string match (FLAG-
      EYE-002 was never about retinopathy status at all — a slip in this
      item's own earlier text, it checks a missing screening date).
      `preProliferative` and `maculopathy` correctly counted toward
      `countComplications()` but raised nothing eye-specific in the fired
      rules or flags a clinician actually reads. Clinical-severity
      decision resolved by the user: pre-proliferative graded 'high'
      concern — the same tier as proliferative (III on a rough I-IV
      severity reading), not medium/background — per the National
      Diabetic Eye Screening Programme's R1/R2/R3 grading and NICE NG28,
      under which pre-proliferative (R2) and proliferative (R3) share the
      same urgent-referral pathway. Maculopathy graded 'high' too by the
      same clinical reasoning, extended by this session (not itself an
      explicit user decision — flagged as such when reported). Added
      DM-021 (pre-proliferative) and DM-022 (maculopathy), both 'high', in
      `js/diabetes-rules.js` and `src/lib/engine/diabetes-rules.ts`; added
      FLAG-EYE-003 / FLAG-EYE-004 (both 'high' priority) in
      `js/flagged-issues.js` and `src/lib/engine/flagged-issues.ts`.
      Confirmed no Loco-side scoring logic exists, but this form's
      `diabetes_rule` table (`sql/05_create_table_diabetes_rule.sql`) is a
      genuine seeded reference catalogue, unlike every other form fixed
      in this backlog — added `sql/09_insert_diabetes_rule_dm021_dm022.sql`
      seeding the two new rows, regenerated `sql/schema.sql`, and verified
      the full migration set applies cleanly on a fresh scratch Postgres
      18.4 (rows confirmed present with `concern_level = 'high'`).
      **Separate, pre-existing bug found and documented while implementing
      (not fixed at the time — out of this item's scope):** the HTML
      engine's `flagged-issues.js` uses `priority: 'urgent'` for 6 of its
      18 flags (including the existing FLAG-EYE-001), a value the SQL
      `grade_flag.priority` CHECK constraint and the SvelteKit reference's
      `FlagPriority` type both reject (only high/medium/low valid) — the
      two new flags added here correctly use 'high' throughout, not
      'urgent', so they do not repeat it. Added 4 boundary tests to
      `diabetes-grader.test.ts` (16/16 passed, up from 12). Renamed the
      persona that demonstrated the original gap (was "...the invisible-
      eye-finding edge case") to reflect the fix, and added a companion
      maculopathy persona; `bin/test-personas --update diabetes-assessment`
      4/4 PASS (up from 3); confirmed the existing critical persona's
      `proliferative` case (DM-004/FLAG-EYE-001) is unaffected. Documented
      the decision in `spec/index.md` §3. `bin/test-e2e --html
      diabetes-assessment` 2/2 passed; `bin/test-form diabetes-assessment`
      PASS. Fleet: `bin/test-personas` forms 352/352 PASS, personas
      1176/1176 PASS, 0 FAIL.
      **The `'urgent'` priority bug above: FIXED 2026-09-07.** Re-grepped
      the actual file before touching it: the real count was **4** flags
      (FLAG-HBA1C-001, FLAG-HYPO-002, FLAG-FOOT-001, FLAG-EYE-001), not 6 —
      the "6 of 18" figure above was inflated and is corrected here. All 4
      changed `'urgent'` → `'high'`, matching the Svelte reference's
      pre-existing value for those same 4 flag IDs exactly (confirmed via
      a scratch script against the real HTML engine before and after), so
      the fix needed no new clinical judgement call — Svelte had already
      made it. Also fixed the same file's misleading header comment
      (claimed the 'urgent' tier was intentional "to render the standard
      urgent/high/medium/low ladder used elsewhere in the monorepo" — true
      of 4 *other* forms' schemas, but not this one's) and `types.js`'s
      JSDoc `AdditionalFlag.priority` typedef (dropped `'urgent'`), and
      removed the now-dead `case 'urgent':` branch from `form-app.js`'s
      `priorityClass()`. **Separate stack-parity gap found while verifying
      the Svelte side (fixed in the same pass, not left for later):**
      FLAG-CVD-002 (current smoker, high) and FLAG-CVD-003 (systolic BP ≥
      140, medium) existed only in the HTML engine — 18 flags there vs. 16
      in `front-end-with-svelte/.../flagged-issues.ts` — and had never been
      ported; ported verbatim, with 3 new Vitest boundary tests plus a
      4th asserting every flag this engine can raise stays in
      high/medium/low across every rule at once (20/20 passed, up from
      16); `pnpm check` clean (0 errors). Regenerated the one persona that
      exercises all 6 of these flags together (`Critical - very poor
      control...`) via `bin/test-personas diabetes-assessment --update`
      (4/4 PASS); diff confirmed to touch only the 4 priority strings and
      their consequent sort-order, nothing else. Updated `spec/index.md`
      §3 and the persona file's top-level `note` (correcting the inflated
      flag count there too). `bin/test-e2e --html diabetes-assessment`
      2/2 passed; `bin/test-form diabetes-assessment` PASS. Fleet:
      `bin/test-personas` forms 352/352 PASS, personas 1176/1176 PASS, 0
      FAIL (unchanged — no persona count drift elsewhere); fleet-wide
      `bin/test-form` shows only the one pre-existing, unrelated failure
      (`diabetes-podiatry-assessment`, a foundation-depth-only form never
      in scope for any front-end gate).
- [x] **hernia-diagnostic-evaluation: doubled red-flag rule IDs.** FIXED
      2026-09-06. `screenRedFlags` built IDs as
      `` `R-RED-FLAG-${key…toUpperCase()}` `` but every key already started
      with `redFlag`, so the IDs came out as `R-RED-FLAG-RED-FLAG-SEVERE-
      PAIN`, `R-RED-FLAG-RED-FLAG-VOMITING`, etc. (verified in the emergency
      persona's `firedRules`). Fixed by stripping the `redFlag` prefix from
      the key before templating, in both HTML `js/classification-rules.js`
      and the SvelteKit `src/lib/engine/classification-rules.ts` (byte-for-
      byte-equivalent logic in both); confirmed via a fleet-wide search that
      this form has no `grade_rule` SQL table and no Loco-side scoring
      logic, so no third stack or seed rows needed updating. Added a
      dedicated `it.each` boundary test in `grader.test.ts` asserting the
      correct, non-doubled rule ID for all seven red flags (42/42 passed,
      up from 35). Updated the persona file's top-level `note` and re-ran
      `bin/test-personas --update hernia-diagnostic-evaluation` (3/3 PASS,
      the emergency persona's `firedRules` now carry the corrected IDs);
      `bin/test-e2e --html hernia-diagnostic-evaluation` 2/2 passed. Fleet:
      `bin/test-personas` forms 352/352 PASS, personas 1173/1173 PASS,
      0 FAIL.
- [x] **hernia-diagnostic-evaluation: `examInconclusive` false positive.**
      FIXED 2026-09-06. `flagged-issues.js` defined `examInconclusive` as
      `palpableMass !== 'yes' || coughImpulsePositive !== 'yes'`, so a
      *confirmed* palpable mass with no elicitable cough impulse (true
      whenever the hernia does not currently reduce) raised
      `F-OCCULT-HERNIA-SUSPECTED-001` — it fired in both the urgent and the
      emergency persona despite a definite clinical diagnosis. Checked
      `doc/safety-case-notes.md` first: no hazard entry covers this flag
      specifically, but `spec/index.md`'s flag table already described
      `occult-hernia-suspected` as a *negative* exam, and this form's own
      `AGENTS.md` documents the cough-impulse rule as "its absence **with a
      strong history** supports the flag" — neither says a *confirmed*
      palpable mass should count. Picked the second of the two options this
      item raised (suppress when `reducibilityStatus` is irreducible/
      incarcerated) over a flat `&&`, since `&&` would also have suppressed
      the flag for the ordinary "negative palpation, reducibility unknown"
      case that this form's own existing `grader.test.ts` coverage and
      `AGENTS.md` text treat as a legitimate trigger — the targeted
      suppression fixes exactly the reported false positive without
      narrowing the flag's general intent. Fixed in both
      `js/flagged-issues.js` and `src/lib/engine/flagged-issues.ts`.
      Documented the decision in `spec/index.md` §3's flag table. Added two
      boundary tests to `grader.test.ts`: the false positive no longer
      fires for `irreducible`/`incarcerated` with a confirmed mass, and the
      flag still fires for the same negative palpation when reducibility is
      `reducible` (44/44 tests passed, up from 35). Re-ran
      `bin/test-personas --update hernia-diagnostic-evaluation` (3/3 PASS —
      the urgent persona's `flags` array dropped
      `F-OCCULT-HERNIA-SUSPECTED-001`, keeping only
      `F-INCARCERATION-RISK-001`) and updated both that persona's
      description and the file's top-level `note`. `bin/test-e2e --html
      hernia-diagnostic-evaluation` 2/2 passed. Fleet: `bin/test-personas`
      forms 352/352 PASS, personas 1173/1173 PASS, 0 FAIL.
- [x] **nuclear-medicine-test-result: Axis A ignores the ejection fraction.**
      FIXED 2026-09-06. `gradeSeverity` grades EF < 40 % as `major`
      (R-SEV-MAJOR-02) but `classifyResult` / `hasAnyAbnormalFinding` never
      looked at `ejectionFractionPercent`, so a gated study with reduced EF
      and no other structured finding classified **normal** with severity
      **major** and follow-up **urgent** — an axis-A/axis-B contradiction
      (the existing `abnormal-reduced-ejection-fraction-major-not-critical-
      complete` persona always paired EF with a perfusion defect
      specifically to avoid tripping this gap). Fixed by adding the same
      `ejectionFractionPercent < 40` condition to `hasAnyAbnormalFinding` —
      the single shared predicate `classifyResult` and
      `hasOnlyIncidentalFinding` both already call — in both HTML
      `js/rules.js` and the SvelteKit `src/lib/engine/utils.ts`; confirmed
      no Loco-side scoring logic and no static `grade_rule` seed rows exist
      for this form, so no third stack needed changing. `gradeFollowUp`
      needed no change: it already derives urgency from severity, which
      was already correct. Extended the existing (previously
      classification-blind) `grader.test.ts` boundary test with
      `resultClassification`/`R-CLASS-ABNORMAL-01` assertions (14/14
      passed — that test already existed but had never checked Axis A, so
      it could not have caught this) and added a new persona
      (`abnormal-reduced-ejection-fraction-alone-no-other-finding`) that
      isolates reduced EF with every other structured-finding field false/
      null, pinning the corrected `abnormal` classification.
      `bin/test-personas --update nuclear-medicine-test-result` 4/4 PASS;
      `bin/test-e2e --html nuclear-medicine-test-result` 2/2 passed.
      Fleet: `bin/test-personas` forms 352/352 PASS, personas 1174/1174
      PASS, 0 FAIL.
- [x] **holter-monitor-test-result: `F-UNEXPECTED-FINDING-001` predicate
      narrower than `hasCriticalFinding`.** FIXED 2026-09-06. The
      unexpected-finding flag checked only AF / VT / high-grade AV block,
      so a critical >3 s pause with no originating request never raised
      it (verified in the pause-only critical persona) despite
      `hasSignificantPause` being one of `hasCriticalFinding`'s own four
      triggers. Fixed by adding `hasSignificantPause(r)` to the predicate
      in both `js/flags.js` and `src/lib/engine/flagged-issues.ts`; fast
      AF needed no separate addition, since it is a strict subset of the
      plain `atrialFibrillationDetected` check already present there
      (broader, so already dominant). Added two boundary tests to
      `grader.test.ts` (18/18 passed, up from 16): the flag now fires for
      a pause with no request reference, and still does not fire when a
      reference is on file. Re-ran `bin/test-personas --update
      holter-monitor-test-result` (3/3 PASS — the pause-only critical
      persona's `flags` now correctly include `F-UNEXPECTED-FINDING-001`)
      and updated the persona file's top-level `note` and that persona's
      description. `bin/test-e2e --html holter-monitor-test-result` 2/2
      passed. Fleet: `bin/test-personas` forms 352/352 PASS, personas
      1174/1174 PASS, 0 FAIL.
- [x] **coagulation-test-result: `R-FU-RECOMMENDED-03` is dead code.** FIXED
      2026-09-06. The isolated-APTT follow-up branch was unreachable because
      `gradeSeverity` already routes an isolated APTT prolongation through
      its own dedicated moderate-severity rule (R-SEV-MODERATE-02), so
      `gradeFollowUp`'s generic `severity === 'moderate'` check
      (R-FU-RECOMMENDED-01) always ran first and intercepted every case
      before the dedicated isolated-APTT branch could fire. Picked reorder
      over delete: `gradeSeverity` itself already checks the specific
      isolated-APTT rule (R-SEV-MODERATE-02) before its own generic
      moderate rule (R-SEV-MODERATE-01) for exactly this reason, so
      reordering `gradeFollowUp` to match that existing specific-before-
      generic precedence — rather than deleting the more clinically
      actionable dedicated message (mixing studies / factor or inhibitor
      work-up) in favour of the generic one — is the more consistent fix.
      Reordered in both `js/rules.js` and
      `src/lib/engine/follow-up-rules.ts`; confirmed no Loco-side scoring
      logic or `grade_rule` seed rows exist for this form, so no third
      stack needed changing. Extended the existing isolated-APTT test in
      `grader.test.ts` (which set up the exact scenario but had never
      asserted which follow-up rule fired) with `firedRules`/
      `recommendedAction` assertions proving R-FU-RECOMMENDED-03 now fires
      and R-FU-RECOMMENDED-01 does not (15/15 passed). Re-ran
      `bin/test-personas --update coagulation-test-result` (3/3 PASS — the
      isolated-APTT persona's `firedRules` and `recommendedAction` now
      carry the dedicated message) and updated the persona file's
      top-level `note` and that persona's description. `bin/test-e2e
      --html coagulation-test-result` 2/2 passed. Fleet:
      `bin/test-personas` forms 352/352 PASS, personas 1174/1174 PASS,
      0 FAIL.
- [x] **tumor-marker-test-request: `redirect` recommendation is unreachable.**
      FIXED 2026-09-06. `scoreAppropriateness` and `scoreInterpretation` are
      both forced by the same screening-misuse condition and
      `deriveRecommendation` checked appropriateness first, so `misuse-risk`
      always resolved to `query-referrer`, never `redirect`. Picked
      "give `redirect` a reachable trigger" over removing it: reordered
      `deriveRecommendation` to check `interpretationBand === 'misuse-risk'`
      before the generic `appropriatenessBand === 'usually-not-appropriate'`
      check, in both `js/grader.js` and `src/lib/engine/grader.ts`. The
      other route to `usually-not-appropriate` (every selected marker
      mismatched, no screening misuse involved) is unaffected and still
      resolves to `query-referrer` — verified with a new dedicated test.
      Confirmed no Loco-side scoring logic exists, and the SQL `CHECK`
      already permits `'redirect'`, so no third stack or schema change was
      needed. Updated the existing `grader.test.ts` boundary test (which
      had asserted the old, buggy `query-referrer` recommendation directly)
      to expect `redirect`, and added a new test proving the non-screening
      `usually-not-appropriate` route is untouched (12/12 passed, up from
      10). Re-ran `bin/test-personas --update tumor-marker-test-request`
      (3/3 PASS) and renamed the third persona from
      `query-referrer-screening-high-risk-psa-misuse-incomplete` to
      `redirect-screening-high-risk-psa-misuse-incomplete`, updating its
      description and the file's top-level `note`. `bin/test-e2e --html
      tumor-marker-test-request` 2/2 passed (the dashboard does not display
      `recommendation` at all, so no stale display existed). Fleet:
      `bin/test-personas` forms 352/352 PASS, personas 1174/1174 PASS,
      0 FAIL.
      **New finding surfaced while fixing this, not yet actioned:** the
      `reject` recommendation in `RECOMMENDATION_LABELS` has no trigger
      anywhere in `deriveRecommendation` either, so it is equally
      unreachable. Left alone here — deciding when a tumour-marker request
      should be outright rejected (vs. queried or redirected) is a product/
      clinical judgement call, not a mechanical reorder like the fix above.
      **FIXED 2026-09-07.** Judgement call made: `scoreAppropriateness`
      returns `appropriatenessScore === 1` on exactly one path — its early
      return when zero markers are selected at all
      (`R-APPROP-NO-MARKER-SELECTED`) — distinct from a marker/indication
      mismatch (score 2 or 5, stays `query-referrer`) and from screening
      misuse (score 3, stays `redirect`). No marker selected means nothing
      was actually requested, so there is no marker choice to query or
      reconsider; the vetting desk rejects the request outright instead.
      `deriveRecommendation` now takes `appropriatenessScore` as a 4th
      argument (in both `js/grader.js` and `src/lib/engine/grader.ts`) and
      checks `appropriatenessScore === 1` first, before the generic
      `usually-not-appropriate` branch that would otherwise intercept it —
      same shadowing hazard as the `redirect` fix above, and confirmed via
      a scratch script against the real HTML engine both that the new
      branch fires correctly and that the screening-misuse /
      all-mismatched routes are untouched. Both stacks' downstream label
      and colour helpers (`RECOMMENDATION_LABELS`, `recommendationLabel`,
      `recommendationColor`, and the HTML dashboard's `.rec-reject` CSS)
      already had full `reject` support — this really was only a missing
      trigger, nothing else. Updated the existing `grader.test.ts`
      boundary test (which exercised the no-marker-selected scenario but
      had never asserted `recommendation`) to expect `reject`, and added 2
      more tests proving the screening-misuse and all-mismatched routes
      still resolve to `redirect`/`query-referrer` (14/14 passed, up from
      12); `pnpm check` clean. Added a 4th persona
      (`no-marker-selected-otherwise-complete-reject`) via
      `bin/test-personas tumor-marker-test-request --update` (4/4 PASS, up
      from 3 — none of the 3 pre-existing personas exercised this path, so
      none of their `expected` values changed). Documented the full
      recommendation ladder in a new "Overall recommendation" subsection of
      `spec/index.md` §3, and updated the persona file's top-level `note`.
      `bin/test-e2e --html tumor-marker-test-request` 2/2 passed;
      `bin/test-form tumor-marker-test-request` PASS. Both stacks' sample
      dashboard data checked and found not to need updating: the Svelte
      side (`sample-reports.ts`) computes its rows by calling the real
      `calculateGrade` live, so it already reflects the fix automatically;
      the HTML side's row shape (`data.js`) doesn't carry a
      `recommendation` field at all. Fleet: `bin/test-personas` forms
      352/352 PASS, personas 1177/1177 PASS, 0 FAIL; fleet-wide
      `bin/test-form` shows only the one pre-existing, unrelated failure
      (`diabetes-podiatry-assessment`, a foundation-depth-only form never
      in scope for any front-end gate).
- [x] **microbiology-culture-test-result: completeness penalises a
      no-growth culture.** FIXED 2026-09-06. `R-COMP-SENSITIVITIES-01`
      required `antibioticSensitivities` text even when `cultureResult` was
      `no-growth` (nothing to be sensitive to), silently capping an
      otherwise complete report at 80% — the persona batch worked around it
      with a "Not applicable" placeholder string. (This item's cross-
      reference to "histopathology's `agreedAdjustmentsDetail`-satisfied-
      when-declined pattern" was itself a slip — that field name belongs to
      `neurodiversity-adjustment-response`, the next item below, not
      `histopathology-test-result`; the fix here didn't need that
      precedent to be correct, just the clear technical requirement.)
      Fixed by treating the section as present whenever
      `cultureResult === 'no-growth'`, in both `js/rules.js` and
      `src/lib/engine/completeness-rules.ts`; confirmed no Loco-side
      scoring logic exists for this form. Removed the now-unnecessary
      "Not applicable" placeholder from both the
      `normal-urine-no-growth-complete` persona and the Vitest fixture's
      default `createNormalResult()`, leaving the field genuinely blank to
      actually exercise the fix rather than mask the old bug. Added two
      dedicated tests to `grader.test.ts`: a no-growth culture with blank
      sensitivities still completes 100% (R-COMP-SENSITIVITIES-01 does not
      fire), and a significant-growth culture with blank sensitivities
      still drops to 80% (the rule still fires) — 16/16 passed, up from
      14; also had to redirect the existing "computes partial
      completeness" test to blank `specimenType` instead of
      `antibioticSensitivities` as its second missing section, since that
      combination no longer produces the same completeness percentage
      once the fix landed. Re-ran `bin/test-personas --update
      microbiology-culture-test-result` (3/3 PASS) and updated the persona
      file's top-level `note` and the first persona's description.
      `bin/test-e2e --html microbiology-culture-test-result` 2/2 passed
      (no dashboard sample data references `cultureResult` or
      `completenessPercent`, so no stale display existed). Fleet:
      `bin/test-personas` forms 352/352 PASS, personas 1174/1174 PASS,
      0 FAIL.
- [x] **neurodiversity-adjustment-response: no "decline acknowledged"
      outcome.** FIXED 2026-09-06, per the user's explicit decision to add
      the dedicated outcome. `deriveRecommendation`'s waterfall used to
      bottom out at `implement` for a justified decline with nothing
      agreed and no escalation (verified — and already caught, unnoticed,
      by the existing `declined-justified-caution-not-high-risk-complete`
      persona's own then-recorded `expected.recommendation: 'implement'`).
      Added the suggested `record-decline` outcome: to the engine
      (`js/grader.js` + `src/lib/engine/grader.ts`), the label switch
      (`js/types.js` `recommendationLabel` + `src/lib/engine/utils.ts`),
      the `Recommendation` TypeScript union, and the SQL CHECK constraint
      + column comment (`sql/05_create_table_neurodiversity_adjustment_
      response_grade.sql`) — confirmed no Loco-side scoring logic exists,
      and no separate report template hardcodes the recommendation enum
      (it calls `recommendationLabel` dynamically), so no fourth artefact
      needed touching. Verified the full migration set applies cleanly on
      a fresh scratch Postgres 18.4 and the regenerated CHECK constraint
      accepts `'record-decline'`. Added a dedicated fixture + boundary
      test to `grader.test.ts` (12/12 passed, up from 11 — no prior test
      exercised a *justified* decline with nothing agreed and no
      escalation, only the no-rationale/high-risk and escalated/high-risk
      routes). `bin/test-personas --update
      neurodiversity-adjustment-response` 3/3 PASS — the existing
      justified-decline persona's `expected.recommendation` changed from
      `implement` to `record-decline`; updated its description and the
      file's top-level `note`. Documented the full recommendation
      waterfall in `spec/index.md` §3. `bin/test-e2e --html
      neurodiversity-adjustment-response` 2/2 passed; `bin/test-form
      neurodiversity-adjustment-response` PASS. Fleet: `bin/test-personas`
      forms 352/352 PASS, personas 1176/1176 PASS, 0 FAIL.
- [x] **tumor-marker-test-result: `moderate` → `urgent-review`.** FIXED
      2026-09-06, per the user's explicit decision to align rather than
      keep the divergence. `deriveRecommendation` mapped `moderate`
      severity to `urgent-review` — MORE alarming than `major`'s
      `specialist-referral` — unlike every sibling `*-test-result` engine,
      which maps `moderate` (alongside `inconclusive`) to that engine's
      own "repeat/re-test" recommendation (`further-testing`/
      `further-imaging`/`further-monitoring`). Aligned `moderate` to this
      engine's own equivalent term, `repeat-marker` (already used for the
      `inconclusive` case), in both `js/grader.js` and
      `src/lib/engine/grader.ts`; confirmed no Loco-side scoring logic
      exists. Updated the existing `grader.test.ts` boundary test (which
      asserted the old `urgent-review` value directly) to expect
      `repeat-marker`, noting that this severity-only mapping is unchanged
      even though `followUpUrgency` is independently `urgent` via the
      action-signal rule for that same persona/fixture — a structural
      trait this engine shares with every sibling, not a new
      inconsistency (13/13 tests passed). Re-ran `bin/test-personas
      --update tumor-marker-test-result` (3/3 PASS — the moderate-severity
      persona's `expected.recommendation` changed from `urgent-review` to
      `repeat-marker`) and updated that persona's description and the
      file's top-level `note`. Documented the aligned mapping in
      `spec/index.md` §3. `bin/test-e2e --html tumor-marker-test-result`
      2/2 passed. Fleet: `bin/test-personas` forms 352/352 PASS, personas
      1176/1176 PASS, 0 FAIL.
- [x] **Sweep the other 34 `*-test-result` persona notes** for the same
      class of asymmetry (a severity trigger that is not a classification
      or unexpected-finding trigger) and file any not listed above. DONE
      2026-09-06. Audited all 32 remaining `*-test-result` forms (of the
      37 that actually exist in the fleet under this glob — 5 already
      fixed earlier this session, not 34) via 4 parallel read-only audit
      agents checking `hasCriticalFinding`/`hasAnyAbnormalFinding` vs
      `gradeSeverity`'s dedicated triggers and vs the unexpected-finding-
      style flag's own condition, in both HTML and Svelte. 16 of the 32
      had the bug (2 forms — bronchoscopy-test-result,
      cardiac-stress-test-result — have the identical-looking gap but it
      is provably inert: `hasCriticalFinding`/`hasCriticalResult` is
      checked first in every consuming function, so the missing OR term
      is never reachable; left alone, noted here rather than "fixed" for
      nothing). Fixed all 16, each in both HTML and the SvelteKit
      reference:
      - **Axis-A/Axis-B classification contradiction** (a `gradeSeverity`
        trigger not reflected in the classification predicate, the
        nuclear-medicine-test-result pattern): ambulatory-blood-pressure-
        test-result (`nighttimeHypertensive`), angiography-test-result
        (stenosis >= 50%), blood-cross-match-test-result
        (`specialRequirements` + not-yet-compatible), blood-test-result
        (a deviating eGFR/HbA1c structured band — required a dedicated
        `hasAnyClassifiableAbnormality` predicate kept separate from
        `hasAbnormalResult`, since `gradeSeverity` itself calls
        `hasAbnormalResult` first for its own 'moderate' tier; folding the
        structured-band check into `hasAbnormalResult` directly would
        have made its dedicated 'minor' branch unreachable dead code —
        caught by a real Vitest regression, not by inspection, and fixed
        the same way as the toxicology fix below), eye-vision-test-result
        (3 instances: `hasReferableRetinopathy`, `hasElevatedIop`,
        `visualFieldResult === 'bilateral-defect'` — safe to fold
        directly into `hasAnyAbnormalFinding` here, since `gradeSeverity`
        already checks each of these three as independent, higher-
        priority branches before ever reaching its own
        `hasAnyAbnormalFinding`-gated minor tier), hearing-test-result
        (worst pure-tone average >= 21 dB HL), mri-scan-test-result
        (lesion >= 30mm), pet-scan-test-result (SUVmax >= 10, safe for
        the same reason as eye-vision — `gradeSeverity` checks it as its
        own independent major-tier branch first), pulmonary-function-
        test-result (a bare `severity` field value of mild/moderate/
        severe/very-severe, independent of the structured booleans —
        also safe, each tier is its own independent branch checked before
        the `hasAnyAbnormalFinding`-gated fallback), sleep-study-test-
        result (an AHI severity band from the raw
        apnoeaHypopnoeaIndex measurement), toxicology-test-result (the
        worst instance: lithium/carboxyhaemoglobin/salicylate over their
        toxic thresholds — required the same dedicated-predicate pattern
        as blood-test-result, here a new `isCriticalResult`, since
        `gradeSeverity` checks the narrower `hasToxicResult` first for
        its own R-SEV-MAJOR-01 tier; also fixed `classifyResult`,
        `F-CRITICAL-RESULT-001`, `F-ABNORMAL-ACTION-001`'s exclusion, and
        `F-UNEXPECTED-FINDING-001` to all call the new predicate instead
        of duplicating the old, narrower condition inline — caught a
        second, real Vitest regression the same way), ultrasound-test-
        result (lesion >= 30mm).
      - **Unexpected-finding/discrepancy flag mirrors a strict subset**
        (the holter-monitor-test-result pattern): echocardiogram-test-
        result (`F-UNEXPECTED-FINDING-001` missing pericardial effusion +
        severe LV impairment), electroencephalogram-test-result (missing
        status epilepticus), pet-scan-test-result (missing nodal uptake +
        a progressive treatment response — the latter is itself one of
        `hasCriticalFinding`'s two conditions), pulmonary-function-test-
        result (missing the structured ventilatory-pattern values),
        sleep-study-test-result (missing central sleep apnoea +
        significant desaturation), toxicology-test-result
        (`F-URGENT-REFERRAL-001` missing salicylate — the
        `SALICYLATE_TOXIC_MG_L` constant it needed had to move from
        Svelte's `severity-rules.ts` into `utils.ts` to avoid a circular
        import, the same relocation blood-test-result's
        `structuredReportingCategory` needed), ultrasound-test-result
        (missing cyst/gallstones/hydronephrosis/free fluid/DVT/organ
        enlargement), urinalysis-test-result (`F-DISCREPANCY-001` was
        UTI-features-only — widened to the full `hasAnyAbnormalFinding`,
        matching the flag's own description text), x-ray-test-result
        (`F-UNEXPECTED-FINDING-001` missing dislocation/consolidation/
        pneumothorax/pleural effusion/free air/unstable fracture —
        including the exact three conditions driving
        `hasCriticalFinding` itself).
      Verified every fix with a scratch script against the real engine
      before writing any persona, per the session's established method.
      Ran `bin/test-personas --update` across all 16 forms in one pass:
      forms 16/16 PASS, personas 90/90 PASS, 0 FAIL — no persona needed
      hand-authoring a new scenario; every fixed condition was already
      exercised by an existing persona (several — the three
      `*-now-correctly-critical` toxicology personas especially — had
      already documented the exact gap by name during the original
      persona-authoring pass, before this sweep formalised the fix).
      Ran `npx vitest run` and `npx svelte-check` across all 16 Svelte
      engines: all green after fixing the two real regressions the first
      Vitest pass caught (blood-test-result, toxicology-test-result) —
      both were exactly the "widening a predicate `gradeSeverity` itself
      also gates on" self-inflicted dead-code mistake, caught by the
      tests before being committed, not assumed safe. Ran `bin/test-e2e
      --html` across all 16 forms: 32/32 passed. Fleet: `bin/test-
      personas` forms 352/352 PASS, personas 1176/1176 PASS, 0 FAIL.

### Tooling (`bin/test-personas`, `bin/test-engines`)

- [x] **Cover split-engine flags in the persona oracle.** DONE 2026-09-03.
      `bin/test-personas` now takes `flagsHint` (default: the loader's
      discovered detector; `false` opts out) **and `flagsArgs`** — the
      detector's exact call contract as a list of `"state"`, `"result"`,
      `"result.<path>"`, `"options"` entries (default `["state","result"]`).
      The contract turned out to be the whole problem: of the 119 split
      engines found, 62 detectors take `(state, grade)`, 53 take `(state)`,
      but 22 take a specific grade field (`grade.auditcScore`,
      `grade.timepoints`, `grade.bmiRaw`, `grade.egfrRaw, grade.egfrStage`,
      PCL-5's `(state, totalScore, probableDsm5Diagnosis, answeredCount)`,
      DASS-21's `(state, depression, anxiety, stress)`, UKMEC's
      `(state, ukmecResults)` …) — a naive `flags(state, result)` would
      have pinned silently wrong flags for those. Every `flagsArgs` was
      copied from the form's `form-app.js` call site, checked against the
      detector's arity, and written into the persona file together with
      the call text. Flags land under `expected.flaggedIssues` /
      `additionalFlags` / `flags` (mirroring the detector's name); a grader
      that returns a bare string/number is wrapped as `{ value, flags }`
      (who-surgical-safety-checklist). All 119 files re-pinned with
      `--update`; fleet 289/289 forms, 983/983 personas PASS. Also added a
      **frozen clock** (`clock`, default `2026-09-03T12:00:00Z`; per-file
      or per-persona override): `new Date()` / `Date.now()` are pinned
      during grading so review-date / certificate-expiry / age flags never
      rot — verified that no existing expected changed under the default
      clock. Four forms pin all-empty flag lists (consent-to-treatment,
      fall-risk-assessment, mental-health-act-assessment,
      ophthalmology-assessment): checked — their personas are thin on the
      flag axis (e.g. fall-risk fills only the MFS items, not the
      ancillary anticoagulant / sedative / environment fields), not a wrong
      contract; enriching them is a persona-quality follow-up.
- [x] **`bin/test-engines` discovery can pick a sub-axis grader — or a
      non-grader.** DONE 2026-09-03 — discovery now PROBES instead of
      matching names: `bin/lib/engine-loader.js` builds the default state
      from the zero-arg export that yields the *largest* object (so
      `emptyRecord` beats `emptyDrug`, `emptyLpa` beats
      `createEmptyAddress`), calls every plausibly-named export over it,
      and scores the result (+10 for a rules-like array, +10 for a
      flags/issues array, +5 for a status-like key, +4 for nested
      sub-result objects, key count; bare arrays/strings/booleans rank far
      below any object; names only break ties, with factory names,
      `*Label`/`*Class` helpers and per-item sub-scorers excluded or
      penalised). Result: **PASS 279 → 340, SKIP 76 → 15**, FAIL 0, and
      every one of the six known mis-picks now resolves to the composite.
      `--probe <slug>` prints each candidate's score. **Audit of the PASS
      forms' persona `graderHint`s** (script comparing each hint with the
      grader `form-app.js` calls at submit): 212 matched; **9 were pinned
      to a sub-axis and have been re-pinned to the composite** —
      epilepsy-review (`classifyControl` → `review`), heart-failure-review
      (`deriveFunctionalStatus` → `gradeReview`), hypertension-review
      (`computeControlStatus` → `review`),
      learning-disability-annual-health-check (`calculateGrade` →
      `assess`), genetic-assessment (`calculateRisk` → `gradeRisk`),
      hearing-aid-assessment (`gradeHHIES` → `calculateHHIES`),
      mental-health-assessment (`calculatePHQ9` → `gradeAssessment`),
      predicting-risk-of-cardiovascular-disease-events
      (`estimateTenYearRisk` → `calculateRisk`),
      who-surgical-safety-checklist (`computeFlags` → `deriveStatus` +
      `flagsHint: computeFlags`); each file's note records the re-pin.
      hormone-replacement-therapy-assessment is left on `classifyHRTRisk`
      because its form-app calls two peer graders (`calculateMRS` and
      `classifyHRTRisk`) with no composite. The 5 files that relied on
      discovery now pin `graderHint` explicitly. Original finding kept
      below for the record. Six verified mis-picks, each overridden with
      `graderHint` in the persona file: hernia-diagnostic-evaluation
      (`classifyHernia`, Axis A only, vs `calculateHerniaEvaluation`);
      hip-replacement-surgery-evaluation (`scoreOhs`, the OHS
      sub-instrument, vs `calculateHipEvaluation`);
      international-patient-summary (`classifyCompleteness`, which takes
      a *counts* object, not the assessment — it "passed" on the empty
      assessment only because `undefined < undefined` is false, so a
      structurally wrong call still returned 'complete'); and
      post-operative-report (`gradeOrder`, a grade-key → ordinal helper
      that returns `-1` for the empty assessment, vs
      `calculateClavienDindo`);
      recommended-summary-plan-for-emergency-care-and-treatment
      (`completenessPercent`, a bare-number helper, vs `gradePlan`); and
      ward-round-note (`calculateGrade`, the intermediate tally with no
      status and no flags, vs `assess` — the name-prefix heuristic
      preferred `calculate*` over the spec's own entry point). Prefer exports
      whose result carries `firedRules` (+ `flags`), then names starting
      `calculate`/`grade`/`validate`, and reject candidates whose result
      has no rule/flag array; then audit the 279 PASS forms for other
      partial or wrong picks and list them.
- [x] **Persona counts, not form counts.** DONE 2026-09-03: the summary
      line reads `forms 289/289 PASS (0 FAIL), personas 983/983 PASS (0
      FAIL)`, and `--verbose` prints one PASS/FAIL line per persona.
- [x] **Engine-SKIP breakdown as a first-class report.** DONE 2026-09-03:
      `bin/test-engines --skip-summary` groups the SKIPs by reason class
      with counts and slugs.

### Unblocking the engine-SKIP forms (prerequisite for their personas)

      Counts below were from `bin/test-engines --verbose` on 2026-09-03
      (43 + 10 + 12 + 6 + 5 = 76), not estimates. **Update, same day:** the
      probe-based discovery above cleared 61 of the 76 with no engine
      change at all — "grader not found" (43 → 3), "needs a fuller input"
      (10 → 0: the factory mis-pick was the cause, e.g. `emptyDrug` for
      `anaesthetic-record`), "returned object/boolean" (12 → 0). **15
      remain**, all needing a per-form engine change: the 6 with no engine
      namespace, 6 with no default-state factory (`agile-checklist`,
      `agile-principles-assessment`, `issue-tracker`, `meeting`,
      `objectives-and-key-results-tracker`,
      `united-kingdom-nhs-england-medical-exemption-certificate`), and 3
      whose `js/` exports only `emptyAssessment`/`emptyItems` because the
      grading is inline in `form-app.js` (`hospital-daily-monitoring-checklist`,
      `hospital-dashboard-metrics`, `hospital-performance-indicators`).
      The 61 newly loadable forms have no personas yet — that is the
      next persona backlog.

- [x] **"grader not found" — 43 forms** — RESOLVED for 40 of 43 by probe
      discovery (see above); the 3 `hospital-*` forms remain (inline
      grading, no engine export). Original text: e.g. `pediatric-assessment`,
      `psychiatry-assessment`, `stroke-assessment`, `urology-assessment`,
      `pulmonology-assessment`, `respirology-assessment`, the six
      `who-*-form`s, the three
      `united-kingdom-driver-and-vehicle-licensing-agency-*` forms,
      `united-kingdom-maternity-certificate-mat-b1`,
      `united-states-hipaa-authorization-form`, `prescription-request`,
      `provider-transfer-request`, `patient-room-readiness`,
      `parkland-formula-for-burns`, `pre-operative-assessment-by-patient`:
      the module exports helpers but no recognisable entry point. Add a
      single composed `calculateGrade(data)` (or a `graderHint`) so
      discovery works; keep the existing per-axis functions.
- [x] **"needs a fuller input" — 10 forms** — RESOLVED 2026-09-03 by
      probe discovery (the factory was mis-picked; no grader was actually
      unsafe over its own empty shape). Original text: `anaesthetic-record`,
      `bone-marrow-donation-assessment`, `code-of-conduct-notice`,
      `dietic-assessment`, `eye-prescription`, `organ-donation-assessment`,
      `research-and-planning-privacy-notice`, `structured-medication-review`,
      `united-kingdom-lasting-power-of-attorney-for-financial-decisions`,
      `…-for-health-and-care-decisions`: the empty factory does not satisfy
      the grader (throws on `undefined.presentingProblems`,
      `undefined.dateOfBirth`, `undefined.find` …). Make the graders
      null-safe over the empty shape, or make the factory return the full
      shape the grader expects.
- [x] **"returned object / boolean / undefined" — 12 forms** — RESOLVED
      2026-09-03 by probe discovery. Original text:
      `cataract-diagnostic-evaluation`, `chronic-kidney-disease-review`,
      `diabetes-assessment`, `genetics-assessment`,
      `health-screening-questionnaire`, `hematology-assessment`,
      `knee-replacement-surgery-evaluation`, `medication-reconciliation`,
      `paediatric-early-warning-score` (`scoreCapillaryRefill`),
      `perioperative-optimization` (`computeAuditCScore`),
      `vaccinations-assessment` (`calculateCompositeScore`),
      `who-counter-referral-form` (`hasAnyStatusFlag`): discovery latched
      onto a helper whose return is not a grading result. Same fix as the
      discovery-heuristic item above, plus a composed entry point.
- [x] **"no engine namespace published" — 6 forms** — DONE 2026-09-04, one
      of each kind. Four had real inline logic pulled out to an importable
      module and rewired via `import`: `agile-consulting-scorecard-for-hiring-help`
      (`js/engine.js` — `gradeScorecard`, extracted from index.html's inline
      `<script>`), `international-certificate-of-vaccination-or-prophylaxis`
      (`js/validator.js` — `validateCertificate`),
      `medical-information-form-for-air-travel` (`js/engine.js` —
      `evaluateFitness`, a 12KB extraction from `form-app.js`). The other
      three are genuinely acknowledgement-only by design (a checkbox +
      name + date, no grading) and now carry a
      `front-end-with-html/js/.no-engine` marker (first line = why):
      `architecture-decision-record`, `legal-requirements-privacy-notice`,
      `screening-program-privacy-notice`. `bin/test-engines` gained a NONE
      outcome (distinct from SKIP) for the marker, so these three no longer
      count as unfinished discovery work. Fleet: `bin/test-engines` **PASS
      352, SKIP 0, FAIL 0, NONE 3 / 355** — the SKIP count implied by the
      original 76-form sweep is now fully zero.
- [x] **"default factory not found" — 6 forms** — DONE 2026-09-04. Each
      exported the wizard's existing blank-state literal as `empty*()` /
      `createDefault*()`: `agile-checklist` (`emptyAnswers`, from
      `form-app.js`'s local helper), `agile-principles-assessment`
      (`emptyAssessment`), `issue-tracker` (`emptyIssue`, assembled from the
      9 SOAP-style sections + reporter + 7 scores), `meeting`
      (`emptyMeeting`, all 6 child collections default to `[]`),
      `objectives-and-key-results-tracker` (`emptyAssessment`, `now: null`),
      `united-kingdom-nhs-england-medical-exemption-certificate`
      (`emptyApplication`). All six now discover cleanly.
- [x] **"grader not found" — 3 `hospital-*` forms** — DONE 2026-09-04.
      Extracted each form's inline tally (`summariseChecklist` /
      `summariseMetrics` / `summariseIndicators`) from `form-app.js` into a
      new `js/summary.js` module and rewired the import; these are
      completeness tallies, not scored graders, by design (facility audits
      / KPI dashboards with no pass/fail threshold), matching their
      `index.md`.
- [x] Then: personas for each unblocked form, 3 each, same methodology.
      DONE 2026-09-05 — see the final entry under this item's own log below
      ("The persona backlog is complete"); fleet ground truth as of that
      commit: `bin/test-personas` forms 352/352 PASS, personas 1172/1172
      PASS, 0 FAIL.
      **64 of the newly-unblocked forms have personas as of 2026-09-04**
      (fleet ground truth: `bin/test-personas` forms 317/317 PASS, personas
      1067/1067 PASS, 0 FAIL; forms without personas: 39 — all inside the
      current 0-SKIP/3-NONE engine set, i.e. genuinely never attempted yet,
      not blocked). 3 more done today: `agile-checklist` (flat 57-item
      answers map, not the whole assessment — `calculateMaturity` is called
      as `calculateMaturity(state.answers)`; the "insufficient-data despite
      three genuinely-low sections" persona pins that the 30-item
      answered-floor gates on total items touched fleet-wide, not on
      whether each section already has a defined percent),
      `agile-principles-assessment` (`clampWeight` coerces before the
      weighted mean — a 0.3 weight silently becomes 0.5, a 2.5 becomes 2.0
      — and the per-principle FLAG_SPECS + F-CRITICAL-Pxx checks interleave
      by principle, not group by type), and
      `agile-consulting-scorecard-for-hiring-help` (freshly given its own
      `js/engine.js` this session — its `additionalFlags` use a bespoke
      `{p,cat,text}` shape, not the `{flagId,category,priority,description}`
      shape the rest of this engine family uses, since it's a verbatim
      extraction of the page's original inline script). All nine personas
      matched hand-derivation exactly against the live engine before
      `--update` was run. `bin/test-e2e --html` on all three: 6/6 passed
      including axe-core. 3 more done the same day:
      `international-certificate-of-vaccination-or-prophylaxis`
      (`validateCertificate`; VAL003/004/008/009 are gated on
      `entryDisease === 'yellow-fever'` and never fire for any other
      disease — the edge persona uses cholera specifically to isolate
      VAL002/VAL010 from the yellow-fever-only checks; VAL001 reads the
      real wall clock, pinned via the persona-file `clock` key),
      `medical-information-form-for-air-travel` (`evaluateFitness`; BOTH
      firedRules and safetyFlags are independently re-sorted before
      return — rules descending by band severity, flags by priority —
      and `validUntil` is always today+10 regardless of the computed
      band), `united-kingdom-nhs-england-medical-exemption-certificate`
      (`evaluateFp92a`; verified that a single disqualifying rule
      — diet-only-diabetes — forces `outcome: 'ineligible'` even when a
      genuinely separate, independently-valid eligible condition also
      fired in the same submission; `redirectTo` is still populated
      even when the outcome is already `'ineligible'` via the
      disqualifier branch, since it's computed before the outcome
      branch is chosen; unlike MEDIF/ICVP this engine does NOT re-sort
      firedRules or additionalFlags — both stay in registry order). All
      nine matched hand-derivation exactly; one self-caught omission
      during design (forgot `completeness.missing-nhs-number` is a RULE
      as well as a FLAG) was corrected before writing prose, not after
      seeing a FAIL. Fleet: `bin/test-personas` forms 320/320 PASS,
      personas 1076/1076 PASS, 0 FAIL; `bin/test-e2e --html` 6/6 passed.
      3 more done the same week: the `hospital-*` tally forms
      (`hospital-daily-monitoring-checklist`,
      `hospital-dashboard-metrics`, `hospital-performance-indicators`) —
      no scoring engine by design, so personas verify pure completeness
      counts over the freshly-extracted `js/summary.js` modules. Caught
      along the way: `hospital-daily-monitoring-checklist`'s 97
      checkpoint ids are NOT uniformly `<section>.<n>` — a section with
      exactly one checkpoint (16 Fire Fighting Equipment, 18 Mortuary)
      uses the bare section number as its id; a first attempt using
      `"16.2"` (nonexistent) silently no-opped rather than erroring,
      caught by re-checking the tool's actual counts against the hand
      prediction before writing prose. Fleet: `bin/test-personas` forms
      323/323 PASS, personas 1085/1085 PASS, 0 FAIL; `bin/test-e2e
      --html` 6/6 passed. **The original 12-form "engine changed this
      session" list is now COMPLETE**: the last 3 — `issue-tracker`
      (`gradeIssue`; a null score bands 'low' for that instrument but
      pushes NO rule at all, unlike the OKR tracker's null-defaults-to-
      amber-with-a-rule below — two engines in the same backlog batch
      handle "unanswered" oppositely, both verified, neither a bug),
      `meeting` (`validateMeeting`; caught that durationMinutes can be
      null even when BOTH actual start and end times are recorded, if
      the end was mistakenly entered earlier in the day than the start —
      the engine treats a negative computed duration as unknown rather
      than reporting it; the overdue-action-item check reads the real
      wall clock, pinned via the persona `clock` key), and
      `objectives-and-key-results-tracker` (`gradeObjective`; this
      engine is deliberately pure — all date maths use `a.now`, a field
      ON the assessment, never the wall clock, unlike `meeting`'s
      identical-looking overdue check; the critical persona fires 11 of
      12 possible flags, missing only moonshot-progress which needs a
      different stretch tier) — are done. All nine matched hand
      derivation exactly. Fleet: `bin/test-personas` forms 326/326 PASS,
      personas 1094/1094 PASS, 0 FAIL; `bin/test-e2e --html` 6/6 passed.
      3 more done from the probe-discovery-only backlog: `code-of-
      conduct-notice` (`validateForm`; verified that the boolean `agreed`
      field\'s value `false` counts as empty for completeness purposes,
      identically to a never-touched checkbox, even when the recipient
      typed both name and date — the same state the separate, unrelated
      `acknowledgementStatus()` helper would label \'declined\'),
      `cognitive-assessment` (`calculateMMSE`; found that the type
      carries both `languageScores.naming1/naming2` AND
      `repetitionCommands.naming1/naming2`, and the grader reads ONLY
      the latter for every language item — `languageScores` is a UI-only
      field bridged by `form-app.js` before grading; also verified that
      a 0 (actively answered, incorrect) and a null (unanswered) both
      contribute 0 points and are both absent from `firedRules`, so an
      all-zero, fully-answered submission grades 0/30 with an EMPTY
      audit trail, while every domain-specific flag still fires since
      the flags\' own "answered" checks only require non-null), and
      `dietic-assessment` (`calculateNutritionRisk`; verified the MUST
      sub-scorers push a fired rule for every branch including a
      genuine score of 0 — no null/zero-silence convention here, unlike
      several siblings; and that `scoreRefeedingRisk` returns as soon as
      it finds \'highest\' risk, so a bmi<14 patient never accumulates
      the separate major/minor refeeding rule rows even when several
      would independently qualify). All nine matched hand derivation
      exactly. Fleet: `bin/test-personas` forms 329/329 PASS, personas
      1103/1103 PASS, 0 FAIL; `bin/test-e2e --html` 6/6 passed.
      3 more done: `gerontology-assessment` (`calculateCFS` + split
      `detectAdditionalFlags`; the CFS score is the MAX across every
      fired rule, defaulting to CFS 1 when none fire; `calculateAge()`
      is the one wall-clock read in this engine, pinned via the persona
      `clock` key so the age-gated rules — CFS-002 age ≥75, FLAG-
      AGE-001 age ≥90 — stay stable), `health-screening-
      questionnaire` (`calculateHealthScreening`, which folds PAR-Q+,
      AUDIT-C, the composite max-grade risk band, and flags into one
      call; its own age computation, `ageInYears()`, derives from the
      recorded `birthDate`/`assessmentDate` fields rather than the wall
      clock, so no `clock` override was needed — unlike
      `gerontology-assessment`\'s `calculateAge()` right above it), and
      `hematology-assessment` (`calculateAbnormality` + split
      `detectAdditionalFlags`; the composite abnormality score is the
      mean of each answered lab value\'s normalised deviation from its
      reference range, and returns \'draft\' with an empty firedRules
      array below 3 answered values — not reached by any of the
      three personas here, all of which answer 18/18). All nine matched
      hand derivation exactly, after one iteration to add the health-
      screening-questionnaire personas\' missing `summary` and
      `occupational` sub-objects, which their `state` blocks had
      omitted and which the ungated grader/flag code reads
      unconditionally (`test-personas` uses each persona\'s `state`
      verbatim, with no default-shape merge, unlike this session\'s own
      scratch verification scripts which merge onto the engine\'s empty-
      state export). Fleet: `bin/test-personas` forms 332/332 PASS,
      personas 1112/1112 PASS, 0 FAIL; `bin/test-e2e --html` 6/6 passed.
      3 more done: `hospital-discharge` (`validateDischarge` + split
      `detectAdditionalFlags`; the NG27 completeness rules only check
      `nonEmpty()`/exact-match on the recorded fields, so a discharge
      date recorded BEFORE the admission date still satisfies both
      date-recorded mandatory rules — the illogical ordering is only
      ever caught by the independent flag layer\'s explicit `d < a`
      check, `FLAG-DATE-001`), `occupational-therapy-assessment`
      (`calculateCOPM` + split `detectAdditionalFlags`; performance and
      satisfaction are each averaged independently over up to 5
      answered activities, and BOTH category labels are produced by the
      same `copmPerformanceCategory()` helper, so a satisfaction score
      is labelled "Good performance" rather than "Good satisfaction" —
      a naming quirk in the shared label function, not a scoring bug;
      the flag layer does case-insensitive free-text substring matching
      on several narrative fields, so persona wording was chosen to
      deliberately trigger, or avoid, those substrings), and
      `oncology-assessment` (`calculateECOG` + split
      `detectAdditionalFlags`; MAX-grade over `ecog-rules.js`, ECOG 0
      default; the critical persona fires 29 of the engine\'s 42 rules
      and all 14 of its possible flags simultaneously, confirming the
      two independent audit trails compose cleanly under near-maximal
      load with no ordering surprises).
      All nine matched hand derivation exactly. Fleet: `bin/test-
      personas` forms 335/335 PASS, personas 1121/1121 PASS, 0 FAIL;
      `bin/test-e2e --html` 6/6 passed.
      3 more done: `orthopedic-assessment` (`calculateDASH` + split
      `detectAdditionalFlags`; DASH = ((mean of answered 1-5 items - 1)
      * 25), minimum 27 of 30 items; the critical persona answers
      exactly 27 by leaving 3 unrelated items null, and firedRules
      lists every ANSWERED item scored above 1 — an unanswered item is
      silently excluded from both the mean and the audit trail, never
      counted as a de-facto 1), `patient-room-readiness`
      (`summariseReadiness`, a plain tally with no scoring/flags — 25
      fixed boolean checkpoints, checkedCount plus the labels of every
      unchecked one in catalogue order), and `prescription-request`
      (`calculatePriorityLevel` + split `detectAdditionalFlags`;
      MAX-priority over 8 declarative rules, routine default; the
      critical persona is an emergency request with every field blank,
      firing the emergency rule alongside all three substitution and
      all four completeness-gap rules even though the emergency rule
      alone already decides the outcome). All nine matched hand
      derivation exactly. Fleet: `bin/test-personas` forms 338/338
      PASS, personas 1130/1130 PASS, 0 FAIL; `bin/test-e2e --html` 6/6
      passed.
      3 more done: `provider-transfer-request` (`validateTransfer` +
      split `detectFlaggedIssues`; SBAR-aligned completeness with
      conditional `applies()` rules — the receiving-provider
      acknowledgement fields only apply once ANY acknowledgement field
      has been touched, so a request with zero acknowledgement activity
      never even reaches "incomplete" on those particular fields; the
      critical persona\'s emergent, unresponsive, unstable patient with
      reversed vitals across every axis fires all six urgent-tier flags
      the engine defines), `psychiatry-assessment` (`calculateGAF` +
      split `detectAdditionalFlags`; GAF SUBTRACTS each fired rule\'s
      impact from a 100 default rather than taking a max, and two rule
      pairs are independent, not tiered, so an AUDIT score of 20+ fires
      BOTH the >=16 and >=20 alcohol rules and deducts both; the flag
      layer\'s housing flag covers only \'homeless\', not the
      \'temporary\' status its score-side sibling rule treats
      identically — a real, verified score/flag divergence), and
      `pulmonology-assessment` (`calculateGold` + split
      `detectAdditionalFlags`; MAX-stage over `gold-rules.js`; a CAT
      score of 28 fires both the >=10 and >=20 symptom-burden rules at
      once for the same reason; `demographics.bmi` is NOT auto-derived
      from weight/height inside the grader — the caller pre-computes it
      via `calculateBMI()`, so a persona missing that field silently
      never triggers the BMI-gated rule/flag even with weight and
      height both present, caught here before `--update` by comparing
      the tool\'s actual output against the hand derivation). All nine
      matched hand derivation exactly. Fleet: `bin/test-personas` forms
      341/341 PASS, personas 1139/1139 PASS, 0 FAIL; `bin/test-e2e
      --html` 6/6 passed.
      3 more done: `research-and-planning-privacy-notice`
      (`validateForm` + split `detectAdditionalFlags`; same
      agreed-false-counts-as-empty pattern as `code-of-conduct-notice`
      earlier in this backlog, plus a length-based "implausibly short
      typed name" flag independent of the bare non-empty completeness
      rule), `respirology-assessment` (`calculateMRC` + split
      `detectAdditionalFlags`; MAX-grade over `mrc-rules.js`; a real,
      verified unit-mismatch bug found and left as-is per the
      mirrored-engine convention — rule PF-004 compares
      `fev1FvcRatio < 70`, not `< 0.7`, even though the same field
      stores a 0-1 fraction everywhere else in this form and the
      sibling `pulmonology-assessment` form\'s own spirometry rule
      correctly divides by 0.7, so PF-004 fires whenever the field is
      answered with any realistic fraction regardless of whether the
      patient is actually obstructed — the baseline persona
      deliberately leaves the field unanswered to get a genuine
      zero-fired-rules case), and
      `united-kingdom-driver-and-vehicle-licensing-agency-v1-form`
      (`validateV1` + split `detectFlaggedIssues`; 43 rules, several
      branch-conditional via `!branchActive(d) || <check>` so a
      dormant branch\'s fields trivially pass; the critical persona
      activates nearly every conditional branch at once — monocular
      vision, non-ocular visual-field defect, bilateral glaucoma,
      retinitis pigmentosa, laser treatment, blepharospasm, night
      blindness, uncontrolled double vision, another condition, and
      recent contact — landing on 21 of 43 rules missing and 9 flags
      including 2 urgent). All nine matched hand derivation exactly.
      Fleet: `bin/test-personas` forms 344/344 PASS, personas
      1148/1148 PASS, 0 FAIL; `bin/test-e2e --html` 6/6 passed.
      2 more done: `united-kingdom-lasting-power-of-attorney-for-
      financial-decisions` (`validateLpa`, also exported as
      `calculateGrade`, folding statutory blockers, non-blocking
      flags, and the validity-band derivation into one call —
      compositeRisk is max-grade where ANY fired statutory blocker
      forces `critical` outright, otherwise the worst flag wins;
      `computeValidityBand` checks `lpa.status` for registered/
      rejected/submitted BEFORE ever consulting signatures, so an
      explicit status short-circuits the whole signature-based
      derivation; every persona sets `signedDate` explicitly since
      age-on-signing and the blocker/band engine\'s own \'today\'
      both route through `lpa.signedDate || todayIso()` — the one
      wall-clock read in this engine; the critical persona is a minor
      donor with zero attorneys firing 10 of the engine\'s 21
      statutory blockers at once, including a donor who witnesses
      their own signature), and
      `united-kingdom-maternity-certificate-mat-b1` (`validateMatB1`,
      which folds `detectAdditionalFlags` into its own return;
      `complete` is scoped to only the `completeness`-category fired
      rules, so a fired timing/consistency/declaration rule can
      coexist with `complete === true`; the one wall-clock read here
      is the \'issue date in the future\' flag, pinned via the
      persona `clock` key; the critical persona\'s midwife has a
      lapsed NMC registration and the examination is 9 weeks past the
      20-week DWP window). All nine matched hand derivation exactly.
      Fleet: `bin/test-personas` forms 346/346 PASS, personas
      1154/1154 PASS, 0 FAIL; `bin/test-e2e --html` 4/4 passed.
      5 more done, closing out every WHO form in the backlog:
      `who-counter-referral-form` and `who-emergency-first-aid-form`
      (`validateCounterReferral`/`validateCfar` + split
      `detectFlaggedIssues`; both SBAR/CABCDE completeness validators
      with conditional `applies()` rules gating the explanation-of-
      informed and tourniquet-time follow-ups), `who-emergency-unit-
      general-form` and `who-emergency-unit-trauma-form`
      (`validateEuGeneral`/`validateEuTrauma` + split
      `detectFlaggedIssues`; the Trauma sibling ratchets several rules
      — spine stabilisation and GCS — to RED-triage-only via
      `applies()`, and its pregnancy flag is `high` priority where the
      General form\'s equivalent is only `medium`; several vital-sign
      and SpO2 conditions fire independently rather than as mutually
      exclusive tiers, confirmed by a critical persona that fires 22
      of the Trauma engine\'s flags simultaneously), and
      `who-prehospital-form` (`validatePrehospital` + split
      `detectFlaggedIssues`; RED-triage gates airway intervention, IV/
      IO access, and GCS-components rules the same way, and the flag
      layer parses the free-text blood-pressure field for its leading
      systolic integer rather than reading a structured numeric
      field). All fifteen personas across the five forms matched hand
      derivation exactly. Fleet: `bin/test-personas` forms 351/351
      PASS, personas 1169/1169 PASS, 0 FAIL; `bin/test-e2e --html`
      2/2, 4/4, and 4/4 passed across the three batches.
      Final form done, closing the backlog:
      `united-kingdom-lasting-power-of-attorney-for-health-and-care-
      decisions` (`calculateLpaValidity`, folding `detectAdditionalFlags`
      into its own return; a statutory-fatal cascade across seven rule
      modules -- donor, attorney, certificate-provider, signature-order,
      instruction, registration, plus the flag layer -- where any fatal
      fired rule forces `invalid` and any high forces `needs-
      correction`; a genuine, verified inconsistency between two rule
      modules left unpatched: donor age is checked against the donor's
      own signature date (falling back to `capacityDeclaredAt`), while
      attorney and replacement-attorney age is checked only against
      `donor.capacityDeclaredAt` -- attorney-rules.js never reads the
      donor signature date at all; the critical persona is an underage,
      incapacitated donor with zero attorneys, no certificate provider,
      no signatures, an unset life-sustaining-treatment choice, and an
      instruction proposing assisted suicide that also contradicts a
      known ADRT, firing 18 of the engine's rules -- 13 fatal -- plus
      all three of its non-statutory flags at once). All three matched
      hand derivation exactly. Fleet: `bin/test-personas` forms
      352/352 PASS, personas 1172/1172 PASS, 0 FAIL; `bin/test-e2e
      --html` 2/2 passed. The persona backlog is complete: every form
      with a probe-discoverable engine now has `examples/personas.json`.
      The only forms left without one are the three engine-less-by-
      design forms (`architecture-decision-record`,
      `legal-requirements-privacy-notice`,
      `screening-program-privacy-notice`) and one foundation-depth-only
      form with no built front-end yet (`diabetes-podiatry-assessment`)
      -- none of these were ever in scope for this backlog.

### Spec-driven follow-through

- [x] **Promote persona-note findings into `spec/index.md`.** DONE
      2026-09-07. Scoped down from "every quirk above" (which would have
      meant all 352 forms with personas) to the enumerable, actually-
      relevant set: every form touched by a Phase 13 engine-*fix* (not
      every form with a persona note — most notes just describe intended
      behaviour, not a bug). Reconstructed that set from every `- [x]`
      bullet under tasks.md's "### Engine correctness" section (the 12
      individually-fixed forms) plus the 16-form `*-test-result` sweep's
      consolidated entry: 27 forms total. Checked each for an existing
      spec note (the `... in \`examples/personas.json\`.` closing
      sentence the earlier fixes already used, not a literal "Verified
      engine behaviour" heading — matched on that instead of assuming the
      exact heading text, which caught `perioperative-optimization`
      already having one under a differently-named §4 that a naive
      heading-string check would have missed). 7 of 27 already had one
      (`pre-operative-assessment-by-clinician`, `perioperative-
      optimization`, `diabetes-assessment`, `hernia-diagnostic-evaluation`,
      `tumor-marker-test-request`, `tumor-marker-test-result`,
      `neurodiversity-adjustment-response` — the last three from this
      session's own engine-gap fixes above). Added a short paragraph to
      the other 20: `holter-monitor-test-result`, `coagulation-test-result`,
      `microbiology-culture-test-result`, `nuclear-medicine-test-result`,
      and the 16 `*-test-result` sweep forms
      (`ambulatory-blood-pressure-test-result`, `angiography-test-result`,
      `blood-cross-match-test-result`, `blood-test-result`,
      `echocardiogram-test-result`, `electroencephalogram-test-result`,
      `eye-vision-test-result`, `hearing-test-result`,
      `mri-scan-test-result`, `pet-scan-test-result`,
      `pulmonary-function-test-result`, `sleep-study-test-result`,
      `toxicology-test-result`, `ultrasound-test-result`,
      `urinalysis-test-result`, `x-ray-test-result`). Each
      paragraph names the exact predicate/flag fixed, the file(s) touched
      in both stacks, and ends with the same "Fixed 2026-09-06; previously
      verified and documented (not silently patched) in
      `examples/personas.json`." sentence the earlier, hand-written notes
      already used, for a consistent fleet-wide voice. Pure documentation
      — no code, test, or persona changes; `bin/generate-spec.py --check`
      (355/356, only the pre-existing unrelated
      `diabetes-podiatry-assessment` gap), `bin/test-tutorials`, and
      `bin/test-form` on a 4-form sample all pass; `git status` scoped to
      exactly the 20 intended `spec/index.md` files.
- [x] **Seed dashboards from personas.** — DONE 2026-09-06.
      `bin/generate-persona-dashboard-samples.py [--check] [--all|<slug>…]`
      regenerates each `*-test-result` form's clinician-dashboard sample
      rows — `front-end-with-html/js/data.js` **and** the parallel
      `front-end-with-svelte/src/lib/data/sample-reports.ts` (both stacks
      together, to keep the two in sync rather than let this generator
      itself introduce a new HTML/Svelte drift) — from
      `examples/personas.json`, one row per persona, so the dashboard's
      offline sample data and the persona oracle can never disagree.
      Scoped to the `*-test-result` family (the same 37-form shape
      confirmed for the FHIR-bundle generator above). Field order is read
      from each form's own `ReportRow` interface in
      `front-end-with-svelte/.../engine/types.ts` (the authoritative
      source; `front-end-with-html/js/dashboard-types.js`'s JSDoc
      `@typedef` is a hand-kept mirror) rather than assumed, since a few
      forms interleave a domain-specific field between the generic ones —
      `dexa-bone-density-test-result`'s `ReportRow` has `lowestTScore` /
      `whoClassification` sitting between `reportedDate` and
      `resultClassification`, not appended at the end. Mapping: `id`
      synthesizes `<PREFIX>-2026-NNNN` reusing each form's own existing
      prefix (extracted from its current `data.js`; no fleet-wide naming
      rule — every form picked its own, e.g. `NM`, `BLD`, `TOX`, `DXA`);
      `patientName` cycles a shared synthetic name pool (extended by two
      names, `Ingrid Larsen` / `Jamal Osei`, for the two forms with more
      than 8 personas); `reportStatus`/`reportedDate` from `persona.state`;
      `resultClassification`/`abnormalitySeverity`/`followUpUrgency`/
      `reportCompletenessPercent` from `persona.expected`; `flagCount` from
      `len(expected.flags)`; every other field read straight from
      `persona.state[<same camelCase name>]` — confirmed present in all 37
      forms' persona state before writing the generator, zero missing.
      189 dashboard rows generated across the 37-form family (matching the
      189 personas); `--check` verified idempotent; every generated
      `data.js` passed `node --check`, every `sample-reports.ts` parsed as
      valid JS after stripping its one `import type` line; `bin/test-e2e
      --html` (including the dashboard CSV/TSV export test, which directly
      exercises the new sample rows) still green on a sample of 3 forms.
      Wired into `AGENTS.md`'s Generators catalogue and Verify section;
      `docs/tools.md` regenerated.
- [x] **Persona → FHIR R5 Bundle** (already listed under Phase 11 as "FHIR
      bundles for personas") — DONE 2026-09-06.
      `bin/generate-persona-fhir-bundles.py [--check] [--all|<slug>…]`
      generates one FHIR R5 `Bundle` per `examples/personas.json` entry into
      a new `examples/personas-fhir/` directory, built from that persona's
      actual filled `state` and computed `expected` grade — richer than
      `generate-changelog-and-examples.py`'s generic, type-defaulted
      `examples/fhir-bundle.json`, which carries the same placeholder
      values for every reader regardless of which persona they have in
      mind. Scoped to the `*-test-result` family (37/37 forms, confirmed
      fleet-wide to share one `sql/` shape: `patient` + `clinician` + a
      single main `<slug>_result` table + a `_grade`/`_grade_rule`/
      `_grade_flag` triad) — defaults to that whole family with no
      arguments. Reuses `bin/fhir-r5/generate-fhir-r5-representations.py`'s
      column parser and value-typing helpers (loaded via `importlib`, since
      the filename has hyphens), substituting persona values for its
      generic `guess_fhir_value()` placeholders. Mapping deliberately
      differs from that generator's own per-entity `classify_table()`: the
      main result table becomes an `Observation` (one component per
      *answered* — non-`''`/non-`null` — column) rather than the thin
      `Encounter` (status-only, no clinical fields) that generator's schema
      -level classifier produces for it; `patient`/`clinician` are copied
      unchanged from `fhir/r5/*.json` (personas don't vary those fields in
      this family), with the copy's now-dangling `encounter` reference
      stripped since this bundle carries no Encounter resource; the grade
      table becomes a `ClinicalImpression` summary; each fired rule and
      flag in `expected.firedRules`/`expected.flags` becomes its own
      `DetectedIssue`. Resource/bundle ids are deterministic
      (sha256-of-seed-text), not random, so reruns are byte-identical.
      189 persona bundles generated across the 37-form family; `--check`
      verified idempotent; all 189 files valid JSON; no dangling
      `Encounter/` references; `git status` scoped to exactly the new
      `bin/` script + 37 new `examples/personas-fhir/` directories.
      Wired into `AGENTS.md`'s Generators catalogue and Verify section;
      `docs/tools.md` regenerated. Broader-than-`*-test-result` support
      (forms whose `sql/` doesn't share this exact shape) is future work.

## Done (previous rounds — summary)

- 286 forms built to uniform depth: specs, docs, SQL, generated XML / FHIR
  R5 / protobuf / OpenAPI, HTML + Svelte front-ends, Loco back-end crates,
  CHANGELOGs, examples. HTML consolidation 286/286; Svelte route nesting +
  `app.css` import fix 286/286 (routes return 200); Loco crate batch fully
  green; Lily HTML drift 0; Lily Svelte 284/286 PASS.
