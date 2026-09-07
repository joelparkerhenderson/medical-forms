# Toxicology Test Result — specification

This file is the **living domain spec** for this form. It captures the contract each implementation (SQL schema, generated representations, front-ends, and Rust backend) must satisfy. Treat it as the source of truth for behaviour — update the spec before changing code.

Slug: `toxicology-test-result`

## 1. Purpose

A UK NHS–aligned **toxicology / poisons / therapeutic-drug-level test result
(report)** that a reporting clinician completes after a toxicology assay has been
performed. It is the **result/report counterpart** to *Toxicology Test Request*
(a referral / vetting form): where the request captures which assays should be
done and whether they are appropriate and well timed, this form records what the
assays **found** — the measured **result values** — and a structured
**interpretation**. It records the specimen condition, the clinical history and
suspected agent, the assay levels (paracetamol, salicylate, ethanol, lithium,
digoxin, carboxyhaemoglobin, a drugs-of-abuse screen, and a named specific drug),
the paracetamol-nomogram interpretation, the overall result status, the narrative
findings and impression, and recommended follow-up — then computes a **four-axis
interpretation grade** (result classification, abnormality severity / structured
reporting, report completeness, and follow-up urgency) plus a set of
safety-critical flags including an automatic **critical-result alert**. The
output is a structured toxicology report.

This form is the clinical-toxicology result counterpart to the repository's other
clinician-driven result forms, and mirrors the `ct-scan-test-result` gold
template. It is completed by a clinical biochemist, toxicologist, emergency
physician, or other reporting clinician rather than by the patient, and is
aligned with TOXBASE / NPIS guidance, the MHRA paracetamol-overdose treatment
nomogram (interpretable only at ≥ 4 h post-ingestion; a single 100 mg/L treatment
line), and RCEM toxicology best-practice guidance.

Full design description: [`index.md`](../index.md).

## 2. Scope

In scope: the schema, scoring engine, four front-ends (form + dashboard, each in HTML and SvelteKit), and the Rust full-stack crate listed in §5. Out of scope: hosted deployment, authentication, multi-tenancy.

## 3. Scoring system

See [`index.md`](../index.md) for the scoring instrument, ranges, and categories applicable to this form.

`hasAnyAbnormalFinding`-equivalent `hasToxicResult` (Axis A's classification predicate) did not check lithium, carboxyhaemoglobin, or salicylate against their toxic thresholds, so any of those alone classified `normal` on Axis A while Axis B graded it independently. Fixed via the already-present-but-dead `isCriticalResult` helper, widened and wired into `classifyResult` and three flags (`F-CRITICAL-RESULT-001`, `F-ABNORMAL-ACTION-001`'s exclusion, `F-UNEXPECTED-FINDING-001`; salicylate also added to `F-URGENT-REFERRAL-001`) — deliberately **not** folded into `hasToxicResult` itself, since `gradeSeverity` calls the narrower predicate first for its own major-severity tier (caught by a real Vitest regression during the fix, not by inspection). Fixed 2026-09-06; previously verified and documented (not silently patched) in `examples/personas.json`.

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

- `bin/test-form toxicology-test-result` exits cleanly.
- The scoring engine is pure (no side effects, no I/O) and unit-tested.
- The HTML front-ends conform to the Lily HTML headless contract
  ([`forms/AGENTS-front-end-html.md`](../../AGENTS-front-end-html.md)).
- The SvelteKit front-ends conform to the Lily Svelte headless contract
  ([`forms/AGENTS-front-end-svelte.md`](../../AGENTS-front-end-svelte.md))
  and pass `pnpm check` and `pnpm test`.
- The Rust crate builds (`cargo build`) and tests pass (`cargo test`).
- `bin/lily-html-refactor --check toxicology-test-result` reports no drift.
- LocalStorage keys preserve draft state across reloads:
  - `toxicology-test-result.front-end-with-html.v1` (HTML)
  - `toxicology-test-result.front-end-with-svelte.v1` (SvelteKit)

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
bin/test-form toxicology-test-result
```
