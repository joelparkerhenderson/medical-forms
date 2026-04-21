# WHO Prehospital Form

World Health Organization standardised prehospital clinical documentation form for emergency medical services.

This two-page form captures comprehensive prehospital assessment data including caller/patient identification, initial vital signs, high risk signs, triage category, ABCDE primary survey with detailed clinical findings and interventions, SAMPLE history, injury details, physical exam, additional interventions, reassessments, presumptive diagnoses, and disposition/handover. Designed for use with the WHO Reference Card.

## Source

- **Form**: WHO Prehospital Form (SCF Prehospital)
- **Organisation**: World Health Organization (WHO)
- **URL**: <https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/prehospital-scf.pdf?sfvrsn=53881340_2>
- **Pages**: 2
- **Reference**: See who.int/emergencycare for more information

## Structure

### Page 1

#### Header

| Field | Type |
| --- | --- |
| Mass Casualty | Checkbox |

#### Caller & Scene Information

| Field | Type |
| --- | --- |
| Caller name | Text |
| Caller phone | Text |
| Patient name | Text |
| Date of birth/age | Text |
| Sex | Male / Female |
| Patient address | Text |
| Occupation | Text |
| Date | Date |
| Scene call / Inter Facility Transfer | Checkbox |
| Run number | Text |
| Scene location & type | Residence / School / Public Building / Health Facility / Street / Other |

#### Timestamps

| Field | Type |
| --- | --- |
| Call Received | Time |
| En route to Scene | Time |
| Arrived at Scene | Time |
| Transporting | Time |
| At Facility | Time |
| In Service | Time |

#### Chief Complaint & Initial Vital Signs

| Field | Type |
| --- | --- |
| Chief complaint | Text |
| Injury | Checkbox |
| HR | Number |
| RR | Number |
| BP | Text |
| Temp | Number |
| RBS | Number |
| SpO2 | Number (% on) |
| Time | Time |
| Care in progress on arrival | Free text |
| Pregnant | Yes / No / Unknown |
| Pain scale | 0–10 faces scale (No Hurt → Hurts Worst) |

#### High Risk Signs

- **A/B**: Stridor, cyanosis, respiratory distress
- **C**: Poor perfusion, weak fast pulse, cap refill >3s, heavy bleeding; Child lethargy, sunken eyes, slow skin pinch, poor drinking; Adult HR <50 or >150
- **D**: Unresponsive; Acute convulsions; Hypoglycaemia; Acute focal neurologic deficit; Altered mental status with fever or hypothermia or stiff neck or headache
- **Other**: High risk trauma; Threatened limb; Snake bite; Poisoning, ingestion, chemical exposure; Violent or aggressive; Temp >39°C or <36°C; Acute testicular pain or priapism; Pregnant with high risk findings; Adult severe chest or abdominal pain or ECG with ischaemia; Infant <8 days; Infant <2 months with temp >39°C or <36°C

#### Triage Category

- Circle: RED / YELLOW / GREEN
- Triaged for: (free text)

#### Primary Survey — A (Airway)

- NML checkbox
- Voice changes / Stridor / Oral/Airway burns / Angioedema
- Obstructed by: Tongue / Blood / Secretions / Vomit / Foreign body
- **Airway interventions**: Repositioning / Suction / OPA / NPA / LMA / BVM / ETT
- **C-spine stabilized**: Not needed / Done

#### Primary Survey — B (Breathing)

- NML checkbox
- Spontaneous Respiration: Yes / No
- Chest Rise: Shallow / Retractions / Paradoxical
- Trachea: Midline / Deviated to L / R
- Breath Sounds: NML
- **Interventions**: Oxygen (L/min) / NC / Face mask / Non-rebreather mask / BVM / BiPAP/CPAP / Other

#### Primary Survey — C (Circulation)

- NML checkbox
- Skin: Warm / Dry / Pale / Cyanotic / Moist / Cool
- Capillary refill: <3 sec / ≥3 sec
- Pulses: Weak / Asymmetric
- JVD: Yes / No
- Active bleeding site: (free text)
- **Interventions**: Bleeding controlled (bandage, tourniquet, direct pressure) + Time; Access: IV site (size) / IO site (size); IVF (ml) — NS / LR / Other; Pelvis stabilized; Femur fracture stabilised

#### Primary Survey — D (Disability)

- NML checkbox
- Blood glucose (as needed)
- Responsiveness: A / V / P / U
- GCS: E__ V__ M__ (total)
- Moves Extremities: L arm / R arm / L leg / R leg
- Pupils: Size L__ R__; Reactivity L__ R__
- **Interventions**: Glucose checked / Glucose given / Naloxone given

#### Primary Survey — E (Exposure)

- NML checkbox
- Exposed completely
- ENTER ADDITIONAL EXAM FINDINGS ON REVERSE →

#### SAMPLE History

| Letter | Field | Type |
| --- | --- | --- |
| S | Signs/symptoms | Free text / Unknown |
| A | Allergies | Free text / Unknown |
| M | Medications | Free text / Unknown |
| P | Past medical | Free text / Unknown |
| P | Past surgeries | Free text / Unknown |
| L | Last ate (hrs) | Number / Unknown |
| E | Events (and ROS) | Free text / Unknown |

### Page 2

#### If Injury

- Intent: Intentional / Unintentional / Self-inflicted
- Mechanism: Fall / Hit by falling object / Stab/Cut / Gunshot / Sexual assault / Other blunt force trauma / Suffocation, choking, hanging / Drowning (Life vest Y/N) / Burn caused by / Poisoning/toxic exposure / Unknown / Other
- Road traffic incident: Driver / Passenger / Pedestrian / Ejected / Extricated
- Vehicle: Car / Bike / Motorbike / Other
- Safety: Airbag / Seatbelt / Helmet / Other restraint

#### Physical Exam

Each system has NML checkbox + free text:

- General
- HEENT
- Respiratory
- Cardiac
- Abdominal
- Pelvis/GU
- Neurologic
- Psychiatric
- MSK
- Skin

#### Additional Interventions

**Medications given** (checkboxes):
- Bronchodilators
- Epinephrine
- Aspirin
- Seizure medication
- Analgesia
- IV fluid infusion
- Other

**Procedures** (checkboxes):
- Wound Bandaging
- Burn Dressing
- Splinting/reduction
- Pelvic stabilization
- ECG
- Other

#### Assessment and Plan

Free text: brief summary and differential

#### Reassessment (×3 slots)

| Field | Type |
| --- | --- |
| Time | Time |
| HR | Number |
| RR | Number |
| Temp | Number |
| SpO2 | Number (% on) |
| RBS | Number |
| Pain | Number |
| Unchanged | Checkbox |

#### Presumptive Diagnoses

Free text

#### Disposition

| Field | Type |
| --- | --- |
| Disposition | Free text |
| Handover time | Time |
| Handover to (name, cadre & signature) | Text + Signature |
| Vitals at handover (time) | Time |
| HR | Number |
| RR | Number |
| Temp | Number |
| BP | Text |
| SpO2 | Number (% on) |
| Plan discussed with patient? | Yes / No |
| Provider(s) name | Text |
| Provider(s) signature & date | Signature + Date |

## Steps

| # | Step | Section |
| --- | --- | --- |
| 1 | Caller & Scene | Caller info, patient ID, scene details, timestamps |
| 2 | Chief Complaint & Vitals | Chief complaint, initial vital signs, pregnancy, pain |
| 3 | High Risk Signs | A/B, C, D, Other risk indicators |
| 4 | Triage | RED / YELLOW / GREEN category |
| 5 | Airway (A) | Primary survey airway assessment and interventions |
| 6 | Breathing (B) | Primary survey breathing assessment and interventions |
| 7 | Circulation (C) | Primary survey circulation assessment and interventions |
| 8 | Disability (D) | Primary survey neurological assessment and interventions |
| 9 | Exposure (E) | Exposure assessment |
| 10 | SAMPLE History | Signs, allergies, medications, past medical, last ate, events |
| 11 | Injury Details | Intent, mechanism, road traffic details, safety equipment |
| 12 | Physical Exam | System-by-system examination |
| 13 | Additional Interventions | Medications given and procedures performed |
| 14 | Assessment & Plan | Summary, differential, presumptive diagnoses |
| 15 | Reassessment | Up to 3 reassessment vital sign sets |
| 16 | Disposition | Handover, final vitals, provider signature |

## Directory structure

```
who-prehospital-form/
  front-end-form-with-svelte/                         # Patient questionnaire
  front-end-dashboard-with-svelte/                    # Dashboard
  full-stack-with-rust-axum-loco-tera-htmx-alpine/    # Full-stack option
```

## Technology

See [root index.md](../index.md) for technology stacks.
