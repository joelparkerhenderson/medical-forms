# Psychology Assessment

General psychological screening assessment that collects self-reported data
on depression, anxiety, and stress symptoms using the **DASS-21** instrument,
computes severity categories per subscale, and flags safety-critical items
(e.g. suicidal ideation) for clinician review.

## Scoring system

- **Instrument**: Depression Anxiety Stress Scales — 21-item (DASS-21)
- **Subscales**: Depression, Anxiety, Stress (7 items each)
- **Item scale**: 0 (did not apply) – 3 (applied very much or most of the time)
- **Raw range per subscale**: 0–21 (doubled to align with DASS-42 norms)
- **Severity categories**:
  - Normal
  - Mild
  - Moderate
  - Severe
  - Extremely Severe

## Steps

| #   | Step                   |
| --- | ---------------------- |
| 1   | Demographics           |
| 2   | Reason for Assessment  |
| 3   | DASS-21 Depression     |
| 4   | DASS-21 Anxiety        |
| 5   | DASS-21 Stress         |
| 6   | Functional Impact      |
| 7   | Risk Screen            |
| 8   | Support and History    |

## Directory structure

```
psychology-assessment/
  front-end-form-with-html/
  front-end-form-with-svelte/
  front-end-dashboard-with-html/
  front-end-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera-htmx-alpine/
  doc/
  sql-migrations/
  xml-representations/
  fhir-r5/
```

## Documentation

See [doc/index.md](doc/index.md) for DASS-21 scoring rules, risk escalation
policy, and clinical safety notes.

## Technology

See [root index.md](../../index.md) for technology stacks.
