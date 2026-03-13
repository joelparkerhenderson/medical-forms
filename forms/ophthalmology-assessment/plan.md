# Plan: Ophthalmology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The Visual Acuity Grade scoring engine evaluates ophthalmic findings by grading visual acuity measurements from both eyes, incorporating best-corrected values. It assesses anterior and posterior segment findings alongside visual field defects and pupillary responses to produce an overall acuity grade. Functional impact on daily activities is also factored into the clinical summary.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
