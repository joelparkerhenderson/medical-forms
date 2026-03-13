# Questionnaire Specification

## Overview

The Casualty Card Form consists of 14 sequential steps. This document specifies every field in each step, including the field name, data type, validation rules, and default value.

### Conventions

- **Field name**: camelCase TypeScript property name.
- **Type**: TypeScript type used in the data model.
- **Validation**: Constraints applied before submission.
- **Default**: Value assigned on form initialisation.
- Empty string `''` is the default for unanswered text fields.
- `null` is the default for unanswered numeric fields.
- `false` is the default for unanswered boolean fields.
- `[]` is the default for array fields.

---

## Step 1: Patient Demographics (12 fields)

| Field             | Type     | Validation                         | Default |
|-------------------|----------|------------------------------------|---------|
| firstName         | string   | Required, max 100 chars            | `''`    |
| lastName          | string   | Required, max 100 chars            | `''`    |
| dateOfBirth       | string   | Required, ISO date format (YYYY-MM-DD) | `''`    |
| sex               | string   | Required, one of: male, female, other, unknown | `''`    |
| nhsNumber         | string   | Optional, 10 digits (with spaces: 3-3-4 format) | `''`    |
| address           | string   | Optional, max 500 chars            | `''`    |
| postcode          | string   | Optional, valid UK postcode format  | `''`    |
| phone             | string   | Optional, valid UK phone number     | `''`    |
| email             | string   | Optional, valid email format        | `''`    |
| ethnicity         | string   | Optional, NHS ethnicity category    | `''`    |
| preferredLanguage | string   | Optional, max 100 chars             | `''`    |
| interpreterRequired | boolean | Optional                           | `false` |

---

## Step 2: Next of Kin & GP (8 fields)

### Next of Kin (4 fields)

| Field                  | Type    | Validation              | Default |
|------------------------|---------|-------------------------|---------|
| nextOfKin.name         | string  | Optional, max 200 chars | `''`    |
| nextOfKin.relationship | string  | Optional, max 100 chars | `''`    |
| nextOfKin.phone        | string  | Optional, valid phone   | `''`    |
| nextOfKin.notified     | boolean | Optional                | `false` |

### GP Details (4 fields)

| Field               | Type   | Validation              | Default |
|---------------------|--------|-------------------------|---------|
| gp.name             | string | Optional, max 200 chars | `''`    |
| gp.practiceName     | string | Optional, max 200 chars | `''`    |
| gp.practiceAddress  | string | Optional, max 500 chars | `''`    |
| gp.practicePhone    | string | Optional, valid phone   | `''`    |

---

## Step 3: Arrival & Triage (11 fields)

| Field                    | Type   | Validation                                                                 | Default |
|--------------------------|--------|----------------------------------------------------------------------------|---------|
| attendanceDate           | string | Required, ISO date format (YYYY-MM-DD)                                    | `''`    |
| arrivalTime              | string | Required, HH:MM 24-hour format                                            | `''`    |
| attendanceCategory       | string | Required, one of: first, follow-up, planned, unplanned                    | `''`    |
| arrivalMode              | string | Required, one of: ambulance, walk-in, helicopter, police, other           | `''`    |
| referralSource           | string | Required, one of: self, gp, 999, nhs111, other-hospital, police, other   | `''`    |
| ambulanceIncidentNumber  | string | Optional, alphanumeric                                                     | `''`    |
| triageTime               | string | Optional, HH:MM 24-hour format                                            | `''`    |
| triageNurse              | string | Optional, max 200 chars                                                    | `''`    |
| mtsFlowchart             | string | Optional, selected from MTS flowchart list                                 | `''`    |
| mtsCategory              | string | Optional, one of: 1-immediate, 2-very-urgent, 3-urgent, 4-standard, 5-non-urgent | `''` |
| mtsDiscriminator         | string | Optional, free text describing the MTS discriminator                       | `''`    |

---

## Step 4: Presenting Complaint (13 fields)

| Field                      | Type   | Validation              | Default |
|----------------------------|--------|-------------------------|---------|
| chiefComplaint             | string | Required, max 500 chars | `''`    |
| historyOfPresentingComplaint | string | Required, max 5000 chars | `''`   |
| onset                      | string | Optional, max 200 chars | `''`    |
| duration                   | string | Optional, max 200 chars | `''`    |
| character                  | string | Optional, max 200 chars | `''`    |
| severity                   | string | Optional, max 200 chars | `''`    |
| location                   | string | Optional, max 200 chars | `''`    |
| radiation                  | string | Optional, max 200 chars | `''`    |
| aggravatingFactors         | string | Optional, max 500 chars | `''`    |
| relievingFactors           | string | Optional, max 500 chars | `''`    |
| associatedSymptoms         | string | Optional, max 500 chars | `''`    |
| previousEpisodes           | string | Optional, max 500 chars | `''`    |
| treatmentPriorToArrival    | string | Optional, max 500 chars | `''`    |

---

## Step 5: Pain Assessment (6 fields)

| Field                | Type           | Validation                                               | Default |
|----------------------|----------------|----------------------------------------------------------|---------|
| painPresent          | string         | Required, one of: yes, no                                | `''`    |
| painScore            | number \| null | Conditional (required if painPresent=yes), integer 0--10 | `null`  |
| painLocation         | string         | Conditional (required if painPresent=yes), max 200 chars | `''`    |
| painCharacter        | string         | Optional, max 200 chars                                  | `''`    |
| painOnset            | string         | Optional, max 200 chars                                  | `''`    |
| painSeverityCategory | string         | Optional, one of: mild, moderate, severe                 | `''`    |

---

## Step 6: Medical History

### Text Fields (5 fields)

| Field                 | Type   | Validation              | Default |
|-----------------------|--------|-------------------------|---------|
| pastMedicalHistory    | string | Optional, max 5000 chars | `''`   |
| pastSurgicalHistory   | string | Optional, max 5000 chars | `''`   |
| tetanusStatus         | string | Optional, max 200 chars  | `''`   |
| smokingStatus         | string | Optional, one of: current, ex-smoker, never | `''` |
| alcoholConsumption    | string | Optional, max 200 chars  | `''`   |
| recreationalDrugUse   | string | Optional, max 200 chars  | `''`   |
| lastOralIntake        | string | Optional, max 200 chars  | `''`   |

### Medications Array

Each entry in `medications[]`:

| Field     | Type   | Validation              | Default |
|-----------|--------|-------------------------|---------|
| name      | string | Required, max 200 chars | `''`    |
| dose      | string | Required, max 100 chars | `''`    |
| frequency | string | Required, max 100 chars | `''`    |

Default: `[]` (empty array). User can add/remove entries dynamically.

### Allergies Array

Each entry in `allergies[]`:

| Field    | Type   | Validation                                         | Default |
|----------|--------|----------------------------------------------------|---------|
| allergen | string | Required, max 200 chars                            | `''`    |
| reaction | string | Required, max 200 chars                            | `''`    |
| severity | string | Required, one of: mild, moderate, severe, anaphylaxis | `''` |

Default: `[]` (empty array). User can add/remove entries dynamically.

---

## Step 7: Vital Signs (16 fields + NEWS2 auto-calculation)

| Field               | Type            | Validation                                                      | Default |
|---------------------|-----------------|-----------------------------------------------------------------|---------|
| heartRate           | number \| null  | Optional, integer 20--250                                       | `null`  |
| systolicBP          | number \| null  | Optional, integer 50--300                                       | `null`  |
| diastolicBP         | number \| null  | Optional, integer 20--200                                       | `null`  |
| respiratoryRate     | number \| null  | Optional, integer 1--60                                         | `null`  |
| oxygenSaturation    | number \| null  | Optional, integer 50--100                                       | `null`  |
| supplementalOxygen  | string          | Optional, one of: yes, no                                       | `''`    |
| oxygenFlowRate      | number \| null  | Conditional (if supplementalOxygen=yes), number 0.5--15.0       | `null`  |
| temperature         | number \| null  | Optional, number 30.0--45.0, one decimal place                  | `null`  |
| bloodGlucose        | number \| null  | Optional, number 1.0--40.0                                      | `null`  |
| consciousnessLevel  | string          | Optional, one of: alert, confusion, voice, pain, unresponsive   | `''`    |
| pupilLeftSize       | number \| null  | Optional, integer 1--9 (mm)                                     | `null`  |
| pupilLeftReactive   | boolean \| null | Optional                                                        | `null`  |
| pupilRightSize      | number \| null  | Optional, integer 1--9 (mm)                                     | `null`  |
| pupilRightReactive  | boolean \| null | Optional                                                        | `null`  |
| capillaryRefillTime | number \| null  | Optional, number 0--10 (seconds)                                | `null`  |
| weight              | number \| null  | Optional, number 0.5--300.0 (kg)                                | `null`  |

### NEWS2 Auto-Calculation (derived, not stored as input)

| Derived Field          | Type            | Description                              |
|------------------------|-----------------|------------------------------------------|
| news2TotalScore        | number \| null  | Sum of 7 parameter sub-scores (0--20)    |
| news2ClinicalResponse  | string \| null  | low, low-medium, medium, or high         |
| news2HasSingleParam3   | boolean         | True if any sub-score equals 3           |

NEWS2 is automatically computed from: heartRate, systolicBP, respiratoryRate, oxygenSaturation, supplementalOxygen, temperature, consciousnessLevel.

---

## Step 8: Primary Survey -- ABCDE

### Airway (3 fields)

| Field                    | Type   | Validation                                         | Default |
|--------------------------|--------|----------------------------------------------------|---------|
| airway.status            | string | Required, one of: patent, compromised, obstructed  | `''`    |
| airway.adjuncts          | string | Optional, max 500 chars                            | `''`    |
| airway.cSpineImmobilised | boolean| Optional                                           | `false` |

### Breathing (4 fields)

| Field                  | Type   | Validation                                                    | Default |
|------------------------|--------|---------------------------------------------------------------|---------|
| breathing.effort       | string | Required, one of: normal, laboured, shallow, absent           | `''`    |
| breathing.chestMovement| string | Optional, max 200 chars                                       | `''`    |
| breathing.breathSounds | string | Optional, max 500 chars                                       | `''`    |
| breathing.tracheaPosition | string | Optional, one of: central, deviated-left, deviated-right   | `''`    |

### Circulation (6 fields)

| Field                       | Type   | Validation              | Default |
|-----------------------------|--------|-------------------------|---------|
| circulation.pulseCharacter  | string | Optional, max 200 chars | `''`    |
| circulation.skinColour      | string | Optional, max 200 chars | `''`    |
| circulation.skinTemperature | string | Optional, max 200 chars | `''`    |
| circulation.capillaryRefill | string | Optional, max 200 chars | `''`    |
| circulation.haemorrhage     | string | Optional, max 500 chars | `''`    |
| circulation.ivAccess        | string | Optional, max 500 chars | `''`    |

### Disability (7 fields)

| Field                    | Type           | Validation                          | Default |
|--------------------------|----------------|-------------------------------------|---------|
| disability.gcsEye        | number \| null | Optional, integer 1--4              | `null`  |
| disability.gcsVerbal     | number \| null | Optional, integer 1--5              | `null`  |
| disability.gcsMotor      | number \| null | Optional, integer 1--6              | `null`  |
| disability.gcsTotal      | number \| null | Auto-calculated (Eye+Verbal+Motor)  | `null`  |
| disability.pupils        | string         | Optional, max 500 chars             | `''`    |
| disability.bloodGlucose  | number \| null | Optional, number 1.0--40.0          | `null`  |
| disability.limbMovements | string         | Optional, max 500 chars             | `''`    |

### Exposure (3 fields)

| Field                      | Type   | Validation              | Default |
|----------------------------|--------|-------------------------|---------|
| exposure.skinExamination   | string | Optional, max 1000 chars | `''`   |
| exposure.injuriesIdentified| string | Optional, max 1000 chars | `''`   |
| exposure.logRollFindings   | string | Optional, max 1000 chars | `''`   |

---

## Step 9: Clinical Examination (12 fields)

| Field                 | Type   | Validation               | Default |
|-----------------------|--------|--------------------------|---------|
| generalAppearance     | string | Optional, max 1000 chars | `''`    |
| headAndFace           | string | Optional, max 1000 chars | `''`    |
| neck                  | string | Optional, max 1000 chars | `''`    |
| chestCardiovascular   | string | Optional, max 1000 chars | `''`    |
| chestRespiratory      | string | Optional, max 1000 chars | `''`    |
| abdomen               | string | Optional, max 1000 chars | `''`    |
| pelvis                | string | Optional, max 1000 chars | `''`    |
| musculoskeletalLimbs  | string | Optional, max 1000 chars | `''`    |
| neurological          | string | Optional, max 1000 chars | `''`    |
| skin                  | string | Optional, max 1000 chars | `''`    |
| mentalState           | string | Optional, max 1000 chars | `''`    |
| bodyDiagramNotes      | string | Optional, max 2000 chars | `''`    |

---

## Step 10: Investigations

### Blood Tests

| Field       | Type     | Validation                                                                        | Default |
|-------------|----------|-----------------------------------------------------------------------------------|---------|
| bloodTests  | string[] | Optional, selected from: FBC, U&E, LFTs, CRP, coagulation, troponin, D-dimer, blood gas, lactate, amylase, lipase, glucose, group-and-save, cross-match, toxicology | `[]`    |

### Urinalysis

| Field                    | Type   | Validation              | Default |
|--------------------------|--------|-------------------------|---------|
| urinalysis.dipstick      | string | Optional, max 500 chars | `''`    |
| urinalysis.pregnancyTest | string | Optional, one of: positive, negative, not-performed | `''` |

### Imaging Array

Each entry in `imaging[]`:

| Field    | Type   | Validation              | Default |
|----------|--------|-------------------------|---------|
| type     | string | Required, one of: x-ray, ct, mri, ultrasound, other | `''` |
| site     | string | Required, max 200 chars | `''`    |
| findings | string | Optional, max 1000 chars | `''`   |

Default: `[]` (empty array). User can add/remove entries dynamically.

### ECG

| Field         | Type    | Validation              | Default |
|---------------|---------|-------------------------|---------|
| ecg.performed | boolean | Optional                | `false` |
| ecg.findings  | string  | Optional, max 1000 chars | `''`   |

### Other

| Field               | Type   | Validation               | Default |
|---------------------|--------|--------------------------|---------|
| otherInvestigations | string | Optional, max 2000 chars | `''`    |

---

## Step 11: Treatment & Interventions

### Medications Administered Array

Each entry in `medicationsAdministered[]`:

| Field   | Type   | Validation                  | Default |
|---------|--------|-----------------------------|---------|
| drug    | string | Required, max 200 chars     | `''`    |
| dose    | string | Required, max 100 chars     | `''`    |
| route   | string | Required, one of: oral, iv, im, sc, inhaled, topical, rectal, sublingual, other | `''` |
| time    | string | Required, HH:MM 24-hour     | `''`    |
| givenBy | string | Required, max 200 chars     | `''`    |

Default: `[]` (empty array).

### Fluid Therapy Array

Each entry in `fluidTherapy[]`:

| Field       | Type   | Validation              | Default |
|-------------|--------|-------------------------|---------|
| type        | string | Required, max 200 chars | `''`    |
| volume      | string | Required, max 100 chars | `''`    |
| rate        | string | Required, max 100 chars | `''`    |
| timeStarted | string | Required, HH:MM 24-hour | `''`    |

Default: `[]` (empty array).

### Procedures Array

Each entry in `procedures[]`:

| Field       | Type   | Validation              | Default |
|-------------|--------|-------------------------|---------|
| description | string | Required, max 500 chars | `''`    |
| time        | string | Required, HH:MM 24-hour | `''`    |

Default: `[]` (empty array).

### Oxygen Therapy

| Field                  | Type           | Validation              | Default |
|------------------------|----------------|-------------------------|---------|
| oxygenTherapy.device   | string         | Optional, max 200 chars | `''`    |
| oxygenTherapy.flowRate | number \| null | Optional, number 0.5--15.0 | `null` |

### Tetanus Prophylaxis

| Field              | Type   | Validation                                               | Default |
|--------------------|--------|----------------------------------------------------------|---------|
| tetanusProphylaxis | string | Optional, one of: given, not-indicated, status-checked   | `''`    |

---

## Step 12: Assessment & Plan (4 fields)

| Field                  | Type   | Validation               | Default |
|------------------------|--------|--------------------------|---------|
| workingDiagnosis       | string | Required, max 500 chars  | `''`    |
| differentialDiagnoses  | string | Optional, max 1000 chars | `''`    |
| clinicalImpression     | string | Optional, max 2000 chars | `''`    |
| riskStratification     | string | Optional, max 1000 chars | `''`    |

---

## Step 13: Disposition (14 fields, conditional on disposition type)

### Core Fields

| Field                     | Type           | Validation                                                                        | Default |
|---------------------------|----------------|-----------------------------------------------------------------------------------|---------|
| disposition               | string         | Required, one of: admitted, discharged, transferred, left-before-seen, self-discharged | `''` |
| dischargeTime             | string         | Optional, HH:MM 24-hour format                                                    | `''`    |
| totalTimeInDepartment     | number \| null | Auto-calculated from arrivalTime and dischargeTime (minutes)                       | `null`  |

### Conditional: Admitted (4 fields, shown when disposition = admitted)

| Field                | Type   | Validation              | Default |
|----------------------|--------|-------------------------|---------|
| admittingSpecialty   | string | Required, max 200 chars | `''`    |
| admittingConsultant  | string | Optional, max 200 chars | `''`    |
| ward                 | string | Required, max 200 chars | `''`    |
| levelOfCare          | string | Optional, one of: level-0, level-1, level-2, level-3 | `''` |

### Conditional: Discharged (5 fields, shown when disposition = discharged)

| Field                  | Type   | Validation               | Default |
|------------------------|--------|--------------------------|---------|
| dischargeDiagnosis     | string | Required, max 500 chars  | `''`    |
| dischargeMedications   | string | Optional, max 1000 chars | `''`    |
| dischargeInstructions  | string | Optional, max 2000 chars | `''`    |
| followUp               | string | Optional, max 500 chars  | `''`    |
| returnPrecautions      | string | Optional, max 1000 chars | `''`    |

### Conditional: Transferred (3 fields, shown when disposition = transferred)

| Field              | Type   | Validation              | Default |
|--------------------|--------|-------------------------|---------|
| receivingHospital  | string | Required, max 200 chars | `''`    |
| reasonForTransfer  | string | Required, max 500 chars | `''`    |
| modeOfTransfer     | string | Optional, max 200 chars | `''`    |

---

## Step 14: Safeguarding & Consent (10 fields)

| Field                       | Type   | Validation                                                   | Default |
|-----------------------------|--------|--------------------------------------------------------------|---------|
| safeguardingConcern         | string | Required, one of: yes, no                                    | `''`    |
| safeguardingType            | string | Conditional (required if safeguardingConcern=yes), max 500 chars | `''` |
| referralMade                | string | Conditional (required if safeguardingConcern=yes), max 500 chars | `''` |
| mentalCapacityAssessment    | string | Optional, max 1000 chars                                     | `''`    |
| mentalHealthActStatus       | string | Optional, max 200 chars                                      | `''`    |
| consentForTreatment         | string | Required, one of: verbal, written, lacks-capacity            | `''`    |
| completedBy.name            | string | Required, max 200 chars                                      | `''`    |
| completedBy.role            | string | Required, max 200 chars                                      | `''`    |
| completedBy.gmcNumber       | string | Optional, max 20 chars                                       | `''`    |
| seniorReviewingClinician    | string | Optional, max 200 chars                                      | `''`    |
