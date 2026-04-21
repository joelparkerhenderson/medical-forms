# ASA Grading Rules

The ASA Physical Status Classification System (ASA PS) assigns an
anaesthetic-risk grade on a scale of I (healthy) to VI (brain-dead organ
donor). This document lists the **rules fired by the composite grader** on
objective clinician findings.

Algorithm: **max-grade** — the highest-grade rule that fires sets the
output. ASA I is the default when no rules fire. An **E** suffix (e.g.
ASA IIE) is appended when the procedure is emergency.

## ASA classes

| Class | Definition | Examples |
| --- | --- | --- |
| I | A normal, healthy patient | Non-smoking, no or minimal alcohol use |
| II | Mild systemic disease | Controlled hypertension or diabetes, mild asthma, obesity (BMI 30–40), current smoker, social alcohol |
| III | Severe systemic disease | Poorly controlled DM or HTN, COPD, morbid obesity (BMI ≥ 40), active hepatitis, chronic kidney disease, history of MI > 3 months, implanted pacemaker, moderate reduction in ejection fraction, regularly scheduled dialysis |
| IV | Severe systemic disease that is a constant threat to life | Recent (< 3 months) MI, CVA, TIA, or CAD / stents; ongoing cardiac ischaemia or severe valve dysfunction; severe reduction of EF; sepsis; DIC; ARDS; end-stage renal failure not receiving regularly scheduled dialysis |
| V | Moribund patient not expected to survive without the operation | Ruptured AAA, massive trauma, intracranial bleed with mass effect, ischaemic bowel with multi-organ failure |
| VI | Declared brain-dead patient whose organs are being removed for donor purposes | — |

## Rules

Each rule has a unique ID for audit. The predicate fires on **clinician-
observed objective data**.

| Rule ID | Grade | Category | Predicate | Evidence |
| --- | --- | --- | --- | --- |
| R-ASA-II-01 | II | Cardiovascular | controlled hypertension (BP on treatment, target met) | NICE NG136 |
| R-ASA-II-02 | II | Endocrine | well-controlled diabetes (HbA1c 6–7%, no end-organ damage) | ASA 2020 |
| R-ASA-II-03 | II | Respiratory | mild, well-controlled asthma (no rescue inhaler use this month) | ASA 2020 |
| R-ASA-II-04 | II | Anthropometric | BMI 30–39.9 | ASA 2020 |
| R-ASA-II-05 | II | Social | current smoker or social alcohol use | ASA 2020 |
| R-ASA-II-06 | II | Obstetric | uncomplicated pregnancy | ASA 2020 |
| R-ASA-III-01 | III | Cardiovascular | poorly controlled HTN (BP > 160/100 on treatment) | NICE NG136 |
| R-ASA-III-02 | III | Endocrine | poorly controlled DM (HbA1c > 7%, fasting glucose > 10 mmol/L, or known end-organ complications) | CPOC 2021 |
| R-ASA-III-03 | III | Cardiovascular | history of MI > 3 months ago | Lee RCRI |
| R-ASA-III-04 | III | Cardiovascular | stroke or TIA > 3 months ago | Lee RCRI |
| R-ASA-III-05 | III | Cardiovascular | implanted pacemaker or ICD | ASA 2020 |
| R-ASA-III-06 | III | Cardiovascular | moderate reduction of EF (30–40%) | ASA 2020 |
| R-ASA-III-07 | III | Respiratory | COPD with functional limitation or FEV₁ 50–79% predicted | GOLD |
| R-ASA-III-08 | III | Respiratory | obstructive sleep apnoea on CPAP | ASA 2020 |
| R-ASA-III-09 | III | Renal | eGFR 30–59 mL/min/1.73 m² | KDIGO |
| R-ASA-III-10 | III | Renal | regularly scheduled dialysis | ASA 2020 |
| R-ASA-III-11 | III | Hepatic | chronic hepatitis, cirrhosis without decompensation | ASA 2020 |
| R-ASA-III-12 | III | Anthropometric | BMI ≥ 40 | ASA 2020 |
| R-ASA-III-13 | III | Haematology | alcohol dependence or abuse (AUDIT ≥ 8) | ASA 2020 |
| R-ASA-III-14 | III | Neurological | chronic pain on long-term opioids | CPOC 2021 |
| R-ASA-III-15 | III | Functional | Clinical Frailty Scale 5–6 | Rockwood 2005 |
| R-ASA-IV-01 | IV | Cardiovascular | recent (< 3 months) MI | Lee RCRI |
| R-ASA-IV-02 | IV | Cardiovascular | recent (< 3 months) stroke, TIA, or CAD / stents | Lee RCRI |
| R-ASA-IV-03 | IV | Cardiovascular | ongoing cardiac ischaemia (active angina, unstable symptoms) | ACC/AHA |
| R-ASA-IV-04 | IV | Cardiovascular | severe valve dysfunction (severe aortic stenosis, severe MR) | ESC 2021 |
| R-ASA-IV-05 | IV | Cardiovascular | severe reduction of EF (< 30%) | ASA 2020 |
| R-ASA-IV-06 | IV | Renal | end-stage renal failure not receiving regularly scheduled dialysis | KDIGO |
| R-ASA-IV-07 | IV | Respiratory | severe COPD (FEV₁ < 50%, home oxygen, resting SpO₂ < 92%) | GOLD |
| R-ASA-IV-08 | IV | Hepatic | decompensated cirrhosis (Child-Pugh C, ascites, encephalopathy) | ASA 2020 |
| R-ASA-IV-09 | IV | Systemic | sepsis, DIC, ARDS on current admission | ASA 2020 |
| R-ASA-IV-10 | IV | Functional | Clinical Frailty Scale 7–8 | Rockwood 2005 |
| R-ASA-V-01 | V | Systemic | moribund; expected mortality > 50% without surgery (ruptured AAA, massive trauma, etc.) | ASA 2020 |
| R-ASA-V-02 | V | Functional | Clinical Frailty Scale 9 (terminally ill) | Rockwood 2005 |
| R-ASA-VI-01 | VI | Systemic | declared brain-dead organ donor | ASA 2020 |

## Mallampati rules

| Rule ID | Class | Predicate |
| --- | --- | --- |
| R-MP-I | I | soft palate, uvula, fauces, pillars all visible |
| R-MP-II | II | soft palate, uvula, fauces visible |
| R-MP-III | III | soft palate and base of uvula visible |
| R-MP-IV | IV | hard palate only visible |

Mallampati III–IV fires a `difficult-airway` safety flag with high priority.

## RCRI components (Lee)

Score 1 point each (0–6 total). ≥ 2 points = high cardiac-complication risk.

1. High-risk surgery (intraperitoneal, intrathoracic, or suprainguinal vascular).
2. History of ischaemic heart disease.
3. History of congestive heart failure.
4. History of cerebrovascular disease (stroke or TIA).
5. Pre-operative insulin-requiring diabetes.
6. Pre-operative creatinine > 177 µmol/L (2.0 mg/dL).

## STOP-BANG (OSA)

Each "yes" scores 1 point (0–8 total). ≥ 5 = high risk of OSA.

- **S**noring loud enough to be heard through a closed door.
- **T**ired / fatigued / sleepy during daytime.
- **O**bserved apnoeas during sleep.
- **P**ressure — treated for hypertension.
- **B**ody mass index > 35 kg/m².
- **A**ge > 50 years.
- **N**eck circumference > 40 cm.
- **G**ender male.

## Clinical Frailty Scale

| Score | Label |
| --- | --- |
| 1 | Very Fit |
| 2 | Well |
| 3 | Managing Well |
| 4 | Vulnerable |
| 5 | Mildly Frail |
| 6 | Moderately Frail |
| 7 | Severely Frail |
| 8 | Very Severely Frail |
| 9 | Terminally Ill |

CFS ≥ 7 fires a `severe-frailty` safety flag.

## Override

The clinician may set a final ASA grade different from the computed one on
step 16, with a documented reason. Both values are persisted in the
`grading_result` row.
