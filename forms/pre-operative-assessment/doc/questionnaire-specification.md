# Questionnaire Specification

This document provides the detailed specification of all 16 questionnaire steps, including every field, data types, conditional logic, and validation rules.

## Overview

The questionnaire consists of 16 steps presented as a wizard. Steps 1-15 are always shown. Step 16 (Pregnancy) is conditionally shown only for female patients aged 12-55.

Each step maps to a section of the `AssessmentData` TypeScript interface, ensuring type-safe data binding throughout the application.

---

## Step 1: Demographics

**Section:** `demographics`
**Purpose:** Collect basic patient identification and biometric data.

| Field | Type | Required | Options/Range | Notes |
|-------|------|----------|--------------|-------|
| firstName | text | Yes | - | Patient's first name |
| lastName | text | Yes | - | Patient's last name |
| dateOfBirth | date | Yes | - | Used for age calculation |
| sex | radio | Yes | male, female, other | Determines pregnancy step visibility |
| weight | number | Yes | 1-400 kg | Used for BMI calculation |
| height | number | Yes | 50-250 cm | Used for BMI calculation |
| bmi | computed | - | - | Auto-calculated: weight / (height/100)^2 |
| plannedProcedure | text | Yes | - | Free text description of planned surgery |
| procedureUrgency | select | Yes | elective, urgent, emergency | Emergency triggers a safety flag |

**Auto-calculations:**
- BMI is computed in real time from weight and height
- BMI category label is displayed (Underweight/Normal/Overweight/Obese I/II/III)
- Age is calculated from dateOfBirth for use by other steps and rules

---

## Step 2: Cardiovascular

**Section:** `cardiovascular`
**Purpose:** Assess cardiac and vascular conditions.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| hypertension | radio | - | - | yes, no |
| hypertensionControlled | radio | - | hypertension = yes | yes, no |
| ischemicHeartDisease | radio | - | - | yes, no |
| ihdDetails | text | - | ischemicHeartDisease = yes | Free text |
| heartFailure | radio | - | - | yes, no |
| heartFailureNYHA | select | - | heartFailure = yes | 1, 2, 3, 4 |
| valvularDisease | radio | - | - | yes, no |
| valvularDetails | text | - | valvularDisease = yes | Free text |
| arrhythmia | radio | - | - | yes, no |
| arrhythmiaType | text | - | arrhythmia = yes | Free text |
| pacemaker | radio | - | - | yes, no |
| recentMI | radio | - | - | yes, no |
| recentMIWeeks | number | - | recentMI = yes | 0-26 weeks |

**Conditional Logic:**
- Detail fields are only shown when the parent condition is answered "yes"
- NYHA class is only shown when heart failure = yes
- MI timing is only shown when recent MI = yes

---

## Step 3: Respiratory

**Section:** `respiratory`
**Purpose:** Assess lung and breathing conditions.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| asthma | radio | - | - | yes, no |
| asthmaFrequency | select | - | asthma = yes | intermittent, mild-persistent, moderate-persistent, severe-persistent |
| copd | radio | - | - | yes, no |
| copdSeverity | select | - | copd = yes | mild, moderate, severe |
| osa | radio | - | - | yes, no |
| osaCPAP | radio | - | osa = yes | yes, no |
| smoking | radio | - | - | current, ex, never |
| smokingPackYears | number | - | smoking = current or ex | 0-200 |
| recentURTI | radio | - | - | yes, no |

---

## Step 4: Renal

**Section:** `renal`
**Purpose:** Assess kidney conditions.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| ckd | radio | - | - | yes, no |
| ckdStage | select | - | ckd = yes | 1, 2, 3, 4, 5 |
| dialysis | radio | - | - | yes, no |
| dialysisType | select | - | dialysis = yes | haemodialysis, peritoneal |

---

## Step 5: Hepatic

**Section:** `hepatic`
**Purpose:** Assess liver conditions.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| liverDisease | radio | - | - | yes, no |
| cirrhosis | radio | - | liverDisease = yes | yes, no |
| childPughScore | select | - | cirrhosis = yes | A, B, C |
| hepatitis | radio | - | - | yes, no |
| hepatitisType | text | - | hepatitis = yes | Free text (e.g., A, B, C) |

**Nesting:** Cirrhosis and Child-Pugh are doubly nested (liver disease -> cirrhosis -> Child-Pugh).

---

## Step 6: Endocrine

**Section:** `endocrine`
**Purpose:** Assess hormonal conditions.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| diabetes | select | - | - | none, type1, type2, gestational |
| diabetesControl | select | - | diabetes != none and != '' | well-controlled, poorly-controlled |
| diabetesOnInsulin | radio | - | diabetes != none and != '' | yes, no |
| thyroidDisease | radio | - | - | yes, no |
| thyroidType | select | - | thyroidDisease = yes | hypothyroid, hyperthyroid |
| adrenalInsufficiency | radio | - | - | yes, no |

---

## Step 7: Neurological

**Section:** `neurological`
**Purpose:** Assess brain and nerve conditions.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| strokeOrTIA | radio | - | - | yes, no |
| strokeDetails | text | - | strokeOrTIA = yes | Free text |
| epilepsy | radio | - | - | yes, no |
| epilepsyControlled | radio | - | epilepsy = yes | yes, no |
| neuromuscularDisease | radio | - | - | yes, no |
| neuromuscularDetails | text | - | neuromuscularDisease = yes | Free text |
| raisedICP | radio | - | - | yes, no |

---

## Step 8: Haematological

**Section:** `haematological`
**Purpose:** Assess blood and clotting conditions.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| bleedingDisorder | radio | - | - | yes, no |
| bleedingDetails | text | - | bleedingDisorder = yes | Free text |
| onAnticoagulants | radio | - | - | yes, no |
| anticoagulantType | text | - | onAnticoagulants = yes | Free text |
| sickleCellDisease | radio | - | - | yes, no |
| sickleCellTrait | radio | - | sickleCellDisease = no | yes, no |
| anaemia | radio | - | - | yes, no |

**Note:** Sickle cell trait question is only shown when sickle cell disease = no (if they have the disease, trait is implied).

---

## Step 9: Musculoskeletal & Airway

**Section:** `musculoskeletalAirway`
**Purpose:** Assess joint conditions and airway predictors.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| rheumatoidArthritis | radio | - | - | yes, no |
| cervicalSpineIssues | radio | - | - | yes, no |
| limitedNeckMovement | radio | - | - | yes, no |
| limitedMouthOpening | radio | - | - | yes, no |
| dentalIssues | radio | - | - | yes, no |
| dentalDetails | text | - | dentalIssues = yes | Free text |
| previousDifficultAirway | radio | - | - | yes, no |
| mallampatiScore | select | - | - | 1, 2, 3, 4 (optional) |

**Note:** Mallampati score is optional as patients may not know it. It is typically assessed by the clinician.

---

## Step 10: Gastrointestinal

**Section:** `gastrointestinal`
**Purpose:** Assess stomach and digestive conditions relevant to aspiration risk.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| gord | radio | - | - | yes, no |
| hiatusHernia | radio | - | - | yes, no |
| nausea | radio | - | - | yes, no |

This is one of the simplest steps with no conditional logic.

---

## Step 11: Medications

**Section:** `medications` (array)
**Purpose:** Document all current medications.

| Field | Type | Per Entry | Notes |
|-------|------|-----------|-------|
| name | text | Yes | Medication name |
| dose | text | Yes | Dose (e.g., "5mg", "10ml") |
| frequency | text | Yes | Frequency (e.g., "once daily", "twice daily") |

**Dynamic List:**
- Patient can add multiple medication entries using the "+ Add Medication" button
- Each entry can be removed with the "x" button
- Zero medications is valid (patient may take none)

---

## Step 12: Allergies

**Section:** `allergies` (array)
**Purpose:** Document all known allergies.

| Field | Type | Per Entry | Options |
|-------|------|-----------|---------|
| allergen | text | Yes | Allergen name (free text) |
| reaction | text | Yes | Reaction description (free text) |
| severity | select | Yes | mild, moderate, anaphylaxis |

**Dynamic List:**
- Same add/remove pattern as medications
- Zero allergies is valid
- Anaphylaxis severity triggers a high-priority safety flag

---

## Step 13: Previous Anaesthesia

**Section:** `previousAnaesthesia`
**Purpose:** Document anaesthetic history and family history.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| previousAnaesthesia | radio | - | - | yes, no |
| anaesthesiaProblems | radio | - | previousAnaesthesia = yes | yes, no |
| anaesthesiaProblemDetails | text | - | anaesthesiaProblems = yes | Free text |
| familyMHHistory | radio | - | - | yes, no |
| familyMHDetails | text | - | familyMHHistory = yes | Free text |
| ponv | radio | - | - | yes, no |

**Nesting:** Problem details are doubly nested (previous anaesthesia -> problems -> details).

---

## Step 14: Social History

**Section:** `socialHistory`
**Purpose:** Document lifestyle factors.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| alcohol | select | - | - | none, occasional, moderate, heavy |
| alcoholUnitsPerWeek | number | - | alcohol != none | 0-200 |
| recreationalDrugs | radio | - | - | yes, no |
| drugDetails | text | - | recreationalDrugs = yes | Free text |

---

## Step 15: Functional Capacity

**Section:** `functionalCapacity`
**Purpose:** Assess exercise tolerance and METs.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| exerciseTolerance | select | - | - | unable, light-housework, climb-stairs, moderate-exercise, vigorous-exercise |
| estimatedMETs | computed | - | - | Auto-calculated from exerciseTolerance |
| mobilityAids | radio | - | - | yes, no |
| recentDecline | radio | - | - | yes, no |

**Auto-calculations:**
- METs are estimated from exerciseTolerance selection
- METs are displayed with a colour-coded indicator (<4 = orange warning, >=4 = green)

---

## Step 16: Pregnancy (Conditional)

**Section:** `pregnancy`
**Purpose:** Assess pregnancy status for females of childbearing age.

| Field | Type | Required | Conditional On | Options |
|-------|------|----------|---------------|---------|
| possiblyPregnant | radio | - | - | yes, no |
| pregnancyConfirmed | radio | - | possiblyPregnant = yes | yes, no |
| gestationWeeks | number | - | pregnancyConfirmed = yes | 1-42 weeks |

**Step Visibility Condition:**
```
demographics.sex === 'female' AND age >= 12 AND age <= 55
```

If the patient is not female or is outside the 12-55 age range, this step is skipped entirely. The wizard navigation automatically jumps from Step 15 to the submit action.

---

## Data Types Reference

### Enumerations

| Type | Values |
|------|--------|
| YesNo | 'yes', 'no', '' |
| Sex | 'male', 'female', 'other', '' |
| Severity | 'mild', 'moderate', 'severe', '' |
| SmokingStatus | 'current', 'ex', 'never', '' |
| DiabetesType | 'type1', 'type2', 'gestational', 'none', '' |
| DiabetesControl | 'well-controlled', 'poorly-controlled', '' |
| AlcoholFrequency | 'none', 'occasional', 'moderate', 'heavy', '' |
| AllergySeverity | 'mild', 'moderate', 'anaphylaxis', '' |
| AsthmaFrequency | 'intermittent', 'mild-persistent', 'moderate-persistent', 'severe-persistent', '' |
| ExerciseTolerance | 'unable', 'light-housework', 'climb-stairs', 'moderate-exercise', 'vigorous-exercise', '' |
| ProcedureUrgency | 'elective', 'urgent', 'emergency', '' |
| NYHAClass | '1', '2', '3', '4', '' |
| CKDStage | '1', '2', '3', '4', '5', '' |
| ChildPughScore | 'A', 'B', 'C', '' |
| MallampatiScore | '1', '2', '3', '4', '' |
| DialysisType | 'haemodialysis', 'peritoneal', '' |
| ThyroidType | 'hypothyroid', 'hyperthyroid', '' |

### Default Values

All fields initialise to:
- Empty string `''` for text, radio, and select fields
- `null` for number fields
- Empty array `[]` for medications and allergies

This ensures the grading engine never encounters `undefined` values.

---

## Conditional Logic Summary

| Step | Field | Shows When |
|------|-------|-----------|
| 2 | hypertensionControlled | hypertension = yes |
| 2 | ihdDetails | ischemicHeartDisease = yes |
| 2 | heartFailureNYHA | heartFailure = yes |
| 2 | valvularDetails | valvularDisease = yes |
| 2 | arrhythmiaType | arrhythmia = yes |
| 2 | recentMIWeeks | recentMI = yes |
| 3 | asthmaFrequency | asthma = yes |
| 3 | copdSeverity | copd = yes |
| 3 | osaCPAP | osa = yes |
| 3 | smokingPackYears | smoking = current or ex |
| 4 | ckdStage | ckd = yes |
| 4 | dialysisType | dialysis = yes |
| 5 | cirrhosis | liverDisease = yes |
| 5 | childPughScore | cirrhosis = yes |
| 5 | hepatitisType | hepatitis = yes |
| 6 | diabetesControl, diabetesOnInsulin | diabetes != none |
| 6 | thyroidType | thyroidDisease = yes |
| 7 | strokeDetails | strokeOrTIA = yes |
| 7 | epilepsyControlled | epilepsy = yes |
| 7 | neuromuscularDetails | neuromuscularDisease = yes |
| 8 | bleedingDetails | bleedingDisorder = yes |
| 8 | anticoagulantType | onAnticoagulants = yes |
| 8 | sickleCellTrait | sickleCellDisease = no |
| 9 | dentalDetails | dentalIssues = yes |
| 13 | anaesthesiaProblems | previousAnaesthesia = yes |
| 13 | anaesthesiaProblemDetails | anaesthesiaProblems = yes |
| 13 | familyMHDetails | familyMHHistory = yes |
| 14 | alcoholUnitsPerWeek | alcohol != none |
| 14 | drugDetails | recreationalDrugs = yes |
| 16 | pregnancyConfirmed | possiblyPregnant = yes |
| 16 | gestationWeeks | pregnancyConfirmed = yes |
| Step 16 entire | - | sex = female AND age 12-55 |
