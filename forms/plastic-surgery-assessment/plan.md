# Plan: Plastic Surgery Assessment

## Current status

Implemented. Patient form, clinician dashboard, and SQL migrations all created.

## Scoring engine

The plastic surgery assessment uses three complementary classification systems. The ASA (American Society of Anesthesiologists) Physical Status Classification grades patient fitness from Class I (normal healthy patient) through Class V (moribund patient). The Wound Classification grades surgical site contamination from Class I (clean) through Class IV (dirty/infected). The Surgical Complexity Score grades procedure complexity from 1 (minor) through 4 (major/emergency reconstruction). Together these provide a comprehensive risk profile covering anaesthetic fitness, wound contamination risk, and operative complexity, informing surgical planning and perioperative care decisions.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
