# Plan: Provider Transfer Request

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The transfer validator walks the four SBAR sections plus logistics and sign-off fields, checking each mandatory item and emitting Complete, Partial, or Incomplete overall. Urgency level (routine, urgent, emergency) and clinical acuity score modify required detail — for example, ventilator-dependent transfers must include airway plan, sedation drugs, and contingency steps. Flagged issues highlight missing MEWS/NEWS2 observations, absent receiving-clinician acknowledgement, or escort needs inconsistent with acuity.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with transfer teams
