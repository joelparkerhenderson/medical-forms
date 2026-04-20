# Plan: Fertility Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The fertility grader combines NICE CG156 triage criteria with WHO 2021 semen-analysis thresholds. Rules consider duration of trying (earlier referral when the female partner is ≥ 36 years), cycle regularity, ovarian-reserve markers (AMH, AFC), hormonal profile abnormalities (raised FSH, hyperprolactinaemia, thyroid dysfunction), tubal investigation results, and partner semen analysis. The grader emits an overall concern level of Low, Moderate, or High and produces a prioritised list of flagged issues and recommended next steps (lifestyle, medical, or specialist ART referral).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with fertility clinicians
