# Plan: Audiology Assessment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The hearing grader evaluates hearing level based on pure tone audiometry results, calculating the pure tone average (PTA) across standard frequencies (500 Hz, 1000 Hz, 2000 Hz, 4000 Hz) for each ear. The grade is assigned according to WHO/BSA classification: Normal (<=25 dB), Mild (26-40 dB), Moderate (41-55 dB), Moderately Severe (56-70 dB), Severe (71-90 dB), or Profound (>90 dB). The grader also incorporates tinnitus severity, vestibular symptoms, speech recognition scores, and otoscopic findings to generate flagged issues that warrant clinician attention, such as asymmetric hearing loss or sudden onset.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
