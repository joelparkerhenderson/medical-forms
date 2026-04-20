# Plan: Code of Conduct Notice

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The code of conduct notice is a read-and-acknowledge artefact rather than a clinical scoring instrument. The validator confirms three items: that the acknowledgement checkbox is ticked, that a legible name has been entered, and that a date has been supplied. Overall outcome is Complete when all three are satisfied and Incomplete otherwise, with flagged issues identifying the specific missing fields so the recipient can correct them before the record is filed in the compliance register.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with compliance staff
