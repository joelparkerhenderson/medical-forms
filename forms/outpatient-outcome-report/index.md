# Outpatient Outcome Report

Structured outpatient outcome report documenting encounter details, operational efficiency, clinical outcome, patient-reported outcome measures (PROMs), patient-reported experience measures (PREMs), and follow-up plan, with a four-domain composite grade (Outpatient Outcome Composite Grade, OOCG).

## Scoring system

- **Instrument**: Outpatient Outcome Composite Grade (OOCG)
- **Overall range**: Grade A (best) through Grade E (worst)
- **Domains** (each A–E; overall = worst of the four):
  - **Clinical** — clinician-rated outcome (Resolved / Improved / Unchanged / Worsened / Died)
  - **PROM** — composite of EQ-5D-5L (5 dimensions + VAS, before/after), Global Rating of Change (GRC) 7-point, and PROMIS Global Health v1.2 (GPH + GMH T-scores)
  - **PREM** — Friends and Family Test (Very Good → Very Poor)
  - **Operational** — NHS Data Dictionary Attendance Outcome code + wait-time-to-appointment vs service target + consultation modality

## Steps

| #   | Step                                      |
| --- | ----------------------------------------- |
| 1   | Patient Details                           |
| 2   | Encounter Details                         |
| 3   | Operational Efficiency                    |
| 4   | Clinical Outcome                          |
| 5   | PROM — EQ-5D-5L                           |
| 6   | PROM — Global Rating of Change            |
| 7   | PROM — PROMIS Global Health v1.2          |
| 8   | PREM — Friends and Family Test            |
| 9   | Follow-up Plan                            |
| 10  | Sign-off                                  |
| 11  | Review & Submit                           |

## Directory structure

```
outpatient-outcome-report/
  front-end-form-with-html/
  front-end-form-with-svelte/
  front-end-dashboard-with-html/
  front-end-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera-htmx-alpine/
  sql-migrations/
  xml-representations/
  fhir-r5/
  cargo-loco-generate/
  doc/
```

## Licensing

- EQ-5D-5L is © EuroQol Research Foundation; wording paraphrased, licence required for production use.
- Friends and Family Test is NHS England, Open Government Licence v3.0.
- PROMIS Global Health v1.2 is NIH-funded, public domain.
- NHS Attendance Outcome is NHS Data Dictionary, OGL.

See `doc/licensing.md` for details.

## Technology

See [root index.md](../index.md) for technology stacks.
