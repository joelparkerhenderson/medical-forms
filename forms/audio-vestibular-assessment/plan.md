# Plan: Audio-Vestibular Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The audio-vestibular grader averages air-conduction thresholds at 0.5, 1, 2, and 4 kHz to compute a pure-tone average per ear and maps each to the WHO hearing-loss grade. Bone-conduction thresholds and air-bone gaps classify conductive, sensorineural, or mixed loss. The Dizziness Handicap Inventory produces functional, emotional, and physical sub-scores summed to a 0-100 total, banded No, Mild, Moderate, or Severe handicap. Flagged issues include asymmetrical sensorineural loss (possible retrocochlear lesion), positive head-impulse test, or high DHI with positive Dix-Hallpike — each triggers targeted ENT / audiology / vestibular-therapy referral pathways.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with audiologists and ENT clinicians
