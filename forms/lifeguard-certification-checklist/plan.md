# Plan: Lifeguard Certification Checklist

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The lifeguard grader classifies each demonstrated competency as competent, needs development, or not demonstrated across ten domains. Critical competencies — the 100 m timed swim to NPLQ standard, unconscious-casualty rescue, spinal handling, CPR with compressions to depth and rate, AED delivery, and sustained scanning — force an overall Fail on any deficiency. Non-critical shortfalls accumulate into a Needs Development outcome once a threshold is reached, with targeted retraining flagged for re-assessment. A clean Pass issues a 2-year certificate aligned with the RLSS NPLQ renewal cycle.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with lifeguard trainers
