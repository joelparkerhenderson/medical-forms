# Plan: International Patient Summary

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The IPS validator walks each mandatory section defined in the HL7 FHIR International Patient Summary Implementation Guide and the underlying ISO 27269:2021 data set. Each section is classified Populated, Empty, or Invalid. Overall outcome is Complete when every mandatory section is populated, Partial when mandatory sections are populated but optional sections remain empty, and Incomplete when a mandatory section is missing or fails terminology validation. Flagged issues include missing author, expired advance directives, stale medication reconciliation, and terminology-binding mismatches (SNOMED CT / ICD-10 / ATC / LOINC).

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support across EU languages
- Add backend database migrations and seed data
- Clinical safety case documentation
- Conformance testing against the HL7 FHIR IPS validator
- User acceptance testing with cross-border referral teams
