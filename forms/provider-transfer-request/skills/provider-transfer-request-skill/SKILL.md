---
name: provider-transfer-request-skill
description: "Explains what the Provider Transfer Request form measures, its scoring instrument and categories, and how to read its example/persona fixtures. Use when a user asks what this form does, how its score or grade is computed, or wants a worked example for it. For cross-form concepts shared across the monorepo, use form-examples-skill instead."
---

# Provider Transfer Request

Inter-provider handover form for transferring a patient's care between clinicians, wards, or organizations, structured around the SBAR (Situation, Background, Assessment, Recommendation) framework with transfer-logistics capture.

This skill is the end-user-facing guide to this specific form; for cross-form concepts and terminology shared across the monorepo, use `form-examples-skill`. For implementation work on this form's code, use `provider-transfer-request-maintainer-skill` instead.

## Scoring system

- **Instrument**: Provider Transfer Completeness Validation (SBAR-aligned)
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All mandatory SBAR and logistics fields supplied
  - Partial: Non-mandatory fields outstanding
  - Incomplete: Mandatory fields missing
- **Engine files**: `types.ts`, `transfer-validator.ts`, `validation-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `transfer-validator.test.ts`

## Worked examples

- [`../../examples/personas.json`](../../examples/personas.json) — hand-authored realistic scenarios with the engine's exact expected output for each one.
- [`../../examples/assessment.json`](../../examples/assessment.json) — a type-defaulted example of the form's data shape (blank/typed, not a realistic scenario).

## Learn more

- [`../../index.md`](../../index.md) — full form description and scoring details.
- [`../../spec/index.md`](../../spec/index.md) — the living domain spec (the behavioural contract this form's code must satisfy).
- [`../../doc/`](../../doc/) — clinical/regulatory reference documentation this form is based on.
