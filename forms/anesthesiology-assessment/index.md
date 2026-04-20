# Anesthesiology Assessment

UK NHS-aligned pre-operative anesthesiology assessment combining four validated scoring systems — ASA Physical Status Classification, Mallampati / Airway Score, Revised Cardiac Risk Index (RCRI / Lee Index), and STOP-BANG (OSA screening) — into a composite perioperative risk level, with flagged safety-critical issues and an anaesthetic plan.

See `doc/` and `docs/superpowers/specs/2026-04-16-anesthesiology-assessment-design.md` for the full design spec.

## Scoring system

- **Instruments**: ASA Physical Status (I-VI), Mallampati Airway Class (I-IV), RCRI (0-6), STOP-BANG (0-8)
- **Range**: Composite perioperative risk — Low / Moderate / High / Critical
- **Categories**:
  - Low: ASA I-II, Mallampati I-II, RCRI 0, STOP-BANG 0-2 — routine anaesthesia
  - Moderate: any single marker in the mid-band — additional planning
  - High: ASA III, Mallampati III-IV, RCRI ≥ 2, or STOP-BANG ≥ 5 — senior anaesthetist review
  - Critical: ASA IV-V, anatomy predicting difficult airway plus significant cardiac / respiratory comorbidity — MDT pre-op review

## Steps

| #   | Step                                      |
| --- | ----------------------------------------- |
| 1   | Patient Demographics                      |
| 2   | Planned Surgery & Proposed Anaesthesia    |
| 3   | Medical History (system-by-system)        |
| 4   | Medications                               |
| 5   | Allergies & Adverse Reactions             |
| 6   | Previous Anaesthesia & Surgery History    |
| 7   | Airway & Physical Examination             |
| 8   | Vital Signs & Investigations              |
| 9   | ASA / Mallampati / RCRI / STOP-BANG Scoring |
| 10  | Anaesthetic Plan & Consent                |

## Directory structure

```
anesthesiology-assessment/
  front-end-patient-form-with-svelte/
  front-end-clinician-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera-htmx-alpine/
```

## Technology

See [root index.md](../index.md) for technology stacks.
