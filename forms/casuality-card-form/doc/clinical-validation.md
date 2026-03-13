# Clinical Validation Guide

## Overview

This document provides test scenarios, expected outcomes, and procedures for validating the NEWS2 calculator engine and the flagged issues detection engine. It is intended for use during development, quality assurance, and clinical safety review.

## NEWS2 Score Calculation Verification

### Boundary Values per Parameter

#### Respiratory Rate (breaths per minute)

| Input | Expected Score | Boundary Type     |
|-------|---------------|-------------------|
| 7     | 3             | Below lower bound |
| 8     | 3             | Lower bound (<=8) |
| 9     | 1             | Transition 3->1   |
| 11    | 1             | Upper bound 9-11  |
| 12    | 0             | Transition 1->0   |
| 20    | 0             | Upper bound 12-20 |
| 21    | 2             | Transition 0->2   |
| 24    | 2             | Upper bound 21-24 |
| 25    | 3             | Transition 2->3   |
| 30    | 3             | Above upper bound |

#### SpO2 Scale 1 (%)

| Input | Expected Score | Boundary Type     |
|-------|---------------|-------------------|
| 85    | 3             | Below lower bound |
| 91    | 3             | Upper bound (<=91)|
| 92    | 2             | Transition 3->2   |
| 93    | 2             | Upper bound 92-93 |
| 94    | 1             | Transition 2->1   |
| 95    | 1             | Upper bound 94-95 |
| 96    | 0             | Transition 1->0   |
| 100   | 0             | Above upper bound |

#### Systolic Blood Pressure (mmHg)

| Input | Expected Score | Boundary Type     |
|-------|---------------|-------------------|
| 80    | 3             | Below lower bound |
| 90    | 3             | Upper bound (<=90)|
| 91    | 2             | Transition 3->2   |
| 100   | 2             | Upper bound 91-100|
| 101   | 1             | Transition 2->1   |
| 110   | 1             | Upper bound 101-110|
| 111   | 0             | Transition 1->0   |
| 219   | 0             | Upper bound 111-219|
| 220   | 3             | Transition 0->3   |
| 250   | 3             | Above upper bound |

#### Pulse (beats per minute)

| Input | Expected Score | Boundary Type     |
|-------|---------------|-------------------|
| 35    | 3             | Below lower bound |
| 40    | 3             | Upper bound (<=40)|
| 41    | 1             | Transition 3->1   |
| 50    | 1             | Upper bound 41-50 |
| 51    | 0             | Transition 1->0   |
| 90    | 0             | Upper bound 51-90 |
| 91    | 1             | Transition 0->1   |
| 110   | 1             | Upper bound 91-110|
| 111   | 2             | Transition 1->2   |
| 130   | 2             | Upper bound 111-130|
| 131   | 3             | Transition 2->3   |
| 160   | 3             | Above upper bound |

#### Consciousness Level

| Input        | Expected Score | Notes                    |
|--------------|---------------|--------------------------|
| Alert        | 0             | Normal consciousness     |
| Confusion    | 3             | CVPU (non-alert)         |
| Voice        | 3             | CVPU (non-alert)         |
| Pain         | 3             | CVPU (non-alert)         |
| Unresponsive | 3             | CVPU (non-alert)         |

#### Temperature (degrees Celsius)

| Input | Expected Score | Boundary Type     |
|-------|---------------|-------------------|
| 34.0  | 3             | Below lower bound |
| 35.0  | 3             | Upper bound (<=35.0)|
| 35.1  | 1             | Transition 3->1   |
| 36.0  | 1             | Upper bound 35.1-36.0|
| 36.1  | 0             | Transition 1->0   |
| 38.0  | 0             | Upper bound 36.1-38.0|
| 38.1  | 1             | Transition 0->1   |
| 39.0  | 1             | Upper bound 38.1-39.0|
| 39.1  | 3             | Transition 1->3   |
| 40.0  | 3             | Above upper bound |

#### Supplemental Oxygen

| Input | Expected Score | Notes        |
|-------|---------------|--------------|
| No    | 0             | Room air     |
| Yes   | 2             | Any supplemental O2 |

### Aggregate Score Scenarios

#### Scenario A: All Normal (Score 0)

| Parameter         | Value  | Sub-score |
|-------------------|--------|-----------|
| Respiratory Rate  | 16     | 0         |
| SpO2              | 98     | 0         |
| Systolic BP       | 120    | 0         |
| Pulse             | 72     | 0         |
| Consciousness     | Alert  | 0         |
| Temperature       | 37.0   | 0         |
| Supplemental O2   | No     | 0         |
| **Total**         |        | **0**     |

Expected clinical response: Low risk. Routine monitoring.

#### Scenario B: Moderate Derangement (Score 6)

| Parameter         | Value  | Sub-score |
|-------------------|--------|-----------|
| Respiratory Rate  | 22     | 2         |
| SpO2              | 94     | 1         |
| Systolic BP       | 105    | 1         |
| Pulse             | 95     | 1         |
| Consciousness     | Alert  | 0         |
| Temperature       | 38.5   | 1         |
| Supplemental O2   | No     | 0         |
| **Total**         |        | **6**     |

Expected clinical response: Medium risk. Urgent review.

#### Scenario C: Severe Derangement (Score 12)

| Parameter         | Value       | Sub-score |
|-------------------|-------------|-----------|
| Respiratory Rate  | 28          | 3         |
| SpO2              | 90          | 3         |
| Systolic BP       | 88          | 3         |
| Pulse             | 135         | 3         |
| Consciousness     | Voice       | 3         |
| Temperature       | 35.5        | 1         |
| Supplemental O2   | Yes         | 2         |
| **Total**         |             | **18**    |

Expected clinical response: High risk. Emergency assessment by critical care.

#### Scenario D: Single Parameter Trigger (Score 3 aggregate, single param 3)

| Parameter         | Value       | Sub-score |
|-------------------|-------------|-----------|
| Respiratory Rate  | 16          | 0         |
| SpO2              | 98          | 0         |
| Systolic BP       | 120         | 0         |
| Pulse             | 72          | 0         |
| Consciousness     | Confusion   | 3         |
| Temperature       | 37.0        | 0         |
| Supplemental O2   | No          | 0         |
| **Total**         |             | **3**     |

Expected clinical response: Low-Medium risk (single parameter score of 3). Urgent ward-based review despite low aggregate.

## Clinical Response Level Determination

| Aggregate Score | Single Param >= 3? | Expected Level |
|----------------|--------------------|----------------|
| 0              | No                 | Low            |
| 4              | No                 | Low            |
| 3              | Yes                | Low-Medium     |
| 4              | Yes                | Low-Medium     |
| 5              | No                 | Medium         |
| 5              | Yes                | Medium (Medium overrides Low-Medium) |
| 6              | No                 | Medium         |
| 7              | No                 | High           |
| 7              | Yes                | High           |
| 15             | Yes                | High           |

## Flagged Issues Detection Scenarios

### Flag 1: NEWS2 Critical

- **Input**: NEWS2 aggregate score = 7
- **Expected**: `news2-critical` flag raised, priority Critical
- **Verify**: Flag appears when score transitions from 6 to 7

### Flag 2: NEWS2 Medium

- **Input**: NEWS2 aggregate score = 5
- **Expected**: `news2-medium` flag raised, priority Warning
- **Verify**: Flag clears when score drops below 5; replaced by `news2-critical` at >= 7

### Flag 3: Single Parameter Score 3

- **Input**: Consciousness = "Voice" (score 3), all others normal (aggregate 3)
- **Expected**: `news2-single-param-3` flag raised, priority Warning
- **Verify**: Flag clears when consciousness returns to "Alert"

### Flag 4: Safeguarding Concern

- **Input**: `safeguardingConcern` = "yes"
- **Expected**: `safeguarding-concern` flag raised, priority Critical
- **Verify**: Flag clears when `safeguardingConcern` = "no"

### Flag 5: Anaphylaxis History

- **Input**: `allergies` array contains `{ allergen: "Penicillin", reaction: "Anaphylaxis", severity: "anaphylaxis" }`
- **Expected**: `anaphylaxis-history` flag raised, priority Warning
- **Verify**: Flag clears when all anaphylaxis-severity allergies are removed

### Flag 6: Anticoagulant Use

- **Input**: `medications` array contains `{ name: "Warfarin", dose: "5mg", frequency: "once daily" }`
- **Expected**: `anticoagulant-use` flag raised, priority Warning
- **Additional cases**: Test each anticoagulant name (warfarin, rivaroxaban, apixaban, edoxaban, dabigatran, heparin, enoxaparin) and verify case-insensitive matching (e.g. "WARFARIN", "Warfarin", "warfarin")

### Flag 7: GCS <= 8

- **Input**: `gcsEye` = 2, `gcsVerbal` = 2, `gcsMotor` = 4 (total = 8)
- **Expected**: `gcs-unconscious` flag raised, priority Critical
- **Boundary**: `gcsEye` = 3, `gcsVerbal` = 2, `gcsMotor` = 4 (total = 9) -- flag should NOT be raised

### Flag 8: Non-Reactive Pupils

- **Input**: `pupilLeftReactive` = false, `pupilRightReactive` = true
- **Expected**: `non-reactive-pupils` flag raised, priority Critical
- **Additional**: Test with only right non-reactive; test with both non-reactive

### Flag 9: Active Haemorrhage

- **Input**: `circulation.haemorrhage` indicates active bleeding
- **Expected**: `active-haemorrhage` flag raised, priority Critical
- **Verify**: Flag clears when haemorrhage status changes to none/controlled

### Flag 10: Compromised/Obstructed Airway

- **Input**: `airway.status` = "compromised"
- **Expected**: `airway-compromised` flag raised, priority Critical
- **Additional**: Test with `airway.status` = "obstructed" (should also raise flag)
- **Verify**: Flag clears when `airway.status` = "patent"

### Flag 11: Pregnancy Test Positive

- **Input**: `urinalysis.pregnancyTest` = "positive"
- **Expected**: `pregnancy-positive` flag raised, priority Warning
- **Verify**: Flag not raised for "negative" or "not performed"

### Flag 12: Mental Health Act Status

- **Input**: `mentalHealthActStatus` = "Section 2"
- **Expected**: `mental-health-act` flag raised, priority Warning
- **Additional**: Test with "Section 3", "Section 136" and other valid sections

## Edge Cases

### All Null Vitals

- **Input**: All vital sign fields are `null`
- **Expected**: NEWS2 score is `null` (not calculable). No NEWS2-related flags are raised. The UI displays a message indicating insufficient data for scoring.
- **Rationale**: Partial or absent vital signs should not produce a misleading score of 0.

### Single Vital Entry

- **Input**: Only `heartRate` = 45 is entered; all other vitals are `null`
- **Expected**: NEWS2 score is `null` (insufficient parameters). Individual parameter sub-score for pulse would be 1, but the aggregate is not computed.
- **Rationale**: A valid NEWS2 requires all seven parameters.

### Maximum Scores

- **Input**: RR = 6, SpO2 = 85, Systolic BP = 80, Pulse = 35, Consciousness = "Unresponsive", Temperature = 34.0, Supplemental O2 = Yes
- **Expected**: Each parameter scores 3 (except supplemental O2 which scores 2). Total = 3+3+3+3+3+3+2 = 20 (maximum).
- **Verify**: `news2-critical` flag is raised. Multiple other flags may also be raised (GCS likely <= 8 if consciousness is Unresponsive).

### Minimum Non-Zero Score

- **Input**: All parameters in the 0-score range except temperature = 35.5 (score 1).
- **Expected**: NEWS2 aggregate = 1. Clinical response = Low.

### Anticoagulant Partial Match

- **Input**: Medication name = "warfarin sodium" (contains "warfarin")
- **Expected**: Verify whether the matching logic uses substring or exact match, and document the behaviour. The engine should match on substring to catch brand names and formulations.
