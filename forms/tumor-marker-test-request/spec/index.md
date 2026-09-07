# Tumor Marker Test Request — specification

This file is the **living domain spec** for this form. It captures the contract each implementation (SQL schema, generated representations, front-ends, and Rust backend) must satisfy. Treat it as the source of truth for behaviour — update the spec before changing code.

Slug: `tumor-marker-test-request`

## 1. Purpose

A UK NHS–aligned **serum tumour-marker blood-test request (referral)** that a
clinician completes to request one or more serum tumour markers for a patient.
It records the requested markers, the clinical indication, relevant history, any
known cancer site and prior marker value, and the requested urgency — then
computes a **four-axis grading** (appropriateness, interpretation safety, request
completeness, and urgency / triage priority) plus a set of safety-critical flags.
The output is a vetting report that supports the laboratory's and requesting
team's decision to accept, query, redirect, or reject the request.

Tumour markers are **poor screening tests** in unselected populations: most have
low specificity and are raised in benign conditions, so this form is built to
discourage non-evidence-based screening and to check that each requested marker
matches its indication.

Full design description: [`index.md`](../index.md).

## 2. Scope

In scope: the schema, scoring engine, four front-ends (form + dashboard, each in HTML and SvelteKit), and the Rust full-stack crate listed in §5. Out of scope: hosted deployment, authentication, multi-tenancy.

## 3. Scoring system

The engine grades each request on **four independent axes**, each citable to a
recognized body or principle. Axes are orthogonal: a highly appropriate request
can still be incomplete or carry interpretation risk.

| Axis | Instrument | Output |
| --- | --- | --- |
| **A. Appropriateness** | Marker-to-indication fit (1–9 ordinal; NICE / ACB / RCPath) | usually-appropriate (7–9) / may-be-appropriate (4–6) / usually-not-appropriate (1–3) |
| **B. Interpretation safety** | Timing, treatment effects, screening-misuse checks | ok / caution / misuse-risk |
| **C. Request completeness** | Mandatory-field checklist; indication + clinical details weighted highest | 0–100 % complete (+ missing fields) |
| **D. Urgency / triage** | Suspected-cancer escalation rules | routine / urgent / two-week-wait (+ target timeframe) |

> **Note on the 1–9 scale.** There is no single published 1–9 tumour-marker
> appropriateness score. The scale here is anchored on **marker-to-indication
> appropriateness** — for example CA125 for suspected ovarian cancer scores
> high, whereas a broad multi-marker panel ordered for vague non-specific
> symptoms scores low. Treat it as clinical decision support, not a validated
> diagnostic instrument.

### Overall recommendation

`deriveRecommendation` resolves the four axes to one vetting-desk
recommendation, least-alarming wins only when nothing escalates, checked
in this order:

1. **`reject`** — `appropriatenessScore === 1`: no tumour marker was
   selected at all (`R-APPROP-NO-MARKER-SELECTED`). Nothing was actually
   requested, so there is no marker choice to query or reconsider; the
   vetting desk rejects the request outright. Must be checked before step
   3 below, since this case also bands `usually-not-appropriate`.
2. **`redirect`** — `interpretationBand === 'misuse-risk'` (broad
   screening use of a poor screening marker). Must be checked before step
   3, since `scoreAppropriateness` forces `usually-not-appropriate`
   whenever it forces `misuse-risk`.
3. **`query-referrer`** — `appropriatenessBand === 'usually-not-appropriate'`
   via the other route (every selected marker mismatches the recorded
   indication, with no screening misuse), or `completenessPercent < 50`.
4. **`accept`** — otherwise.

Fixed 2026-09-06 (redirect ordering) and 2026-09-07 (`reject` trigger);
previously verified and documented (not silently patched) in
`examples/personas.json`.

### Marker-to-indication reference

| Marker | Established appropriate use |
| --- | --- |
| PSA | Prostate cancer (symptomatic / informed-choice testing; not population screening) |
| CA125 | Suspected ovarian cancer (NICE CG122 / NG12: measure if ovarian-cancer symptoms; US if ≥35 IU/ml) |
| CA19-9 | Pancreatic / hepatobiliary cancer; not for screening |
| CEA | Colorectal cancer monitoring / recurrence surveillance |
| AFP | Hepatocellular carcinoma; germ-cell tumours |
| beta-hCG | Germ-cell / trophoblastic tumours |
| CA15-3 | Breast cancer monitoring |
| LDH | Germ-cell tumour staging; lymphoma prognosis |
| Calcitonin | Medullary thyroid carcinoma |
| Chromogranin A | Neuroendocrine tumours |

## 4. Inputs and outputs

**Inputs.** A typed assessment object whose shape mirrors the SQL schema in `sql/` (9 migration files). Unanswered text and enum fields default to `''`; unanswered numeric, date, and time fields default to `null`.

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

- `bin/test-form tumor-marker-test-request` exits cleanly.
- The scoring engine is pure (no side effects, no I/O) and unit-tested.
- The HTML front-ends conform to the Lily HTML headless contract
  ([`forms/AGENTS-front-end-html.md`](../../AGENTS-front-end-html.md)).
- The SvelteKit front-ends conform to the Lily Svelte headless contract
  ([`forms/AGENTS-front-end-svelte.md`](../../AGENTS-front-end-svelte.md))
  and pass `pnpm check` and `pnpm test`.
- The Rust crate builds (`cargo build`) and tests pass (`cargo test`).
- `bin/lily-html-refactor --check tumor-marker-test-request` reports no drift.
- LocalStorage keys preserve draft state across reloads:
  - `tumor-marker-test-request.front-end-with-html.v1` (HTML)
  - `tumor-marker-test-request.front-end-with-svelte.v1` (SvelteKit)

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
bin/test-form tumor-marker-test-request
```
