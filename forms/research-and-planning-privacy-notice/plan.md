# Plan: Research and Planning Privacy Notice

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The privacy notice form is a read-and-acknowledge artefact with an opt-out decision, not a clinical scoring instrument. The validator confirms five items: the acknowledgement checkbox is ticked, a legible recipient name is recorded, a date is supplied, a Type 1 opt-out preference is selected (opt-in / opt-out), and the National Data Opt-Out preference is selected. Overall outcome is Complete when all items are satisfied, Incomplete otherwise. Flagged issues identify the specific missing fields and route any explicit opt-out to the local information-governance register for enforcement.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with information-governance staff
