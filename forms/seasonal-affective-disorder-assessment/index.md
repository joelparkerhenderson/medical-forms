# Seasonal Affective Disorder Assessment

Seasonal mood disorder evaluation using SPAQ Global Seasonality Score (GSS) and PHQ-9 depression severity screening with combined severity classification.

## Scoring system

- **Instruments**: SPAQ Global Seasonality Score (GSS) + PHQ-9 Depression Severity
- **SPAQ GSS Range**: 0-24
  - 0-7: No SAD
  - 8-10: Subsyndromal SAD
  - 11-24: SAD likely
- **PHQ-9 Range**: 0-27
  - 0-4: Minimal depression
  - 5-9: Mild depression
  - 10-14: Moderate depression
  - 15-19: Moderately severe depression
  - 20-27: Severe depression
- **Combined Severity**:
  - No SAD: GSS 0-7, PHQ-9 0-4
  - Mild: Subsyndromal SAD (GSS 8-10), PHQ-9 5-9
  - Moderate: SAD likely (GSS 11-24), PHQ-9 10-14
  - Severe: SAD likely (GSS 11-24), PHQ-9 15-19
  - Critical: SAD likely (GSS 11-24), PHQ-9 20-27, or suicidal ideation present

## Steps

| #   | Step                          |
| --- | ----------------------------- |
| 1   | Demographics                  |
| 2   | Seasonal Pattern History      |
| 3   | Current Mood Assessment (PHQ-9) |
| 4   | Sleep & Energy                |
| 5   | Appetite & Weight Changes     |
| 6   | Social & Occupational Impact  |
| 7   | Light Exposure Assessment     |
| 8   | Previous Treatments           |
| 9   | Risk Assessment (Self-harm)   |
| 10  | Treatment Plan & Monitoring   |

## Directory structure

```
seasonal-affective-disorder-assessment/
  front-end-form-with-svelte/
  front-end-dashboard-with-svelte/
```

## Technology

See [root index.md](../index.md) for technology stacks.
