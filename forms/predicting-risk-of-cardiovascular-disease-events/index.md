# Predicting Risk of Cardiovascular Disease Events (PREVENT)

AHA PREVENT risk calculator predicting 10- and 30-year risk of total cardiovascular disease (and its subtypes atherosclerotic CVD and heart failure) in patients aged 30-79 without known CVD. Incorporates kidney function and optional metabolic factors as predictors.

Reference: [MDCalc — PREVENT](https://www.mdcalc.com/calc/10491/predicting-risk-cardiovascular-disease-events-prevent)

## Scoring system

- **Instrument**: AHA PREVENT equations (2023)
- **Range**: 10-year and 30-year risk as percentages (0.0-100.0%)
- **Predicted outcomes**: total CVD, atherosclerotic CVD (ASCVD), heart failure (HF)
- **Categories** (10-year total CVD):
  - Low: < 5 %
  - Borderline: 5 - < 7.5 %
  - Intermediate: 7.5 - < 20 %
  - High: ≥ 20 %

## Steps

| #   | Step                              |
| --- | --------------------------------- |
| 1   | Demographics                      |
| 2   | Blood Pressure                    |
| 3   | Cholesterol & Lipids              |
| 4   | Metabolic Health (BMI, HbA1c)     |
| 5   | Renal Function (eGFR, ACR)        |
| 6   | Smoking History                   |
| 7   | Medical History                   |
| 8   | Current Medications               |
| 9   | Review & Calculate                |

## Directory structure

```
predicting-risk-of-cardiovascular-disease-events/
  front-end-form-with-svelte/
  front-end-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera-htmx-alpine/
```

## Technology

See [root index.md](../index.md) for technology stacks.
