---
name: psychiatry-assessment-skill
description: "Explains what the Psychiatry Assessment form measures, its scoring instrument and categories, and how to read its example/persona fixtures. Use when a user asks what this form does, how its score or grade is computed, or wants a worked example for it. For cross-form concepts shared across the monorepo, use form-examples-skill instead."
---

# Psychiatry Assessment

Comprehensive psychiatric evaluation using the GAF (Global Assessment of Functioning) Scale with mental status examination, risk assessment, and capacity evaluation.

This skill is the end-user-facing guide to this specific form; for cross-form concepts and terminology shared across the monorepo, use `form-examples-skill`. For implementation work on this form's code, use `psychiatry-assessment-maintainer-skill` instead.

## Scoring system

- **Instrument**: GAF Scale (Global Assessment of Functioning)
- **Range**: 1-100
- **Categories**: 91-100 = Superior functioning, 51-60 = Moderate symptoms, 1-10 = Persistent danger
- **Engine files**: `types.ts`, `gaf-grader.ts`, `gaf-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `gaf-grader.test.ts`

## Worked examples

- [`../../examples/personas.json`](../../examples/personas.json) — hand-authored realistic scenarios with the engine's exact expected output for each one.
- [`../../examples/assessment.json`](../../examples/assessment.json) — a type-defaulted example of the form's data shape (blank/typed, not a realistic scenario).

## Learn more

- [`../../index.md`](../../index.md) — full form description and scoring details.
- [`../../spec/index.md`](../../spec/index.md) — the living domain spec (the behavioural contract this form's code must satisfy).
- [`../../doc/`](../../doc/) — clinical/regulatory reference documentation this form is based on.
