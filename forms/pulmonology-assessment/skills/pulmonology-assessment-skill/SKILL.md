---
name: pulmonology-assessment-skill
description: "Explains what the Pulmonology Assessment form measures, its scoring instrument and categories, and how to read its example/persona fixtures. Use when a user asks what this form does, how its score or grade is computed, or wants a worked example for it. For cross-form concepts shared across the monorepo, use form-examples-skill instead."
---

# Pulmonology Assessment

Respiratory evaluation using GOLD (Global Initiative for Chronic Obstructive Lung Disease) staging with spirometry, exacerbation history, and functional assessment.

This skill is the end-user-facing guide to this specific form; for cross-form concepts and terminology shared across the monorepo, use `form-examples-skill`. For implementation work on this form's code, use `pulmonology-assessment-maintainer-skill` instead.

## Scoring system

- **Instrument**: GOLD Stage
- **Range**: I-IV
- **Categories**: I = Mild (FEV1 >= 80%), II = Moderate (50-79%), III = Severe (30-49%), IV = Very severe (<30%)
- **Engine files**: `types.ts`, `gold-grader.ts`, `gold-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `gold-grader.test.ts`

## Worked examples

- [`../../examples/personas.json`](../../examples/personas.json) — hand-authored realistic scenarios with the engine's exact expected output for each one.
- [`../../examples/assessment.json`](../../examples/assessment.json) — a type-defaulted example of the form's data shape (blank/typed, not a realistic scenario).

## Learn more

- [`../../index.md`](../../index.md) — full form description and scoring details.
- [`../../spec/index.md`](../../spec/index.md) — the living domain spec (the behavioural contract this form's code must satisfy).
- [`../../doc/`](../../doc/) — clinical/regulatory reference documentation this form is based on.
