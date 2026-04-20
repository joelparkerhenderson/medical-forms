# Plan: Medical Language Speaking Assessment for English

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The speaking grader scores each role-play on four linguistic criteria (Intelligibility, Fluency, Appropriateness of Language, Resources of Grammar & Expression) and five clinical communication indicators (Relationship-building, Understanding patient's perspective, Providing structure, Information-gathering, Information-giving), each rated 0-6 per OET guidance. Raw sub-scores are combined via the published OET weighting into a 0-500 score and mapped to grade bands A through E. Flagged issues surface candidates failing on a single criterion despite adequate aggregate score, which is a recognised pattern requiring examiner review.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with language examiners
