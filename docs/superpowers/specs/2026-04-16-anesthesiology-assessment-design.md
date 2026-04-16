# Anesthesiology Assessment — Design Spec

## Overview

A UK NHS-aligned pre-operative anesthesiology assessment form that collects patient data via a 10-step single-page questionnaire, computes four validated clinical scoring systems (ASA, Mallampati/Airway, RCRI, STOP-BANG), derives a composite perioperative risk level, flags safety-critical issues, and generates a clinical report. Includes a clinician dashboard for patient triage.

**Deliverables:** HTML and Svelte versions of both patient form and clinician dashboard, plus SQL migrations, XML representations, and FHIR R5 representations.

**Clinical standards:** AAGBI/RCoA pre-operative assessment guidelines, NICE NG45 (routine preoperative tests), ASA Physical Status Classification, Mallampati Airway Classification, Revised Cardiac Risk Index (Lee Criteria), STOP-BANG OSA screening.

---

## Form Sections (10 Steps, Single Page)

### Step 1: Patient Demographics
- Full name, DOB, sex (male/female/other), NHS number
- Address (line 1, line 2, city, postcode)
- Phone, email
- Emergency contact (name, phone, relationship)
- GP details (name, practice, phone)

### Step 2: Planned Surgery
- Procedure name (text)
- Surgeon name (text)
- Surgery date (date)
- Surgery grade: minor / intermediate / major / complex
- Proposed anesthesia type: general / regional / sedation / local / combined

### Step 3: Medical History
System-by-system, each with yes/no toggle + conditional details text:
- Cardiovascular: hypertension, ischaemic heart disease, heart failure, valvular disease, arrhythmia, peripheral vascular disease, DVT/PE
- Respiratory: asthma, COPD, sleep apnea, recent URTI
- Neurological: epilepsy, stroke/TIA, neuromuscular disease
- Endocrine: diabetes type 1, diabetes type 2, thyroid disease, adrenal insufficiency
- Renal: chronic kidney disease, dialysis
- Hepatic: liver disease, jaundice, cirrhosis
- Haematologic: anaemia, bleeding disorder, clotting disorder
- Gastrointestinal: GORD/reflux, peptic ulcer
- Musculoskeletal: rheumatoid arthritis, limited mobility
- Psychiatric: anxiety, depression, other

### Step 4: Medications
Dynamic list, each entry:
- Drug name (text)
- Dose (text)
- Frequency (text)
- Route: oral / IV / SC / IM / inhaled / topical / other

Special-flag checkboxes (apply to the whole medication list):
- Currently on anticoagulants (yes/no)
- Currently on antiplatelets (yes/no)
- Currently on insulin (yes/no)
- Currently on steroids (yes/no)
- Currently on MAOIs (yes/no)

### Step 5: Allergies & Adverse Reactions
Dynamic list, each entry:
- Allergen name (text)
- Type: drug / latex / food / environmental
- Reaction description (text)
- Severity: mild / moderate / severe / anaphylaxis

Separate standalone field:
- Known latex allergy (yes/no)

### Step 6: Previous Anesthesia & Surgery History
Dynamic list of previous operations:
- Procedure name (text)
- Year (number)
- Anesthesia type: general / regional / sedation / local / unknown

Previous anesthesia complications (checkboxes):
- Difficult intubation
- Post-operative nausea/vomiting (PONV)
- Awareness during anesthesia
- Slow recovery
- Allergic reaction
- Other (text)

Family history:
- Malignant hyperthermia (yes/no/unknown)
- Other anesthetic complications in family (yes/no + details)

### Step 7: Social & Lifestyle History
- Smoking status: current / ex-smoker / never
- Pack-years (number, conditional on current/ex)
- Alcohol: units per week (number)
- Recreational drug use (yes/no + details)
- Functional capacity: can climb 2 flights of stairs without stopping (yes/no)
- Exercise tolerance: >4 METs / ≤4 METs / unknown
- Occupation (text)
- Pregnancy status: not pregnant / pregnant / not applicable

STOP-BANG subjective questions (collected here for natural patient flow):
- Do you snore loudly? (yes/no)
- Do you often feel tired or sleepy during the day? (yes/no)
- Has anyone observed you stop breathing during sleep? (yes/no)

### Step 8: Vital Signs & Anthropometrics
- Systolic BP (mmHg)
- Diastolic BP (mmHg)
- Heart rate (bpm)
- Respiratory rate (breaths/min)
- SpO2 (%)
- Temperature (°C)
- Height (cm)
- Weight (kg)
- BMI (auto-calculated, read-only display)
- Neck circumference (cm)

### Step 9: Physical Examination
**Airway Assessment:**
- Mallampati class: I / II / III / IV
- Mouth opening (cm, numeric)
- Thyromental distance (cm, numeric)
- Neck mobility: full / limited / fixed
- Dentition: intact / dentures / loose teeth / crowns / prominent incisors (checkboxes)
- Jaw protrusion: normal / limited

**Cardiovascular Examination:**
- Heart sounds: normal / murmur / irregular / added sounds
- Peripheral edema: none / mild / moderate / severe
- JVP: normal / raised

**Respiratory Examination:**
- Breath sounds: normal / wheeze / crackles / reduced
- Accessory muscle use: yes / no

### Step 10: Investigations & Anesthetic Plan
**Pre-operative investigations** (each with status select + notes text):
- Full blood count (FBC): not required / ordered / reviewed normal / reviewed abnormal
- Urea & electrolytes (U&E): same options
- Liver function tests (LFTs): same options
- Coagulation screen: same options
- HbA1c: same options
- ECG: same options
- Chest X-ray: same options
- Echocardiography: same options
- Other (text + status)

**RCRI criteria** (6 yes/no questions):
1. High-risk surgery (auto-filled from surgery grade = major/complex)
2. History of ischaemic heart disease
3. History of congestive heart failure
4. History of cerebrovascular disease (stroke/TIA)
5. Insulin-dependent diabetes
6. Serum creatinine >177 μmol/L (>2 mg/dL)

**ASA Physical Status Classification:**
- ASA class: I / II / III / IV / V / VI (radio)
- Emergency case: yes / no (checkbox, adds "E" suffix)

**Anesthetic plan:**
- Proposed technique: general / regional / combined / sedation / local
- Airway plan: facemask / LMA / ETT / awake fibreoptic / other
- Post-op destination: ward / HDU / ICU
- Special requirements (textarea)

---

## Scoring Engine

### ASA Physical Status (clinician-selected)
- Clinician selects ASA I-VI directly
- Risk mapping: I-II = low, III = medium, IV = high, V-VI = critical

### Mallampati / Airway Difficulty Risk (derived)
Inputs: Mallampati class, mouth opening, thyromental distance, neck mobility, dentition, jaw protrusion, difficult intubation history.

Risk levels:
- **Low:** Mallampati I-II AND mouth opening ≥3cm AND full neck mobility AND no adverse dentition AND no difficult intubation history
- **Medium:** Mallampati III OR mouth opening <3cm OR limited neck mobility OR loose teeth/prominent incisors OR thyromental distance <6.5cm
- **High:** Mallampati IV OR any two medium-risk factors OR difficult intubation history

### RCRI / Lee Index (auto-calculated, 0-6 points)
Each criterion = 1 point. Some auto-populated from other form sections:
- Criterion 1 (high-risk surgery): auto-filled from step 2 surgery grade
- Criterion 5 (insulin): auto-filled from step 4 medication flags
- Criteria 2-4, 6: clinician confirms in step 10

Score risk mapping: 0 = low, 1 = medium, 2 = high, ≥3 = critical

### STOP-BANG (auto-calculated, 0-8 points)
Mixed sources:
- S, T, O: from step 7 subjective questions
- P: from step 3 medical history (hypertension = yes)
- B: from step 8 BMI >35
- A: from step 1 DOB → age >50
- N: from step 8 neck circumference >40cm
- G: from step 1 sex = male

Score risk mapping: 0-2 = low, 3-4 = medium, 5-8 = high

### Overall Perioperative Risk (derived)
Takes the worst risk level across ASA, Airway, RCRI, and STOP-BANG:
- **Low:** all four = low
- **Medium:** any = medium, none higher
- **High:** any = high, none higher
- **Critical:** any = critical

### Flagged Issues (independent, priority-sorted)
| Flag ID | Condition | Priority | Message |
|---------|-----------|----------|---------|
| FLAG-LATEX | Latex allergy = yes | high | Latex allergy — ensure latex-free environment |
| FLAG-ANAPH | Any allergy severity = anaphylaxis | high | Anaphylaxis history: {allergen} — ensure emergency drugs available |
| FLAG-MH | Malignant hyperthermia personal or family = yes | high | Malignant hyperthermia risk — MH-safe anesthetic, dantrolene availability |
| FLAG-ANTICOAG | On anticoagulants = yes | high | Anticoagulant use — review bridging protocol |
| FLAG-ANTIPLATE | On antiplatelets = yes | medium | Antiplatelet use — review perioperative management |
| FLAG-DIFF-AIRWAY | Difficult intubation history = yes | high | Previous difficult intubation — difficult airway trolley, senior anesthetist |
| FLAG-GORD | GORD/reflux = yes | medium | GORD — consider rapid sequence induction |
| FLAG-PREGNANT | Pregnancy status = pregnant | high | Pregnant patient — obstetric anesthesia considerations |
| FLAG-HYPERTENSION | SBP >180 or DBP >110 | high | Uncontrolled hypertension — consider deferring elective surgery |
| FLAG-HYPOXIA | SpO2 <94% | high | Baseline SpO2 <94% — respiratory optimization needed |
| FLAG-MORBID-OBESITY | BMI >40 | medium | Morbid obesity (BMI >40) — specialist equipment and positioning |
| FLAG-INSULIN | On insulin = yes | medium | Insulin-dependent — perioperative glucose management plan required |
| FLAG-STEROIDS | On steroids = yes | medium | Steroid use — consider perioperative steroid cover |
| FLAG-MAOI | On MAOIs = yes | high | MAOI use — significant drug interaction risk with anesthetic agents |
| FLAG-MULTI-ALLERGY | 3+ allergies | medium | Multiple allergies ({count}) — review for cross-reactivity |
| FLAG-OBESITY | BMI 35-40 | low | Obesity (BMI 35-40) — airway and respiratory considerations |
| FLAG-SMOKER | Current smoker | low | Current smoker — increased respiratory complication risk |
| FLAG-ALCOHOL | Alcohol >14 units/week | medium | Elevated alcohol intake — hepatic and withdrawal considerations |
| FLAG-LOW-FUNC | Cannot climb 2 flights of stairs | medium | Limited functional capacity — increased perioperative risk |

---

## Report Page

**Risk banner:** Full-width color-coded banner showing overall perioperative risk (green/amber/red/purple).

**Score cards:** Four cards in a row:
- ASA Class (value + label, e.g., "ASA III — Severe systemic disease")
- Airway Risk (Mallampati class + derived risk level)
- RCRI Score (n/6 + MACE percentage + risk level)
- STOP-BANG (n/8 + OSA risk level)

**Flagged issues panel:** Priority-sorted list with left-border color coding (red = high, amber = medium, blue = low).

**Fired rules table:** All triggered rules grouped by category (Airway, Cardiac, Respiratory/OSA, General), showing rule ID, description, and risk level badge.

**Patient data summary:** Collapsible sections for each of the 10 form steps in read-only format.

**Actions:** Print, Download PDF, Start New Assessment.

---

## Clinician Dashboard

**Filter bar:** Text search, risk level dropdown (all/low/medium/high/critical), ASA class dropdown, surgery grade dropdown, allergy flag dropdown, clear filters button.

**Table columns (all sortable):** NHS Number, Patient Name, Procedure, Surgery Date, ASA Class, Overall Risk (color badge), RCRI Score, Allergy Flag.

**Row click:** Opens full report for that patient.

**Sample data:** 15-20 patients spanning all risk levels, surgery grades, and comorbidity combinations.

---

## SQL Migrations

15 files (00-14) following project conventions:
- UUID primary keys, `created_at`/`updated_at` with triggers
- One-to-one sections: UNIQUE constraint on assessment_id
- One-to-many (medications, allergies, investigations, previous operations): no UNIQUE
- CHECK constraints for enum columns
- COMMENT ON all tables and columns
- `NOT NULL DEFAULT ''` for text, `NULL` for numeric/date

---

## File Structure

```
forms/anesthesiology-assessment/
  index.md
  README.md -> index.md
  AGENTS.md
  CLAUDE.md
  plan.md
  tasks.md
  seed.md (existing)
  doc/
  sql-migrations/ (15 files)
  xml-representations/ (generated)
  fhir-r5/ (generated)

  front-end-patient-form-with-html/
    index.html
    report.html
    css/style.css
    js/app.js, data-model.js, anesthesia-grader.js, anesthesia-rules.js, flagged-issues.js, utils.js

  front-end-patient-form-with-svelte/
    package.json, svelte.config.js, vite.config.ts, tsconfig.json
    src/
      app.css, app.html
      routes/ (+layout, +page, assessment/+page, report/+page, report/pdf/+server.ts)
      lib/
        components/ui/ (TextInput, RadioGroup, Select, CheckboxGroup, SectionCard, DynamicList)
        components/steps/ (Step01-Step10)
        stores/assessment.svelte.ts
        engine/ (types.ts, anesthesia-grader.ts, anesthesia-rules.ts, flagged-issues.ts, utils.ts, anesthesia-grader.test.ts)

  front-end-clinician-dashboard-with-html/
    index.html, css/style.css, js/app.js, js/sample-data.js

  front-end-clinician-dashboard-with-svelte/
    package.json, svelte.config.js, vite.config.ts
    src/routes/ (+layout, +page)
    src/lib/ (sample-data.ts, columns.ts)
```

---

## Technology

- **HTML version:** Vanilla JS, CSS custom properties, data-field binding, sessionStorage for form→report data transfer
- **Svelte version:** SvelteKit, Svelte 5 runes ($state, $derived, $bindable, $props, $effect), Tailwind CSS v4, Zod validation, pdfmake for PDF, SVAR DataGrid for dashboard
- **SQL:** PostgreSQL with pgcrypto
- **Tests:** Vitest for scoring engine unit tests
