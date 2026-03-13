# NEWS2 Scoring Reference

## Overview

The National Early Warning Score 2 (NEWS2) is a standardised clinical scoring system developed by the Royal College of Physicians (RCP) to improve the detection and response to clinical deterioration in adult patients. NEWS2 is widely adopted across NHS trusts and is recommended by NHS England for use in acute and ambulance settings.

NEWS2 aggregates six physiological parameters plus supplemental oxygen status into a single composite score (range 0--20). The score guides clinical decision-making by triggering escalation pathways proportional to the severity of physiological derangement.

## Scored Parameters

NEWS2 evaluates 7 parameters. Each parameter contributes a sub-score of 0, 1, 2, or 3 based on the measured value.

### 1. Respiratory Rate (breaths per minute)

| Score 3 | Score 2 | Score 1 | Score 0 | Score 1 | Score 2 | Score 3 |
|---------|---------|---------|---------|---------|---------|---------|
| <=8     |         | 9--11   | 12--20  |         | 21--24  | >=25    |

### 2. Oxygen Saturation -- SpO2 Scale 1 (%)

Scale 1 is used for patients with a normal target SpO2 of >= 96%.

| Score 3 | Score 2 | Score 1 | Score 0 |
|---------|---------|---------|---------|
| <=91    | 92--93  | 94--95  | >=96    |

### 3. Systolic Blood Pressure (mmHg)

| Score 3 | Score 2 | Score 1 | Score 0 | Score 1 | Score 2 | Score 3 |
|---------|---------|---------|---------|---------|---------|---------|
| <=90    | 91--100 | 101--110| 111--219|         |         | >=220   |

### 4. Pulse (beats per minute)

| Score 3 | Score 2 | Score 1 | Score 0 | Score 1 | Score 2 | Score 3 |
|---------|---------|---------|---------|---------|---------|---------|
| <=40    |         | 41--50  | 51--90  | 91--110 | 111--130| >=131   |

### 5. Consciousness Level

| Score 0 | Score 3 |
|---------|---------|
| Alert   | Confusion, Voice, Pain, or Unresponsive (CVPU) |

NEWS2 uses the ACVPU scale (Alert, Confusion, Voice, Pain, Unresponsive). Any level other than "Alert" scores 3.

### 6. Temperature (degrees Celsius)

| Score 3   | Score 2     | Score 1     | Score 0     | Score 1     | Score 2 | Score 3 |
|-----------|-------------|-------------|-------------|-------------|---------|---------|
| <=35.0    |             | 35.1--36.0  | 36.1--38.0  | 38.1--39.0  |         | >=39.1  |

### 7. Supplemental Oxygen

| Score 0           | Score 2                |
|-------------------|------------------------|
| No (room air)     | Yes (any supplemental) |

Any patient receiving supplemental oxygen scores 2 for this parameter.

## Aggregate Score Calculation

The NEWS2 aggregate score is the sum of all seven individual parameter scores:

```
NEWS2 Total = RR score + SpO2 score + Systolic BP score + Pulse score
            + Consciousness score + Temperature score + Supplemental O2 score
```

Minimum possible score: 0 (all parameters within normal range, no supplemental O2)
Maximum possible score: 20 (all parameters at extreme derangement, on supplemental O2)

## Clinical Response Thresholds

| Aggregate Score          | Clinical Risk | Suggested Response                                                                                       |
|--------------------------|---------------|----------------------------------------------------------------------------------------------------------|
| 0--4                     | Low           | Routine monitoring. Minimum 12-hourly observations.                                                      |
| 3 in any single parameter| Low-Medium    | Urgent ward-based review by a clinician competent to assess acute illness. Minimum 1-hourly observations. |
| 5--6                     | Medium        | Urgent review by a clinician with core competencies in acute illness. Minimum 1-hourly observations.      |
| >= 7                     | High          | Emergency assessment by a clinical team with critical care competencies, including airway management.      |

### Clinical Escalation Pathways

#### Low (score 0--4)

- Continue routine observations at a minimum frequency of every 12 hours.
- The registered nurse on duty decides whether increased frequency of monitoring or clinical escalation is required.

#### Low-Medium (single parameter score 3)

- A registered nurse urgently informs the medical team caring for the patient.
- A competent clinician reviews the patient within 30 minutes.
- Clinical assessment determines whether to increase monitoring frequency or escalate further.
- Observations increase to a minimum of every hour.

#### Medium (score 5--6)

- The nurse urgently informs the medical team caring for the patient.
- A clinician with core competencies in the care of acutely ill patients reviews within 30 minutes.
- Consider whether escalation to a critical care team is appropriate.
- Observations increase to a minimum of every hour.

#### High (score >= 7)

- Emergency assessment by a team with critical care competencies, including airway management skills.
- The clinical team assesses the patient within 15 minutes.
- Transfer to a Level 2 or Level 3 care facility is considered.
- Continuous monitoring of vital signs is initiated.

## SpO2 Scale 2 (Future Enhancement)

SpO2 Scale 2 is used for patients with a prescribed target oxygen saturation of 88--92%, typically those with chronic hypercapnic respiratory failure (e.g. COPD). Scale 2 adjusts the SpO2 scoring thresholds to avoid over-oxygenation:

| Score 3 | Score 2 | Score 1 | Score 0 | Score 1 | Score 2 | Score 3 |
|---------|---------|---------|---------|---------|---------|---------|
| <=83    | 84--85  | 86--87  | 88--92 or >=93 on air |93--94 on O2|95--96 on O2|>=97 on O2|

Scale 2 is not currently implemented and is recorded here for future development.

## References

- Royal College of Physicians. *National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS.* RCP, 2017.
- NHS England. *Resources to support the adoption of NEWS2.* Available at: https://www.england.nhs.uk/ourwork/clinical-policy/sepsis/nationalearlywarningscore/
