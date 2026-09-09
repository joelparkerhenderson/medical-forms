---
name: united-kingdom-lasting-power-of-attorney-for-financial-decisions-skill
description: "Explains what the United Kingdom Lasting Power of Attorney for Financial Decisions form measures, its scoring instrument and categories, and how to read its example/persona fixtures. Use when a user asks what this form does, how its score or grade is computed, or wants a worked example for it. For cross-form concepts shared across the monorepo, use form-examples-skill instead."
---

# United Kingdom Lasting Power of Attorney for Financial Decisions

A digital implementation of the Office of the Public Guardian (OPG) form **LP1F — Lasting power of attorney for property and financial affairs**. The LPA is a statutory deed under the Mental Capacity Act 2005 by which a donor ("the donor") appoints one or more attorneys to make decisions about their property and financial affairs. Once registered by the OPG it is the legal instrument that lets attorneys run bank accounts, sell property, manage investments, claim benefits, and pay bills on behalf of the donor.

This skill is the end-user-facing guide to this specific form; for cross-form concepts and terminology shared across the monorepo, use `form-examples-skill`. For implementation work on this form's code, use `united-kingdom-lasting-power-of-attorney-for-financial-decisions-maintainer-skill` instead.

## Scoring

See [`../../index.md`](../../index.md) and [`../../spec/index.md`](../../spec/index.md) for the scoring instrument, ranges, and categories this form uses.

## Worked examples

- [`../../examples/personas.json`](../../examples/personas.json) — hand-authored realistic scenarios with the engine's exact expected output for each one.
- [`../../examples/assessment.json`](../../examples/assessment.json) — a type-defaulted example of the form's data shape (blank/typed, not a realistic scenario).

## Learn more

- [`../../index.md`](../../index.md) — full form description and scoring details.
- [`../../spec/index.md`](../../spec/index.md) — the living domain spec (the behavioural contract this form's code must satisfy).
- [`../../doc/`](../../doc/) — clinical/regulatory reference documentation this form is based on.
