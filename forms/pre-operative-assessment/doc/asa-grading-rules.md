# ASA Grading Rules Reference

This document provides a complete reference for all ASA (American Society of Anesthesiologists) physical status classification rules implemented in the Pre-Operative Assessment system.

## ASA Classification Overview

The ASA Physical Status Classification System is the standard framework used worldwide to assess a patient's pre-anaesthesia medical fitness. Originally adopted in 1941 and refined over subsequent decades, it provides a simple, reproducible grading system that correlates with perioperative morbidity and mortality.

| Grade | Definition | Description |
|-------|-----------|-------------|
| ASA I | Normal healthy patient | No organic, physiological, or psychiatric disturbance. Excludes the very young and very old. Healthy with good exercise tolerance. |
| ASA II | Mild systemic disease | Patient has mild systemic disease with no functional limitations. Well-controlled conditions that pose minimal anaesthetic risk. |
| ASA III | Severe systemic disease | Patient has severe systemic disease with definite functional limitation. The disease is not incapacitating but poses meaningful perioperative risk. |
| ASA IV | Severe systemic disease that is a constant threat to life | Patient has severe systemic disease that is a constant threat to life. Poorly controlled or end-stage conditions with significant risk of perioperative deterioration. |
| ASA V | Moribund patient | Patient is not expected to survive without the operation. Included in the classification for completeness; not currently assigned by the automated rule engine. |

## How the Engine Works

The grading engine uses a **declarative, rule-based architecture**:

1. Each rule is an independent object with a unique ID, body system label, description, ASA grade, and an `evaluate()` function.
2. On submission, every rule is evaluated against the complete patient dataset.
3. Rules that return `true` are recorded as "fired rules".
4. The final ASA grade is the **maximum grade** among all fired rules.
5. If no rules fire, the patient is classified as **ASA I** (healthy).

This maximum-grade approach reflects the clinical reality that the patient's most severe comorbidity sets the floor for their ASA classification.

### Auditability

Every fired rule is recorded in the assessment result with its unique ID, allowing clinicians to see exactly which conditions contributed to the grade. This supports clinical governance and enables meaningful review of automated classifications.

---

## Complete Rule Catalogue

### Cardiovascular (CV)

The cardiovascular rules cover the most common cardiac conditions encountered in pre-operative assessment. Cardiovascular disease is the leading cause of perioperative morbidity.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| CV-001 | Controlled hypertension | II | Hypertension = yes AND controlled = yes |
| CV-002 | Uncontrolled hypertension | III | Hypertension = yes AND controlled = no |
| CV-003 | Stable ischaemic heart disease | II | IHD = yes AND no recent MI |
| CV-004 | Recent myocardial infarction (<3 months) | IV | Recent MI = yes AND weeks < 12 |
| CV-005 | Heart failure NYHA I-II | II | Heart failure = yes AND NYHA class 1 or 2 |
| CV-006 | Heart failure NYHA III | III | Heart failure = yes AND NYHA class 3 |
| CV-007 | Heart failure NYHA IV | IV | Heart failure = yes AND NYHA class 4 |
| CV-008 | Valvular heart disease | III | Valvular disease = yes |
| CV-009 | Arrhythmia | II | Arrhythmia = yes |
| CV-010 | Pacemaker/ICD in situ | II | Pacemaker = yes |

**Clinical Notes:**
- **CV-004** represents one of the highest-risk conditions. Current guidelines recommend postponing elective surgery for at least 60 days after MI, with optimal delay being 6 months. The 12-week (3-month) threshold in this rule is a pragmatic compromise.
- **CV-005 through CV-007** use the New York Heart Association (NYHA) functional classification, which is the standard grading system for heart failure severity.
- **CV-008** assigns grade III to all valvular disease. In practice, severity varies widely (mild aortic stenosis vs. critical mitral stenosis), and the anaesthetist should evaluate echocardiography results.

### Respiratory (RS)

Respiratory conditions significantly affect airway management, ventilation strategy, and post-operative recovery.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| RS-001 | Mild/intermittent asthma | II | Asthma = yes AND frequency is intermittent or mild-persistent |
| RS-002 | Moderate-severe persistent asthma | III | Asthma = yes AND frequency is moderate-persistent or severe-persistent |
| RS-003 | Mild COPD | II | COPD = yes AND severity = mild |
| RS-004 | Moderate COPD | III | COPD = yes AND severity = moderate |
| RS-005 | Severe COPD | III | COPD = yes AND severity = severe |
| RS-006 | Obstructive sleep apnoea | II | OSA = yes |
| RS-007 | Current smoker | II | Smoking status = current |

**Clinical Notes:**
- **RS-001/RS-002** follow the GINA (Global Initiative for Asthma) classification of asthma severity.
- **RS-004/RS-005** both assign grade III for moderate and severe COPD, reflecting that both carry significant perioperative risk. GOLD stage III-IV COPD patients have substantially increased rates of post-operative pulmonary complications.
- **RS-006** triggers grade II for any OSA diagnosis. Additional flags for post-operative monitoring are generated separately.
- **RS-007** Current smoking is associated with a 1.5-4x increased risk of pulmonary complications. Ideally, patients should stop smoking 6-8 weeks before elective surgery.

### Renal (RN)

Chronic kidney disease affects drug metabolism, fluid balance, and electrolyte management during anaesthesia.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| RN-001 | CKD Stage 1-3 | II | CKD = yes AND stage is 1, 2, or 3 |
| RN-002 | CKD Stage 4-5 | III | CKD = yes AND stage is 4 or 5 |
| RN-003 | On dialysis | III | Dialysis = yes |

**Clinical Notes:**
- CKD staging follows the KDIGO (Kidney Disease: Improving Global Outcomes) classification based on GFR.
- Dialysis patients require careful timing of surgery relative to dialysis sessions and close attention to electrolytes, particularly potassium.

### Hepatic (HP)

Liver disease affects drug metabolism, coagulation, and haemodynamic stability.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| HP-001 | Liver disease (non-cirrhotic) | II | Liver disease = yes AND cirrhosis = no |
| HP-002 | Cirrhosis Child-Pugh A | III | Cirrhosis = yes AND Child-Pugh = A |
| HP-003 | Cirrhosis Child-Pugh B/C | IV | Cirrhosis = yes AND Child-Pugh = B or C |

**Clinical Notes:**
- The **Child-Pugh score** is the standard classification for severity of liver cirrhosis, incorporating bilirubin, albumin, INR, ascites, and encephalopathy.
- **HP-003** assigns grade IV because decompensated cirrhosis (Child-Pugh B/C) carries perioperative mortality rates of 18-55%, making it one of the highest-risk conditions for surgery.

### Endocrine (EN)

Endocrine conditions require careful perioperative management of hormones and glucose.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| EN-001 | Well-controlled diabetes | II | Diabetes present (any type) AND well-controlled |
| EN-002 | Poorly controlled diabetes | III | Diabetes present (any type) AND poorly controlled |
| EN-003 | Thyroid disease | II | Thyroid disease = yes |
| EN-004 | Adrenal insufficiency | III | Adrenal insufficiency = yes |

**Clinical Notes:**
- **EN-001/EN-002** apply to all diabetes types (Type 1, Type 2, gestational). The distinction between well-controlled and poorly controlled is clinically critical; HbA1c > 69 mmol/mol (8.5%) is generally considered poorly controlled.
- **EN-004** Adrenal insufficiency patients may require perioperative stress-dose steroids to prevent adrenal crisis. This generates both an ASA rule and a separate safety flag.

### Neurological (NR)

Neurological conditions affect consciousness, airway reflexes, and muscle function.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| NR-001 | Previous stroke/TIA | III | Stroke or TIA = yes |
| NR-002 | Controlled epilepsy | II | Epilepsy = yes AND controlled = yes |
| NR-003 | Uncontrolled epilepsy | III | Epilepsy = yes AND controlled = no |
| NR-004 | Neuromuscular disease | III | Neuromuscular disease = yes |
| NR-005 | Raised intracranial pressure | IV | Raised ICP = yes |

**Clinical Notes:**
- **NR-001** Stroke or TIA within the preceding 3 months is particularly high risk. The system does not currently differentiate by timing, so the anaesthetist should review the history.
- **NR-004** covers a broad category including multiple sclerosis, motor neurone disease, myasthenia gravis, and muscular dystrophies. Many of these have specific anaesthetic implications for muscle relaxant use.
- **NR-005** Raised ICP is a life-threatening condition requiring urgent neurosurgical assessment and specific anaesthetic management.

### Haematological (HM)

Blood disorders and anticoagulation status are critical for surgical planning.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| HM-001 | Bleeding disorder | III | Bleeding disorder = yes |
| HM-002 | On anticoagulants | II | Anticoagulants = yes |
| HM-003 | Sickle cell disease | III | Sickle cell disease = yes |
| HM-004 | Anaemia | II | Anaemia = yes |

**Clinical Notes:**
- **HM-001** includes conditions such as haemophilia, von Willebrand disease, and platelet disorders. These require haematology input and factor replacement planning.
- **HM-002** Anticoagulant management is one of the most common perioperative challenges. The specific agent (warfarin, DOACs, heparins, antiplatelets) dictates the bridging/withholding protocol.
- **HM-003** Sickle cell disease requires avoidance of hypoxia, dehydration, hypothermia, and acidosis. Pre-operative exchange transfusion may be needed.

### Obesity (OB)

Body mass index significantly affects airway management, ventilation, drug dosing, and positioning.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| OB-001 | BMI 30-39 (Obese) | II | BMI >= 30 AND BMI < 40 |
| OB-002 | BMI >= 40 (Morbid obesity) | III | BMI >= 40 |

**Clinical Notes:**
- BMI is auto-calculated from weight (kg) and height (cm) entered in the demographics section.
- Morbid obesity (BMI >= 40) is associated with difficult airway, impaired ventilation, increased aspiration risk, and drug dosing challenges.

### Functional Capacity (FC)

Functional capacity, measured in metabolic equivalents (METs), is a strong predictor of perioperative cardiac risk.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| FC-001 | Poor functional capacity (<4 METs) | III | Estimated METs < 4 |

**Clinical Notes:**
- 4 METs corresponds to the ability to climb a flight of stairs without stopping. Patients unable to achieve 4 METs have significantly higher perioperative cardiac risk per the ACC/AHA guidelines.
- METs are estimated from the patient's self-reported exercise tolerance:
  - Unable to perform daily activities: 1 MET
  - Light housework: 2 METs
  - Climb stairs: 4 METs
  - Moderate exercise (jogging): 7 METs
  - Vigorous exercise (running): 10 METs

### Demographics (AG)

Age is an independent risk factor for perioperative complications.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| AG-001 | Age > 80 years | II | Calculated age from DOB > 80 |

**Clinical Notes:**
- Advanced age is associated with reduced physiological reserve, increased sensitivity to anaesthetic agents, and higher rates of post-operative cognitive dysfunction and delirium.

### Social History (SH)

Substance use affects anaesthetic management, drug interactions, and post-operative recovery.

| Rule ID | Description | ASA Grade | Trigger Conditions |
|---------|------------|-----------|-------------------|
| SH-001 | Heavy alcohol use | II | Alcohol consumption = heavy (>14 units/week) |
| SH-002 | Recreational drug use | II | Recreational drugs = yes |

**Clinical Notes:**
- Heavy alcohol use is associated with liver disease, cardiomyopathy, coagulopathy, and alcohol withdrawal risk post-operatively.
- Recreational drug use (especially stimulants) can cause dangerous interactions with anaesthetic agents and may affect cardiovascular stability.

---

## Grade Distribution Summary

| ASA Grade | Number of Rules | Systems Covered |
|-----------|----------------|-----------------|
| II | 21 rules | Cardiovascular, Respiratory, Renal, Hepatic, Endocrine, Neurological, Haematological, Obesity, Demographics, Social |
| III | 17 rules | Cardiovascular, Respiratory, Renal, Hepatic, Endocrine, Neurological, Haematological, Obesity, Functional Capacity |
| IV | 4 rules | Cardiovascular (recent MI, NYHA IV), Hepatic (Child-Pugh B/C), Neurological (raised ICP) |

**Total: 42 rules** across 11 body systems/categories (10 Cardiovascular + 7 Respiratory + 3 Renal + 3 Hepatic + 4 Endocrine + 5 Neurological + 4 Haematological + 2 Obesity + 1 Functional Capacity + 1 Demographics + 2 Social History).

## Limitations and Clinical Judgement

This rule engine is a **clinical decision-support tool**, not a replacement for clinical judgement:

1. **The ASA classification is inherently subjective.** Two experienced anaesthetists may reasonably disagree on a patient's ASA grade. The automated grade should be treated as a starting point for discussion.

2. **Multiple comorbidities have synergistic risk.** A patient with three ASA II conditions may clinically warrant ASA III due to cumulative risk burden. The maximum-grade algorithm does not capture this interaction.

3. **Severity within categories varies.** The system captures broad categories (e.g., "valvular disease") but does not differentiate between mild mitral regurgitation and critical aortic stenosis.

4. **Temporal factors are partially captured.** Recent MI has a time-based rule, but other temporal considerations (e.g., recent stroke, recent decompensation) rely on the anaesthetist's review.

5. **ASA V is not assigned automatically.** Moribund patients requiring emergency surgery are identified by clinical assessment, not questionnaire responses.

6. **Emergency modifier (E).** The standard ASA classification appends "E" for emergency procedures. The system flags emergency urgency but does not modify the numerical grade.

All automated grades must be reviewed and may be overridden by the assessing anaesthetist.
