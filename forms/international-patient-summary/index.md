# International Patient Summary

International Patient Summary (IPS) — a standardised, minimal, specialty-agnostic electronic health record extract conforming to ISO 27269 and HL7 FHIR R5, designed to support cross-border and unplanned care by exchanging a patient's core clinical facts (medications, allergies, problems, procedures, immunisations, demographics).

## Scoring system

- **Instrument**: IPS Completeness Validation (ISO 27269 / HL7 FHIR IPS IG)
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All mandatory IPS sections populated
  - Partial: Mandatory sections present; one or more optional sections empty
  - Incomplete: At least one mandatory section missing or unparseable

## Steps

| #   | Step                                           |
| --- | ---------------------------------------------- |
| 1   | Patient Demographics                           |
| 2   | Problem List (active & past)                   |
| 3   | Medication Summary                             |
| 4   | Allergies & Intolerances                       |
| 5   | Immunisations                                  |
| 6   | Procedures                                     |
| 7   | Results & Investigations                       |
| 8   | Medical Devices / Implants                     |
| 9   | Advance Directives & Consent                   |
| 10  | Authoring Clinician & Signoff                  |

## Directory structure

```
international-patient-summary/
  front-end-form-with-svelte/
  front-end-dashboard-with-svelte/
  full-stack-with-rust-axum-loco-tera-htmx-alpine/
```

## Technology

See [root index.md](../index.md) for technology stacks.
