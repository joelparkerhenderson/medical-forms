# Plan: Hospital Discharge

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The hospital discharge validator checks each NICE NG27 mandatory field for completeness — principal diagnosis, procedures, medication reconciliation, follow-up arrangements, and clinician sign-off — and classifies the record as Complete, Partial, or Incomplete. Medication reconciliation triggers an extra rule-based check comparing admission, inpatient, and discharge medication lists, flagging omissions, duplications, or missing indications. Critical flagged issues (for example, a missing anticoagulation plan in a patient with atrial fibrillation) block discharge until resolved, aligning with the SAFER bundle and MHRA alerts on discharge medicines safety.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with discharge coordinators
