# WHO Emergency First Aid Form

World Health Organization standardised emergency first aid documentation form for community first aid responders.

This single-page form captures patient identification, situation assessment, medical background, CABCDE systematic assessment with corresponding interventions, recommendations for transport, and community first aid responder details. A copy of the completed form should be sent to the referral facility.

## Source

- **Form**: Emergency First Aid Form
- **Organisation**: World Health Organization (WHO)
- **URL**: <https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/emergency-first-aid-form.pdf?sfvrsn=fd38f178_1>
- **Pages**: 1

## Structure

### Patient Identification

| Field | Type |
| --- | --- |
| Patient Name (LAST, First) | Text |
| Date of birth (day-month-year) | Date |
| Age | Number |
| Sex | Male / Female / Unknown |
| Patient contact information | Text |
| Patient's contact person | Name + Contact information |

### Referral & Transport

| Field | Type |
| --- | --- |
| Referral facility (where patient being sent to) | Name of facility, Focal point, Phone No |
| Ambulance (if available) | Name of ambulance service, Focal point, Phone No |
| Date & time of: Event | DateTime |
| Date & time of: Departure from scene | DateTime |

### Situation

| Field | Type |
| --- | --- |
| Problem | Medical (checkbox) / Trauma (checkbox) |
| Pregnant? | Circle: Yes / No / Unknown |
| What happened to the patient | Free text (date/time of injury/illness start, where, how) |

### Background

| Field | Type |
| --- | --- |
| Past medical & surgical history | Free text |
| Current medications or allergies | Free text |

### CABCDE Conditions (Assessment & Intervention)

Each CABCDE category has an Assessment column (Normal checkbox or findings) and an Intervention column (checkboxes for actions taken, or None).

#### C — Major Bleeding

- **Assessment**: (free text) / None
- **Intervention**: Direct Pressure / Deep Wound Packing / Tourniquet (ONLY if life threatening bleeding) — Time of tourniquet application / Uterine Massage / None

#### A — Airway

- **Assessment**: (free text) / Normal
- **Intervention**: Neck Immobilization / Head-Tilt Chin-Lift / Jaw Thrust / Choking Care / None

#### B — Breathing

- **Assessment**: (free text) / Normal
- **Intervention**: Maintained position of patient comfort / None

#### C — Circulation

- **Assessment**: (free text) / Normal
- **Intervention**: Pelvic Binder / Control minor bleeding / Fracture Care / Oral Hydration / Lie down to improve circulation (left-lateral position) / None

#### D — Disability

- **Assessment**: (free text) / Normal
- **Intervention**: Spinal Immobilisation / Glucose Given / Seizure Care / High Temperature Care / Low Temperature Care / None

#### E — Exposure/Other

- **Assessment**: (free text) / Normal
- **Intervention**: Recovery Position / Burn Care / Wound Care / Drowning Care / Snakebite Care / None

#### Any medication taken?

- Free text / None

### Recommendations

| Field | Type |
| --- | --- |
| Next steps in transport plan | Free text |
| Any problems anticipated | Free text |
| Any other concerns | Free text |
| Precautions | Checkboxes: Highly infectious disease / Spinal immobilization / Possible fracture / Fall risk / Altered mental status / Other |

### Community First Aid Responder

| Field | Type |
| --- | --- |
| Name | Text |
| Signature | Signature |
| Contact information | Text |
| CFAR Organization | Text |

## Steps

| # | Step | Section |
| --- | --- | --- |
| 1 | Patient Identification | Patient name, DOB, age, sex, contact info |
| 2 | Referral & Transport | Referral facility, ambulance, event/departure times |
| 3 | Situation | Problem type, pregnancy status, what happened |
| 4 | Background | Medical/surgical history, medications, allergies |
| 5 | Major Bleeding (C) | Assessment and intervention for haemorrhage |
| 6 | Airway (A) | Assessment and intervention for airway |
| 7 | Breathing (B) | Assessment and intervention for breathing |
| 8 | Circulation (C) | Assessment and intervention for circulation |
| 9 | Disability (D) | Assessment and intervention for neurological |
| 10 | Exposure/Other (E) | Assessment and intervention for exposure |
| 11 | Recommendations | Transport plan, precautions, concerns |
| 12 | Responder Details | Community first aid responder identification |

## Directory structure

```
who-emergency-first-aid-form/
  front-end-patient-form-with-svelte/     # Patient questionnaire
  front-end-clinician-dashboard-with-svelte/  # Clinician dashboard
  full-stack-with-rust-axum-loco-tera-htmx-alpine/    # Full-stack option
```

## Technology

See [root index.md](../index.md) for technology stacks.
