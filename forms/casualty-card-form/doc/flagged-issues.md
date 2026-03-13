# Flagged Issues

## Overview

The flagged issues engine monitors casualty card data in real time and raises safety-critical alerts for clinical review. Each flag is categorised by clinical domain and assigned a priority level to guide the urgency of the clinical response.

Flags are evaluated whenever relevant form data changes. Multiple flags may be active simultaneously.

## Flag Catalogue

### 1. NEWS2 Critical (>= 7)

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `news2-critical`                                                   |
| **Category**       | Physiological deterioration                                        |
| **Priority**       | Critical                                                           |
| **Trigger**        | NEWS2 aggregate score >= 7                                         |
| **Clinical significance** | Indicates severe physiological derangement requiring emergency assessment by a clinical team with critical care competencies, including airway management. Continuous monitoring and consideration of Level 2/3 care transfer. |

### 2. NEWS2 Medium (>= 5)

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `news2-medium`                                                     |
| **Category**       | Physiological deterioration                                        |
| **Priority**       | Warning                                                            |
| **Trigger**        | NEWS2 aggregate score >= 5 and < 7                                 |
| **Clinical significance** | Indicates moderate physiological derangement requiring urgent review by a clinician with core competencies in the care of acutely ill patients. Minimum 1-hourly observations. |

### 3. NEWS2 Single Parameter Score 3

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `news2-single-param-3`                                             |
| **Category**       | Physiological deterioration                                        |
| **Priority**       | Warning                                                            |
| **Trigger**        | Any individual NEWS2 parameter scores 3                            |
| **Clinical significance** | A single extreme physiological value warrants urgent ward-based review regardless of the aggregate score. Even when the total NEWS2 is low, an isolated extreme value may indicate a clinically significant abnormality. |

### 4. Safeguarding Concern

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `safeguarding-concern`                                             |
| **Category**       | Safeguarding                                                       |
| **Priority**       | Critical                                                           |
| **Trigger**        | `safeguardingConcern` is set to `yes`                              |
| **Clinical significance** | Indicates a potential safeguarding issue (e.g. suspected abuse, neglect, exploitation, or self-harm). Triggers mandatory referral procedures under local safeguarding protocols. Documentation must include the nature of the concern and any referrals made. |

### 5. Anaphylaxis History

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `anaphylaxis-history`                                              |
| **Category**       | Allergy                                                            |
| **Priority**       | Warning                                                            |
| **Trigger**        | Any entry in the `allergies[]` array has a severity of `anaphylaxis` |
| **Clinical significance** | Patient has a documented history of anaphylactic reaction. All prescribing and medication administration must cross-reference the allergy list. Adrenaline auto-injector availability should be confirmed. High-risk medications require senior review before administration. |

### 6. Anticoagulant Use

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `anticoagulant-use`                                                |
| **Category**       | Medication                                                         |
| **Priority**       | Warning                                                            |
| **Trigger**        | Any entry in the `medications[]` array matches a known anticoagulant: warfarin, rivaroxaban, apixaban, edoxaban, dabigatran, heparin, or enoxaparin (case-insensitive match) |
| **Clinical significance** | Anticoagulant therapy significantly increases bleeding risk. Relevant for trauma assessment, procedural planning, and interpretation of imaging findings. Coagulation studies (INR, APTT) should be requested. Reversal agents may need to be available. |

### 7. GCS <= 8 (Unconscious Patient)

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `gcs-unconscious`                                                  |
| **Category**       | Neurological                                                       |
| **Priority**       | Critical                                                           |
| **Trigger**        | GCS total score (gcsEye + gcsVerbal + gcsMotor) <= 8               |
| **Clinical significance** | A GCS of 8 or below indicates the patient is unable to protect their own airway. Immediate airway management is required. The patient should be assessed for intubation. Neurosurgical or critical care referral is indicated. |

### 8. Non-Reactive Pupils

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `non-reactive-pupils`                                              |
| **Category**       | Neurological                                                       |
| **Priority**       | Critical                                                           |
| **Trigger**        | `pupilLeftReactive` is `false` or `pupilRightReactive` is `false`  |
| **Clinical significance** | Non-reactive (fixed) pupils may indicate raised intracranial pressure, brainstem compromise, or the effects of certain drugs. Requires urgent neurological assessment and likely urgent imaging (CT head). Bilateral fixed dilated pupils in the context of head injury or reduced consciousness is a neurosurgical emergency. |

### 9. Active Haemorrhage

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `active-haemorrhage`                                               |
| **Category**       | Circulation                                                        |
| **Priority**       | Critical                                                           |
| **Trigger**        | `circulation.haemorrhage` indicates active bleeding               |
| **Clinical significance** | Active haemorrhage requires immediate haemostatic intervention. Assess for source, estimate volume loss, and initiate fluid resuscitation. Activate major haemorrhage protocol if blood loss is significant. Cross-match and request blood products as appropriate. |

### 10. Compromised or Obstructed Airway

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `airway-compromised`                                               |
| **Category**       | Airway                                                             |
| **Priority**       | Critical                                                           |
| **Trigger**        | `airway.status` is `compromised` or `obstructed`                   |
| **Clinical significance** | A compromised or obstructed airway is an immediately life-threatening emergency. Airway manoeuvres, adjuncts, or definitive airway management (intubation, surgical airway) must be performed without delay. Activate the emergency team. |

### 11. Pregnancy Test Positive

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `pregnancy-positive`                                               |
| **Category**       | Reproductive                                                       |
| **Priority**       | Warning                                                            |
| **Trigger**        | `urinalysis.pregnancyTest` is `positive`                           |
| **Clinical significance** | A positive pregnancy test alters the clinical pathway. Ionising radiation (X-ray, CT) should be avoided or justified with appropriate shielding. Medication choices must be reviewed for teratogenic risk. Ectopic pregnancy must be excluded in patients presenting with abdominal or pelvic pain. Early obstetric or gynaecology input may be required. |

### 12. Mental Health Act Status

| Field              | Value                                                              |
|--------------------|--------------------------------------------------------------------|
| **ID**             | `mental-health-act`                                                |
| **Category**       | Mental Health                                                      |
| **Priority**       | Warning                                                            |
| **Trigger**        | `mentalHealthActStatus` is set to any active section               |
| **Clinical significance** | The patient is subject to the Mental Health Act 1983 (or 2007 amendments). Treatment decisions must comply with the relevant section provisions. The Approved Mental Health Professional (AMHP) and responsible clinician must be identified. The patient's rights under the Act must be communicated. Detention paperwork must be verified and documented. |

## Priority Levels

| Priority  | Colour  | Response                                                                 |
|-----------|---------|--------------------------------------------------------------------------|
| Critical  | Red     | Immediate clinical action required. Escalate to senior clinician or emergency team without delay. |
| Warning   | Amber   | Prompt clinical review required. Ensure the responsible clinician is aware and has acknowledged the flag. |

## Multiple Active Flags

When multiple flags are active simultaneously, the highest priority flag determines the overall alert level displayed to the user. All active flags are listed individually so that no clinically significant finding is obscured.
