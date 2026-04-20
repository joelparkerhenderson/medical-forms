# Plan: Vaccinations Checklist

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The vaccinations checklist uses a compliance-based classification system. Vaccination compliance is graded as Fully Immunised (all recommended vaccinations complete and up to date), Partially Immunised (some vaccinations incomplete or overdue), Non-Compliant (required vaccinations missing), or Contraindicated (medical exemptions documented). Risk stratification ranges from Low (fully immunised) through Moderate (partially immunised with non-critical gaps) and High (non-compliant in a high-risk occupational role) to Critical (active exposure without documented immunity). The checklist covers routine childhood immunisations (MMR, DTP, polio, Hib, MenC), occupational vaccines (Hepatitis B, BCG, varicella), travel vaccines, COVID-19, influenza, and incorporates serology/immunity testing results and contraindication documentation.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
