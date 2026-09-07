# Diabetes Assessment — specification

This file is the **living domain spec** for this form. It captures the contract each implementation (SQL schema, generated representations, front-ends, and Rust backend) must satisfy. Treat it as the source of truth for behaviour — update the spec before changing code.

Slug: `diabetes-assessment`

## 1. Purpose

Structured diabetes review aligned with NICE NG28 (type 2) / NG17 (type 1) and the Diabetes UK 15 Healthcare Essentials, capturing diabetes history, glycaemic control, medications, complications screening, cardiovascular risk, self-care, psychological wellbeing, and foot assessment.

Full design description: [`index.md`](../index.md).

## 2. Scope

In scope: the schema, scoring engine, four front-ends (form + dashboard, each in HTML and SvelteKit), and the Rust full-stack crate listed in §5. Out of scope: hosted deployment, authentication, multi-tenancy.

## 3. Scoring system

- **Instrument**: NICE Diabetes Review (HbA1c target + composite risk)
- **Range**: Controlled / Suboptimal / Poorly Controlled
- **Categories**:
  - Controlled: HbA1c at individualized target, no new complications, good self-care
  - Suboptimal: HbA1c above target or modifiable risk factors present
  - Poorly Controlled: HbA1c significantly above target or active complications identified
- **Retinopathy severity**: `retinopathyStatus` grades to `concernLevel` as
  `none`/`background` → routine annual re-screening (`background` is
  `medium`); `preProliferative` and `maculopathy` → the same `high` concern
  and urgent ophthalmology referral pathway as `proliferative` (DM-004,
  DM-021, DM-022 respectively), per the National Diabetic Eye Screening
  Programme's R1/R2/R3 grading and NICE NG28 — pre-proliferative and
  maculopathy are graded one tier below `proliferative` in eye-screening
  severity but share its referral urgency, not `background`'s routine one.
  Fixed 2026-09-06; previously verified and documented (not silently
  patched) in `examples/personas.json`.
- **Additional-flag priority is always `high`/`medium`/`low`**: matching
  the SQL `grade_flag.priority` CHECK constraint and the SvelteKit
  reference's `FlagPriority` type — this form has no `urgent` tier (unlike
  a handful of other forms in the monorepo whose own `grade_flag` schema
  does allow one). `front-end-with-html/js/flagged-issues.js` used the
  out-of-schema `priority: 'urgent'` for FLAG-HBA1C-001, FLAG-HYPO-002,
  FLAG-FOOT-001, and FLAG-EYE-001 (4 flags — a "6 of 18 flags" figure
  recorded elsewhere was inflated); fixed 2026-09-07 to `'high'`, matching
  the Svelte reference's pre-existing value for the same 4 flag IDs.
  Separately, FLAG-CVD-002 (current smoker) and FLAG-CVD-003 (systolic BP
  ≥ 140) existed only in the HTML engine and had never been ported to the
  Svelte reference; ported in the same pass, verbatim.

## 4. Inputs and outputs

**Inputs.** A typed assessment object whose shape mirrors the SQL schema in `sql/` (14 migration files). Unanswered text and enum fields default to `''`; unanswered numeric, date, and time fields default to `null`.

**Outputs.** A grading object emitted by the engine: scoring result (per the instrument named in §3), `firedRules[]`, `additionalFlags[]`, and a clinical / administrative report. Rendered as HTML in the browser, exported as PDF via the SvelteKit endpoint, and convertible to FHIR R5 Bundle, XML, JSON, CSV, or TSV.

## 5. Artefacts

Required artefacts and their current status:

| Subdirectory | Role |
| --- | --- |
| `sql` | source of truth |
| `xml` | generated |
| `fhir` | generated |
| `protobuf` | generated |
| `openapi` | generated |
| `front-end-with-html` | HTML + Lily (wizard + dashboard) — not implemented |
| `front-end-with-svelte` | SvelteKit (wizard + dashboard) — not implemented |
| `back-end-with-loco` | Rust + Loco JSON API |
| `back-end-with-loco-setup` | generated scaffold script |

Generated artefacts (XML, FHIR R5, Protocol Buffers, OpenAPI, Loco setup script) are never hand-edited; re-run the generators in [`/AGENTS.md`](../../../AGENTS.md) §Tools after schema changes.

## 6. Acceptance criteria

- `bin/test-form diabetes-assessment` exits cleanly.
- The scoring engine is pure (no side effects, no I/O) and unit-tested.
- The HTML front-ends conform to the Lily HTML headless contract
  ([`forms/AGENTS-front-end-html.md`](../../AGENTS-front-end-html.md)).
- The SvelteKit front-ends conform to the Lily Svelte headless contract
  ([`forms/AGENTS-front-end-svelte.md`](../../AGENTS-front-end-svelte.md))
  and pass `pnpm check` and `pnpm test`.
- The Rust crate builds (`cargo build`) and tests pass (`cargo test`).
- `bin/lily-html-refactor --check diabetes-assessment` reports no drift.
- LocalStorage keys preserve draft state across reloads:
  - `diabetes-assessment.front-end-with-html.v1` (HTML)
  - `diabetes-assessment.front-end-with-svelte.v1` (SvelteKit)

## 7. Compliance

Inherits the monorepo compliance baseline: MDCG 2019-11 Rev.1 (EU MDR), UK Medical Devices Regulations 2002, ISO/IEC/IEEE 26514:2022, UK MHRA Software and AI as a Medical Device. Form-specific classification (e.g. Class IIa where output drives clinical decisions) is recorded in [`index.md`](../index.md) and [`AGENTS.md`](../AGENTS.md) where it differs from the baseline.

## 8. References

- [`index.md`](../index.md) — form description and scoring details
- [`AGENTS.md`](../AGENTS.md) — agent instructions
- [`plan.md`](../plan.md) — implementation roadmap
- [`tasks.md`](../tasks.md) — task tracking
- [`/spec.md`](../../../spec.md) — system-level specification
- [`/AGENTS.md`](../../../AGENTS.md) — cross-cutting agent instructions
- [`../AGENTS-front-end-html.md`](../../AGENTS-front-end-html.md) — Lily HTML contract
- [`../AGENTS-front-end-svelte.md`](../../AGENTS-front-end-svelte.md) — Lily Svelte contract

## 9. Verify

```sh
bin/test-form diabetes-assessment
```
