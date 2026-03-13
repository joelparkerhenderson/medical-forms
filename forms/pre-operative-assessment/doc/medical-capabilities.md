# Medical Capabilities

This document describes the clinical assessments, scoring methodologies, and medical knowledge encoded in the Pre-Operative Assessment system.

## Scope of Assessment

The system performs a comprehensive pre-anaesthesia medical evaluation covering 16 domains across 10 body systems, social factors, medications, allergies, anaesthetic history, and functional capacity. It is designed to mirror the structure of a face-to-face pre-operative assessment clinic consultation.

### Target Patient Population

- Adult patients (typically age 16+) presenting for elective, urgent, or emergency surgical procedures requiring anaesthesia.
- The questionnaire is designed for self-completion on a tablet device in a clinic waiting room, with clinical review of results by an anaesthetist.

### Intended Clinical Setting

- Pre-operative assessment clinics (outpatient)
- Day surgery units
- Surgical admission wards
- Emergency departments (as a structured assessment aid)

---

## Body Systems Assessed

### 1. Cardiovascular System

The most comprehensive section, reflecting that cardiovascular disease is the leading cause of perioperative morbidity and mortality.

**Conditions Assessed:**
- Hypertension (with control status)
- Ischaemic heart disease (angina, previous MI)
- Heart failure (with NYHA functional classification I-IV)
- Valvular heart disease
- Arrhythmias (with type specification)
- Pacemaker / implantable cardioverter-defibrillator (ICD)
- Recent myocardial infarction (with timing in weeks)

**Clinical Scoring:**
- NYHA (New York Heart Association) Classification for heart failure severity
- Temporal risk stratification for recent MI (<12 weeks = highest risk)

### 2. Respiratory System

**Conditions Assessed:**
- Asthma (with GINA-based severity: intermittent, mild-persistent, moderate-persistent, severe-persistent)
- COPD (with severity: mild, moderate, severe)
- Obstructive sleep apnoea (with CPAP compliance)
- Smoking status (current, ex-smoker, never) with pack-year calculation
- Recent upper respiratory tract infection

**Clinical Scoring:**
- GINA classification for asthma severity
- Smoking pack-years as a quantitative exposure measure

### 3. Renal System

**Conditions Assessed:**
- Chronic kidney disease (with KDIGO staging 1-5)
- Dialysis requirement (haemodialysis vs peritoneal)

**Clinical Scoring:**
- KDIGO staging system (based on estimated GFR)

### 4. Hepatic System

**Conditions Assessed:**
- Liver disease (non-cirrhotic)
- Cirrhosis (with Child-Pugh classification A/B/C)
- Hepatitis (with type specification)

**Clinical Scoring:**
- Child-Pugh classification for cirrhosis severity
  - A: Well compensated (5-6 points)
  - B: Significant functional compromise (7-9 points)
  - C: Decompensated (10-15 points)

### 5. Endocrine System

**Conditions Assessed:**
- Diabetes mellitus (Type 1, Type 2, gestational, with control status)
- Insulin dependence
- Thyroid disease (hypothyroid vs hyperthyroid)
- Adrenal insufficiency

**Clinical Considerations:**
- Perioperative glucose management protocols
- Steroid cover requirements for adrenal insufficiency
- Thyroid storm risk assessment

### 6. Neurological System

**Conditions Assessed:**
- Stroke / transient ischaemic attack (TIA)
- Epilepsy (with control status)
- Neuromuscular disease (MS, MND, myasthenia gravis, etc.)
- Raised intracranial pressure

**Clinical Considerations:**
- Implications for muscle relaxant choice
- Seizure threshold considerations with anaesthetic agents
- Cerebrovascular risk stratification

### 7. Haematological System

**Conditions Assessed:**
- Bleeding disorders (haemophilia, von Willebrand disease, platelet disorders)
- Anticoagulant and antiplatelet therapy (with agent specification)
- Sickle cell disease
- Sickle cell trait
- Anaemia

**Clinical Considerations:**
- Anticoagulant bridging protocols
- Factor replacement planning
- Sickle cell precautions (avoid hypoxia, hypothermia, dehydration)

### 8. Musculoskeletal and Airway Assessment

**Conditions Assessed:**
- Rheumatoid arthritis (atlanto-axial instability risk)
- Cervical spine pathology
- Limited neck movement
- Limited mouth opening
- Dental issues (loose teeth, crowns, dentures)
- Previous difficult airway
- Mallampati classification (1-4)

**Clinical Scoring:**
- Mallampati classification for airway prediction
  - Class 1: Soft palate, uvula, fauces, pillars visible
  - Class 2: Soft palate, uvula, fauces visible
  - Class 3: Soft palate, base of uvula visible
  - Class 4: Hard palate only visible

### 9. Gastrointestinal System

**Conditions Assessed:**
- Gastro-oesophageal reflux disease (GORD)
- Hiatus hernia
- Nausea / vomiting tendency

**Clinical Considerations:**
- Aspiration risk assessment
- Rapid sequence induction indication
- Anti-reflux prophylaxis requirements

### 10. Pregnancy Assessment

**Conditions Assessed:**
- Possibility of pregnancy
- Confirmed pregnancy (with gestation in weeks)

**Conditional Display Logic:**
- Only shown to female patients aged 12-55
- Automatically skipped for male patients and females outside childbearing age

---

## Medications and Allergies

### Medication Documentation

The system captures a dynamic list of all current medications including:
- Medication name
- Dose
- Frequency

This supports the anaesthetist in identifying:
- Drug interaction risks
- Medications to withhold pre-operatively (e.g., metformin, ACE inhibitors)
- Medications to continue (e.g., beta-blockers, statins)
- Medications requiring adjustment (e.g., insulin)

### Allergy Documentation

Each allergy entry captures:
- Allergen name
- Reaction description
- Severity classification (mild, moderate, anaphylaxis)

Anaphylaxis-severity allergies generate high-priority flags on the report.

---

## Anaesthetic History

**Information Captured:**
- Previous general anaesthetic experience
- Problems with previous anaesthetics (with details)
- Family history of malignant hyperthermia (MH)
- Post-operative nausea and vomiting (PONV) history

**Clinical Significance:**
- Previous difficult airway or anaesthetic complications guide the anaesthetic plan
- Family MH history triggers the highest-priority safety flag in the system, as MH is a life-threatening pharmacogenetic condition triggered by volatile anaesthetic agents and succinylcholine
- PONV history informs prophylactic anti-emetic prescribing

---

## Functional Capacity Assessment

The system estimates metabolic equivalents (METs) from self-reported exercise tolerance:

| Tolerance Level | Estimated METs | Example Activities |
|----------------|---------------|-------------------|
| Unable to perform daily activities | 1 MET | Bed/chair-bound |
| Light housework | 2 METs | Walking around the house, cooking |
| Climb a flight of stairs | 4 METs | Walking uphill, heavy housework |
| Moderate exercise | 7 METs | Jogging, cycling, dancing |
| Vigorous exercise | 10 METs | Running, swimming laps, competitive sport |

**Clinical Significance:**
- The 4-MET threshold is the critical decision point from ACC/AHA perioperative cardiac risk guidelines.
- Patients below 4 METs have significantly elevated cardiac risk and may require further cardiac investigation before elective surgery.
- Functional capacity correlates with post-operative outcomes across all surgical specialties.

---

## Automated Calculations

### BMI Calculation

- **Formula:** BMI = weight (kg) / height (m)^2
- **Input:** Weight in kg, height in cm (converted to metres)
- **Auto-calculated** in real time as the patient enters weight and height
- **Categories displayed:**
  - < 18.5: Underweight
  - 18.5-24.9: Normal
  - 25-29.9: Overweight
  - 30-34.9: Obese Class I
  - 35-39.9: Obese Class II
  - >= 40: Obese Class III (Morbid)

### Age Calculation

- Calculated from date of birth to current date
- Used for:
  - Age > 80 rule (ASA II)
  - Pregnancy section conditional display (female, age 12-55)

### METs Estimation

- Derived from exercise tolerance selection
- Used for:
  - Poor functional capacity rule (ASA III if < 4 METs)
  - Displayed on the report for clinical reference

---

## Output Capabilities

### ASA Grade Report

The system produces:

1. **ASA Grade (I-V)** with descriptive label
2. **Complete list of fired rules** with:
   - Unique rule ID for audit trail
   - Body system
   - Clinical finding description
   - Individual rule grade
3. **Additional safety flags** sorted by priority (high/medium/low)
4. **Patient summary** with demographics, BMI, and planned procedure
5. **Medication and allergy lists**

### PDF Report

A downloadable PDF containing all of the above, formatted for:
- Inclusion in patient medical records
- Anaesthetic chart attachment
- Inter-departmental communication
- Clinical audit

### Print-Friendly View

The on-screen report includes print-friendly CSS for direct browser printing.

---

## Clinical Standards Alignment

The system's medical content aligns with:

| Standard/Guideline | Relevance |
|---|---|
| ASA Physical Status Classification (ASA, 2014 update) | Core grading framework |
| NICE CG3: Preoperative tests | Pre-assessment scope |
| ACC/AHA Perioperative Cardiovascular Guidelines | Functional capacity thresholds, cardiac risk |
| GINA Asthma Severity Classification | Asthma staging |
| GOLD COPD Classification | COPD staging |
| KDIGO CKD Classification | Renal staging |
| Child-Pugh Liver Classification | Hepatic staging |
| NYHA Functional Classification | Heart failure staging |
| Mallampati Classification | Airway assessment |
| AAGBI Guidelines for Pre-assessment | Assessment structure and scope |
