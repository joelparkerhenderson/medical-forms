# Plan: Dyslexia Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The dyslexia assessment uses a standardised score battery to evaluate specific learning difficulties. Standardised scores have a mean of 100 and standard deviation of 15. Scores are collected across multiple domains: reading fluency, reading comprehension, spelling accuracy, written expression, phonological awareness, phonological memory, rapid automatised naming, working memory, and processing speed. The lowest domain score determines the severity classification: scores 85-115 indicate average performance (no dyslexia), 70-84 indicate below average (mild dyslexia), 55-69 indicate well below average (moderate dyslexia), and below 55 indicate significantly below average (severe dyslexia). The assessment also captures developmental history, educational background, emotional and behavioural impact, previous support, and recommendations.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
