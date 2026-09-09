---
name: respirology-assessment-skill
description: "Explains what the Respirology Assessment form measures, its scoring instrument and categories, and how to read its example/persona fixtures. Use when a user asks what this form does, how its score or grade is computed, or wants a worked example for it. For cross-form concepts shared across the monorepo, use form-examples-skill instead."
---

# Respirology Assessment

Respiratory evaluation using the MRC (Medical Research Council) Dyspnoea Scale with cough assessment, pulmonary function, and exposure history.

This skill is the end-user-facing guide to this specific form; for cross-form concepts and terminology shared across the monorepo, use `form-examples-skill`. For implementation work on this form's code, use `respirology-assessment-maintainer-skill` instead.

## Scoring system

- **Instrument**: MRC Dyspnoea Scale
- **Range**: 1-5
- **Categories**: 1 = Breathless only with strenuous exercise, 2 = Short of breath hurrying, 3 = Walks slower than peers, 4 = Stops after 100m, 5 = Too breathless to leave house
- **Engine files**: `types.ts`, `mrc-grader.ts`, `mrc-rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `mrc-grader.test.ts`

## Worked examples

- [`../../examples/personas.json`](../../examples/personas.json) — hand-authored realistic scenarios with the engine's exact expected output for each one.
- [`../../examples/assessment.json`](../../examples/assessment.json) — a type-defaulted example of the form's data shape (blank/typed, not a realistic scenario).

## Learn more

- [`../../index.md`](../../index.md) — full form description and scoring details.
- [`../../spec/index.md`](../../spec/index.md) — the living domain spec (the behavioural contract this form's code must satisfy).
- [`../../doc/`](../../doc/) — clinical/regulatory reference documentation this form is based on.
