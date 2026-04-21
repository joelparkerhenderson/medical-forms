# Hospital Discharge

Hospital discharge summary form aligned with UK NICE NG27 and the SAFER patient-flow bundle, capturing diagnoses, procedures, medication reconciliation, follow-up arrangements, and community handover details to support safe transfer of care.

## Scoring system

- **Instrument**: Discharge Summary Completeness Validation (NICE NG27)
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All NICE NG27 mandatory fields supplied
  - Partial: Non-mandatory fields outstanding; discharge may proceed with flag
  - Incomplete: Mandatory fields missing; discharge should not proceed

## Steps

| #   | Step                                                  |
| --- | ----------------------------------------------------- |
| 1   | Patient Details                                       |
| 2   | Admission Summary                                     |
| 3   | Diagnoses (primary & secondary, ICD-10)               |
| 4   | Procedures Performed                                  |
| 5   | Discharge Medications (reconciled)                    |
| 6   | Follow-up Arrangements                                |
| 7   | Community Care Instructions                           |
| 8   | Warning Signs & When to Seek Help                     |
| 9   | Clinician Sign-off                                    |
| 10  | Patient / Carer Acknowledgement                       |

## Directory structure

```
hospital-discharge/
  front-end-form-with-svelte/
  front-end-dashboard-with-svelte/
```

## Technology

See [root index.md](../index.md) for technology stacks.
