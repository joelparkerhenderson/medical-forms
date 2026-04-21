# Pre-operative Assessment

Pre-operative assessment system that collects patient health data via a structured
questionnaire, computes an ASA (American Society of Anesthesiologists) Physical Status
Classification grade, and identifies safety-critical issues for anaesthetic planning.

## Scoring system

- **Instrument**: ASA Physical Status Classification (PSC)
- **Range**: I-VI
- **Categories**:
  - ASA I: Normal, healthy patient
  - ASA II: Patient with mild systemic disease
  - ASA III: Patient with severe systemic disease
  - ASA IV: Patient with severe, incapacitating systemic disease
  - ASA V: Moribund patient not expected to survive without the operation
  - ASA VI: Brain-dead patient for organ donation

## Steps

| #   | Step                     |
| --- | ------------------------ |
| 1   | Demographics             |
| 2   | Cardiovascular           |
| 3   | Respiratory              |
| 4   | Renal                    |
| 5   | Hepatic                  |
| 6   | Endocrine                |
| 7   | Neurological             |
| 8   | Haematological           |
| 9   | Musculoskeletal & Airway |
| 10  | Gastrointestinal         |
| 11  | Medications              |
| 12  | Allergies                |
| 13  | Previous Anaesthesia     |
| 14  | Social History           |
| 15  | Functional Capacity      |
| 16  | Pregnancy                |

## Directory structure

```
pre-operative-assessment-by-patient/
  front-end-patient-form-with-svelte/
  front-end-clinician-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera/
  doc/
  db/
```

## Documentation

See [doc/index.md](doc/index.md) for comprehensive documentation including ASA grading rules, clinical safety case, and deployment guides.

## Technology

See [root index.md](../index.md) for technology stacks.
