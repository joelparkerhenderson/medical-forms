# Plan: Consent to Treatment

## Current status

Implemented. Patient form, clinician dashboard, and Rust backend all created.

## Scoring engine

The consent to treatment form uses a completeness validation approach rather than a numerical scoring instrument. The form-validator checks that all required sections have been filled: patient identification, procedure details, documented risks and benefits, alternative treatment options, anaesthesia information, confirmation of patient understanding, acknowledgement of patient rights, and valid signatures with dates. The validation engine applies rules defined in validation-rules.ts to determine whether each section meets completeness criteria, flagging any missing or incomplete fields. The final result is a binary Complete or Incomplete status indicating whether the consent form satisfies legal and clinical requirements.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with clinical staff
