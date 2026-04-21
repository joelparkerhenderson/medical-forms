# SCORE2-Diabetes

SCORE2-Diabetes predicts 10-year risk of fatal and non-fatal cardiovascular disease in individuals with type 2 diabetes without prior CVD, aged 40-69 years. It extends the SCORE2 model with diabetes-specific predictors (HbA1c, eGFR, and age at diagnosis). Reference: <https://www.mdcalc.com/calc/10510/score2-diabetes>.

## Scoring system

- **Instrument**: SCORE2-Diabetes (ESC 2023)
- **Range**: 10-year CVD risk as percentage (0.0-100.0%)
- **Categories (age-modified thresholds)**:
  - Low / moderate: < 5 %
  - High: 5 - < 10 % (50-69 y) / < 7.5 % (40-49 y)
  - Very high: ≥ 10 % (50-69 y) / ≥ 7.5 % (40-49 y)

## Steps

| #   | Step                       |
| --- | -------------------------- |
| 1   | Patient Demographics       |
| 2   | Diabetes History           |
| 3   | Cardiovascular History     |
| 4   | Blood Pressure             |
| 5   | Lipid Profile              |
| 6   | Renal Function             |
| 7   | Lifestyle Factors          |
| 8   | Current Medications        |
| 9   | Complications Screening    |
| 10  | Risk Assessment Summary    |

## Directory structure

```
systematic-coronary-risk-evaluation-2-diabetes/
  front-end-form-with-svelte/
  front-end-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera-htmx-alpine/
```

## Technology

See [root index.md](../index.md) for technology stacks.
