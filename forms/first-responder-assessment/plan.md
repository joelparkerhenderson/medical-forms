# Plan: First Responder Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The first responder assessment uses a competency-based framework evaluating fitness and readiness of paramedics, EMTs, and first aiders. Each domain (physical fitness, clinical skills, equipment competency, communication, psychological readiness) is assessed using four competency levels: Not Competent (grade 1), Developing (grade 2), Competent (grade 3), and Expert (grade 4). The overall fitness decision aggregates findings across all domains into one of four outcomes: Fit for Duty (no restrictions), Fit with Restrictions (some limitations requiring remedial action), Temporarily Unfit (significant gaps requiring re-assessment), or Permanently Unfit (unable to meet minimum requirements). This framework supports occupational health decisions and continuing professional development planning for emergency services personnel.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
