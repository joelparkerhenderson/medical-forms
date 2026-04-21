# Heart Health Check

NHS Heart Health Check for cardiovascular risk assessment using simplified QRISK3-based scoring with 10-year CVD risk estimation and heart age calculation.

## Scoring system

- **Instrument**: Simplified QRISK3-based cardiovascular risk
- **Range**: 0.1–95.0% (10-year CVD risk)
- **Categories**: Low (<10%), Moderate (10–19.9%), High (>=20%)
- **Heart age**: Estimated age at which an average person would have the same 10-year risk

## Steps

| #  | Step                     | Section Key           |
| -- | ------------------------ | --------------------- |
| 1  | Patient Information      | patientInformation    |
| 2  | Demographics & Ethnicity | demographicsEthnicity |
| 3  | Blood Pressure           | bloodPressure         |
| 4  | Cholesterol              | cholesterol           |
| 5  | Medical Conditions       | medicalConditions     |
| 6  | Family History           | familyHistory         |
| 7  | Smoking & Alcohol        | smokingAlcohol        |
| 8  | Physical Activity & Diet | physicalActivityDiet  |
| 9  | Body Measurements        | bodyMeasurements      |
| 10 | Review & Calculate       | reviewCalculate       |

## Directory structure

```
heart-health-check/
  doc/                                          # Additional documentation
  front-end-form-with-html/                         # Patient form (HTML/CSS/JS)
  front-end-dashboard-with-html/                    # Dashboard (HTML/CSS/JS)
  front-end-form-with-svelte/                       # Patient form (SvelteKit + Tailwind)
  front-end-dashboard-with-svelte/                  # Dashboard (SvelteKit + SVAR)
  full-stack-with-rust-axum-loco-tera-htmx-alpine/  # Backend (Rust + Loco + Tera)
  sql-migrations/                               # PostgreSQL schema migrations
```

## Technology

See [root index.md](../index.md) for technology stacks.
