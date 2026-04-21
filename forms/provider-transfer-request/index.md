# Provider Transfer Request

Inter-provider handover form for transferring a patient's care between clinicians, wards, or organisations, structured around the SBAR (Situation, Background, Assessment, Recommendation) framework with transfer-logistics capture.

## Scoring system

- **Instrument**: Provider Transfer Completeness Validation (SBAR-aligned)
- **Range**: Complete / Partial / Incomplete
- **Categories**:
  - Complete: All mandatory SBAR and logistics fields supplied; receiving provider acknowledged
  - Partial: Non-mandatory fields outstanding; transfer may proceed with flag
  - Incomplete: Mandatory fields missing; transfer should not proceed

## Steps

| #   | Step                                |
| --- | ----------------------------------- |
| 1   | Requesting Provider Details         |
| 2   | Receiving Provider Details          |
| 3   | Patient Demographics                |
| 4   | Situation — Reason for Transfer     |
| 5   | Background — Relevant History       |
| 6   | Assessment — Current Clinical Status |
| 7   | Recommendation — Requested Action   |
| 8   | Transfer Logistics                  |
| 9   | Sign-off & Acknowledgement          |

## Directory structure

```
provider-transfer-request/
  front-end-form-with-svelte/
  front-end-dashboard-with-svelte/
```

## Technology

See [root index.md](../index.md) for technology stacks.
