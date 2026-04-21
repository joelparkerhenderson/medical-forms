# Medical Error Report

Medical error reporting form for incident documentation, root cause analysis, and patient safety improvement. Uses WHO severity scale and NCC MERP harm categories.

## Scoring system

- **Instrument**: WHO Severity Scale + NCC MERP Harm Categories
- **WHO Severity Scale**:
  - Near Miss: Error occurred but did not reach patient (no harm)
  - Mild: Temporary minor harm, no intervention required
  - Moderate: Temporary significant harm, intervention required
  - Severe: Permanent harm to patient
  - Critical: Death or life-threatening event
- **NCC MERP Categories**:
  - A: Circumstances that have the capacity to cause error
  - B: Error occurred but did not reach patient
  - C: Error reached patient but caused no harm
  - D: Error reached patient, required monitoring to confirm no harm
  - E: Error contributed to temporary harm, required intervention
  - F: Error contributed to temporary harm, required hospitalisation
  - G: Error contributed to permanent harm
  - H: Error required intervention to sustain life
  - I: Error contributed to patient death

## Steps

| #   | Step                    |
| --- | ----------------------- |
| 1   | Demographics            |
| 2   | Incident Details        |
| 3   | Patient Involvement     |
| 4   | Error Classification    |
| 5   | Contributing Factors    |
| 6   | Immediate Actions Taken |
| 7   | Patient Outcome         |
| 8   | Root Cause Analysis     |
| 9   | Corrective Actions      |
| 10  | Reporting & Follow-up   |

## Directory structure

```
medical-error-report/
  front-end-form-with-svelte/
  front-end-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera/
```

## Technology

See [root index.md](../index.md) for technology stacks.
