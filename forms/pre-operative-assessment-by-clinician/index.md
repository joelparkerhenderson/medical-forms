# Pre-operative Assessment by Clinician

A UK NHS–aligned, clinician-driven pre-operative assessment that records
**objective findings** (history, examination, vitals, laboratory results, imaging)
and computes an **ASA Physical Status grade** (I–VI), a composite perioperative
risk level, and a set of safety-critical flags. The output is a signed clinician
report with an anaesthesia plan suitable for the pre-operative record.

This form is the clinician counterpart to a patient self-report pre-operative
questionnaire: it is completed by an anaesthetist, surgeon, pre-op assessment
nurse, or perioperative physician rather than by the patient. It is aligned with
CPOC's *Preoperative Assessment and Optimisation for Adult Surgery* (June 2021)
and the Geeky Medics *Anaesthetic Pre-operative Assessment OSCE Guide*, and is
intended to support shared decision-making under the Montgomery consent
standard.

## Scope and intended users

- **Setting:** NHS pre-operative assessment clinic, day-surgery unit,
  anaesthetic-led high-risk clinic, or inpatient pre-op review.
- **Users:** anaesthetists, surgeons, pre-op assessment nurses, perioperative
  physicians, geriatricians (for POPS), clinical pharmacists.
- **Patients:** adults (≥ 16 years) considered for elective, urgent, or emergency
  surgery under general, regional, or anaesthesia-led sedation.

## Scoring system

- **Primary instrument:** ASA Physical Status Classification (I–VI) computed on
  objective clinician findings, with a clinician override + reason.
- **Secondary instruments:** Mallampati airway class (I–IV), Revised Cardiac
  Risk Index (RCRI, 0–6), STOP-BANG OSA screening (0–8), Clinical Frailty Scale
  (1–9), Duke Activity Status Index (DASI), ECOG performance status.
- **Composite perioperative risk:** Low / Moderate / High / Critical, driven by
  the worst-band finding across instruments (max-grade algorithm).

| Category | Drivers |
| --- | --- |
| Low | ASA I–II, Mallampati I–II, RCRI 0, STOP-BANG 0–2, CFS 1–3 — routine anaesthesia |
| Moderate | any single mid-band finding — additional planning, senior review optional |
| High | ASA III, Mallampati III–IV, RCRI ≥ 2, STOP-BANG ≥ 5, CFS 5–6 — senior anaesthetist review, consider enhanced care |
| Critical | ASA IV–V, predicted difficult airway plus significant cardiorespiratory comorbidity, CFS ≥ 7 — MDT pre-op review, consider critical care admission |

## 16-step clinician wizard

Completed in order on a single-page wizard. Each step collects **objective
clinician findings** — not patient self-report.

| # | Step | Key fields |
| --- | --- | --- |
| 1 | Clinician identification | name, role, GMC/NMC/HCPC registration number, date and time of assessment, site |
| 2 | Patient identification & planned procedure | NHS number, name, DOB, sex, weight, height, planned procedure, surgical specialty, urgency (elective / urgent / emergency), laterality, anticipated blood loss, ASA surgical severity (NICE NG45 grade 1–4) |
| 3 | Vital signs & anthropometrics | BP, HR, SpO₂, RR, temperature, BMI (auto-computed), capillary refill, pain score |
| 4 | Airway assessment | Mallampati I–IV, thyromental distance, mouth opening (cm), inter-incisor gap, neck range of motion, dentition condition, loose teeth, beard, cervical-spine mobility, prior difficult intubation, STOP-BANG |
| 5 | Cardiovascular | auscultation (rhythm, murmurs), peripheral pulses, JVP, peripheral oedema, ECG review (rate, rhythm, axis, ischaemic changes), echo EF % if available, RCRI components |
| 6 | Respiratory | auscultation (wheeze, crackles, crepitations), chest-wall deformity, CXR findings, PFT FEV₁/FVC if available, recent COVID-19 status and recovery |
| 7 | Neurological | GCS, cognitive status (AMT-4 / MOCA), cranial nerves summary, motor, sensory, reflexes, recent stroke / TIA |
| 8 | Renal & hepatic | creatinine, eGFR, urea, bilirubin, ALT, AST, albumin, INR (if hepatic), dialysis dependency |
| 9 | Haematology & coagulation | Hb, platelets, INR, APTT, group & save / crossmatch status, last transfusion, iron indices |
| 10 | Endocrine | fasting glucose, HbA1c, thyroid status (TSH if indicated), adrenal status, steroid use, diabetes type and control |
| 11 | Gastrointestinal | abdominal exam, reflux assessment, fasting status confirmation, last oral intake, NG tube / stoma |
| 12 | Musculoskeletal & integumentary | spine for neuraxial, joint range of motion for positioning, skin at IV / regional block sites, pressure-ulcer risk |
| 13 | Medications & allergies | clinician-reconciled medication list, anticoagulant hold plan, steroid cover, confirmed allergies with reactions, alcohol and smoking status |
| 14 | Functional capacity & frailty | METs estimate, Duke Activity Status Index, Clinical Frailty Scale, ECOG, 6-minute walk test result if available, CPET summary |
| 15 | Anaesthesia & post-op plan | proposed technique (GA / regional / sedation / MAC / combined), airway plan (supraglottic / ETT / awake FOI), monitoring level, analgesia plan, DVT prophylaxis, post-op disposition (ward / enhanced care / HDU / ICU), anticipated length of stay |
| 16 | Summary, ASA & sign-off | computed ASA grade + fired rules, composite risk, safety flags, clinician override + reason (optional), overall recommendation (proceed / optimise first / cancel), additional notes, electronic signature |

## Safety flags

Computed independently of ASA grade. Priority: high / medium / low.
Categories include difficult airway, severe cardiac (EF < 40 %), severe pulmonary
(SpO₂ < 92 % on room air), uncontrolled diabetes (HbA1c > 9 %), severe anaemia
(Hb < 80 g/L), coagulopathy (INR > 1.5 off anticoagulants), severe renal
(eGFR < 30), severe hepatic (bilirubin > 50 µmol/L, albumin < 25 g/L), severe
frailty (CFS ≥ 7), recent COVID-19 (< 7 weeks), fasting violation, missing
crossmatch for high-blood-loss surgery, high-risk medication conflict,
cognitive impairment / capacity concern, paediatric, pregnancy, safeguarding,
malignant hyperthermia risk, latex allergy, suxamethonium apnoea, pseudocholine-
sterase deficiency.

## Output

- **HTML report preview** and downloadable **PDF** via `pdfmake`.
- **FHIR R5 Bundle** exportable for integration with hospital EHR.
- **XML** representation for archival or import into legacy systems.
- **Anaesthesia plan** suitable to include in the pre-op record and WHO Safer
  Surgery Checklist.

## Directory structure

```
pre-operative-assessment-by-clinician/
  index.md                                          # this file
  AGENTS.md                                         # agent instructions
  plan.md                                           # implementation roadmap
  tasks.md                                          # task tracking
  doc/                                              # documentation
  seeds/                                            # reference source materials
  sql-migrations/                                   # Liquibase Postgres migrations
  xml-representations/                              # XML + DTD per SQL table
  fhir-r5/                                          # FHIR HL7 R5 JSON resources
  front-end-patient-form-with-html/                 # static single-page HTML wizard
  front-end-patient-form-with-svelte/               # SvelteKit single-page wizard
  front-end-clinician-dashboard-with-html/          # review dashboard (HTML table)
  front-end-clinician-dashboard-with-svelte/        # review dashboard (SVAR Grid)
  full-stack-with-rust-axum-loco-tera-htmx-alpine/  # Rust backend + server-rendered UI
```

> Note: the monorepo uses the directory name `front-end-patient-form-with-*` as
> the conventional location of the *primary data-entry* questionnaire. In this
> form the data-entry UI is operated by a clinician rather than by a patient;
> the directory name is retained to match the monorepo convention.

## Clinical references

- Centre for Perioperative Care (CPOC). *Preoperative Assessment and
  Optimisation for Adult Surgery* (June 2021) — see `seeds/`.
- Geeky Medics. *Anaesthetic Pre-operative Assessment OSCE Guide*.
  <https://geekymedics.com/anaesthetic-pre-operative-assessment-osce-guide/>.
- American Society of Anesthesiologists. *ASA Physical Status Classification
  System* (last amended 2020).
- Lee T.H. *et al.* Revised Cardiac Risk Index. *Circulation* 1999; 100:1043–9.
- Chung F. *et al.* STOP-BANG Questionnaire. *Anesthesiology* 2008; 108:812–21.
- Rockwood K. *et al.* Clinical Frailty Scale. *CMAJ* 2005; 173:489–95.
- NICE NG45. *Routine preoperative tests for elective surgery* (2016).
- Association of Anaesthetists. *Pre-operative Assessment and Patient
  Preparation* (2010).

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification) — clinical decision
  support, Class IIa where output drives anaesthetic plan selection.
- UK Medical Devices Regulations 2002.
- ISO/IEC/IEEE 26514:2022.
- UK MHRA *Software and AI as a Medical Device*.
- NHS Data Security and Protection Toolkit.

## Verify

```sh
bin/test-form pre-operative-assessment-by-clinician
```
