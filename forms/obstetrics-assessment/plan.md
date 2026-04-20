# Plan: Obstetrics Assessment

## Current status

Design spec complete. Implementation pending.

## Scoring engine

The antenatal grader evaluates NICE NG201 risk factors across obstetric history (previous caesarean, preterm birth, pre-eclampsia, stillbirth), maternal medical conditions (cardiac, renal, diabetes, VTE), current pregnancy complications (multiple pregnancy, placenta praevia, fetal anomaly), mental-health screen (Whooley, GAD-2), and social factors (domestic abuse disclosure, substance misuse). Any high-risk factor escalates the overall level to High Risk. Moderate Risk is assigned where modifiable or intermediate-severity factors are present. Flagged issues include missed first-trimester booking, un-offered combined screening, and positive mental-health screens that require perinatal mental-health referral.

## Future enhancements

- Add input validation with Zod schemas
- Add accessibility audit (axe-core)
- Add end-to-end tests with Playwright
- Add form autosave to localStorage
- Add internationalisation (i18n) support
- Add backend database migrations and seed data
- Clinical safety case documentation
- User acceptance testing with maternity teams
