# Plan: Anesthesiology Assessment

## Current status

Design spec complete (see `doc/` and `docs/superpowers/specs/2026-04-16-anesthesiology-assessment-design.md`). Implementation pending.

## Scoring engine

The composite grader runs four validated instruments in parallel and combines their outputs into a single perioperative risk category. ASA Physical Status (I-VI) captures overall systemic disease burden. Mallampati class (I-IV) augmented with thyromental distance, mouth opening, neck mobility, and dentition predicts difficult airway. Revised Cardiac Risk Index (RCRI) sums six cardiac predictors to estimate the risk of major cardiac complications. STOP-BANG screens for obstructive sleep apnoea. The composite rule promotes any single high-band finding to the overall category and flags the drivers so the anaesthetist can target pre-optimisation (for example, anticoagulant bridging, difficult-airway trolley, day-of-surgery troponin).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with anaesthetists
