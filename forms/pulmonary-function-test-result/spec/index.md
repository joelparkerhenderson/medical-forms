# Pulmonary Function Test Result — specification

This file is the **living domain spec** for this form. It captures the contract each implementation (SQL schema, generated representations, front-ends, and Rust backend) must satisfy. Treat it as the source of truth for behaviour — update the spec before changing code.

Slug: `pulmonary-function-test-result`

## 1. Purpose

A UK NHS–aligned **pulmonary function test (lung-function / spirometry) result
(report)** that a reporting clinician completes after a lung-function test has
been performed. It is the **result/report counterpart** to *Pulmonary Function
Test Request* (a referral): where the request captures why a test should be done,
this form records what the test **found** and a structured **interpretation**. It
records the performed test type and ATS/ERS quality grade, the clinical history,
the measured spirometry and gas-transfer values (FEV1, FVC, FEV1/FVC ratio, PEF,
DLCO), the structured ventilatory interpretation (pattern, severity,
bronchodilator reversibility), the narrative and structured findings, the
impression, and recommended follow-up — then computes a **four-axis
interpretation grade** (result classification, abnormality severity / structured
reporting, report completeness, and follow-up urgency) plus a set of
safety-critical flags including an automatic **critical-result alert**. The
output is a structured lung-function report.

This form is the respiratory-diagnostics result counterpart to the repository's
other clinician-driven result forms. It is completed by a respiratory physician,
clinical physiologist, or other reporting clinician rather than by the patient,
and is aligned with the ERS/ATS technical standard on interpretive strategies for
routine lung function tests (2022), the ARTP statement on pulmonary function
testing, GOLD / NICE NG115 (COPD), and NICE NG80 (asthma).

Full design description: [`index.md`](../index.md).

## 2. Scope

In scope: the schema, scoring engine, four front-ends (form + dashboard, each in HTML and SvelteKit), and the Rust full-stack crate listed in §5. Out of scope: hosted deployment, authentication, multi-tenancy.

## 3. Scoring system

See [`index.md`](../index.md) for the scoring instrument, ranges, and categories applicable to this form.

`hasAnyAbnormalFinding` (Axis A's classification predicate) did not check the bare `severity` field, so a mild/moderate/severe/very-severe result with no other structured finding classified `normal` on Axis A while Axis B graded it independently. Fixed by adding that condition to `hasAnyAbnormalFinding`, and separately widened `F-UNEXPECTED-FINDING-001` to add the structured ventilatory-pattern values (obstructive/restrictive/mixed) — both in `js/rules.js`/`js/flags.js` and `src/lib/engine/utils.ts`/`flagged-issues.ts`. Fixed 2026-09-06; previously verified and documented (not silently patched) in `examples/personas.json`.

## 4. Inputs and outputs

**Inputs.** A typed assessment object whose shape mirrors the SQL schema in `sql/` (8 migration files). Unanswered text and enum fields default to `''`; unanswered numeric, date, and time fields default to `null`.

**Outputs.** A grading object emitted by the engine: scoring result (per the instrument named in §3), `firedRules[]`, `additionalFlags[]`, and a clinical / administrative report. Rendered as HTML in the browser, exported as PDF via the SvelteKit endpoint, and convertible to FHIR R5 Bundle, XML, JSON, CSV, or TSV.

## 5. Artefacts

Required artefacts and their current status:

| Subdirectory | Role |
| --- | --- |
| `sql` | source of truth |
| `xml` | generated |
| `fhir` | generated |
| `protobuf` | generated |
| `openapi` | generated — not implemented |
| `front-end-with-html` | HTML + Lily (wizard + dashboard) — not implemented |
| `front-end-with-svelte` | SvelteKit (wizard + dashboard) |
| `back-end-with-loco` | Rust + Loco JSON API |

Generated artefacts (XML, FHIR R5, Protocol Buffers, OpenAPI, Loco setup script) are never hand-edited; re-run the generators in [`/AGENTS.md`](../../../AGENTS.md) §Tools after schema changes.

## 6. Acceptance criteria

- `bin/test-form pulmonary-function-test-result` exits cleanly.
- The scoring engine is pure (no side effects, no I/O) and unit-tested.
- The HTML front-ends conform to the Lily HTML headless contract
  ([`forms/AGENTS-front-end-html.md`](../../AGENTS-front-end-html.md)).
- The SvelteKit front-ends conform to the Lily Svelte headless contract
  ([`forms/AGENTS-front-end-svelte.md`](../../AGENTS-front-end-svelte.md))
  and pass `pnpm check` and `pnpm test`.
- The Rust crate builds (`cargo build`) and tests pass (`cargo test`).
- `bin/lily-html-refactor --check pulmonary-function-test-result` reports no drift.
- LocalStorage keys preserve draft state across reloads:
  - `pulmonary-function-test-result.front-end-with-html.v1` (HTML)
  - `pulmonary-function-test-result.front-end-with-svelte.v1` (SvelteKit)

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
bin/test-form pulmonary-function-test-result
```
