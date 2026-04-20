# Plan: Workplace Safety Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The workplace safety assessment applies the UK HSE audit checklist across ten risk domains. Each item is evaluated against a defined control standard and assigned a finding level: compliant, minor, major, or critical. The overall assessment outcome is determined by the highest-severity finding (any critical finding escalates the whole audit to Critical). Flagged issues highlight specific hazards requiring immediate action and automatically populate a time-bound corrective action plan aligned to HSE enforcement thresholds and internal safety governance.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with safety officers
