# Clinical Safety Case — Placeholders

This form is clinical decision-support software and, under UK regulation,
falls within scope of the NHS Digital Clinical Safety Officer process
(**DCB0129** for manufacturers, **DCB0160** for deploying organisations).

This document is a **placeholder** intended to be populated during a trust
deployment. It is not a substitute for a formal safety case.

## Intended purpose (DCB0129)

> A clinician-operated pre-operative assessment record that computes an ASA
> Physical Status grade, a composite perioperative risk, and a set of
> safety-critical flags from objective findings. It supports but does not
> replace anaesthetic clinical judgement. The final ASA grade and
> anaesthesia plan are the responsibility of the registered clinician who
> signs the record.

## Intended users

Registered anaesthetists, surgeons, pre-operative assessment nurses,
perioperative physicians, and clinical pharmacists working in an NHS or
equivalent regulated healthcare setting.

## Hazard log (top-level)

| ID | Hazard | Cause | Mitigation |
| --- | --- | --- | --- |
| H-01 | Incorrect ASA grade displayed | Engine rule bug | Unit tests (`composite-grader.test.ts`); clinician override with documented reason; both computed + final persisted |
| H-02 | Missed difficult-airway prediction | Mallampati not recorded or mis-scored | Field is required on step 4; rule R-MP-III+ fires flag; safety-flag banner rendered on step 16 |
| H-03 | Stale laboratory value used | Value entered days before surgery | Lab fields timestamped; PDF report shows the entry date; step 9 panel prompts for sample date |
| H-04 | Anticoagulant not held | Step 13 plan not reviewed | Medication reconciliation flagged on step 16 if anticoagulant present and hold plan empty |
| H-05 | Fasting violation missed | Step 11 not completed | Fasting confirmation is required for submission if urgency = elective/urgent |
| H-06 | Computed grade silently overridden | Override without reason | UI requires non-empty reason when override is active; audit trail stored |
| H-07 | Incorrect patient | Mis-entry of NHS number | Step 2 requires NHS number; dashboard shows name + DOB + NHS |
| H-08 | Data loss | Browser crash before submit | LocalStorage autosave (future enhancement) |
| H-09 | Accessibility failure | Clinician with vision or motor impairment cannot use form | Axe-core audit (future); WCAG 2.2 AA target |
| H-10 | Clinical evidence drift | ASA criteria updated by ASA society | Rule catalogue in `asa-grading-rules.md` reviewed annually |

## Risk level

Indicative MDCG 2019-11 classification: **Class IIa**. The software's output
drives anaesthetic plan selection and enhanced-care triage decisions. Final
clinical decision rests with the named clinician.

## Verification evidence

- `composite-grader.test.ts` Vitest unit tests for all ASA, Mallampati,
  RCRI, STOP-BANG, and CFS rules and the composite mapping.
- `bin/test-form pre-operative-assessment-by-clinician` structural tests.
- Manual exploratory testing against a trust-supplied patient cohort
  (future / deployment-time).

## Post-market surveillance

Deploying trust to:

- Capture clinician override rate and reasons.
- Audit any critical-flag firing that did not lead to a perioperative MDT
  review.
- Report any patient harm via the local incident reporting system and DCB0129
  post-market surveillance channel.
