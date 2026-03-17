# WHO Acute Referral Form

World Health Organization standardised acute referral form for transferring patients between healthcare facilities.

This single-page form documents the referral of a patient from an initiating facility to a referral facility. It follows the SBAR (Situation, Background, Assessment, Recommendations) communication framework and captures patient identification, facility details, transport information, ABCDE assessment with interventions, clinical assessment, and transport recommendations with precautions. A copy should be sent to the referral facility.

## Source

- **Form**: Acute Referral Form
- **Organisation**: World Health Organization (WHO)
- **URL**: <https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/ect/acute-referral-form.pdf?sfvrsn=c388cbda_3>
- **Pages**: 1

## Structure

### For Completion by the Initiating Facility

#### Patient Identification

| Field | Type |
| --- | --- |
| Patient Name (LAST, First) | Text |
| Date of birth (day-month-year) | Date |
| Sex | Male / Female / Unknown |
| Patient contact information | Text |
| Patient's emergency contact person | Name + Contact information |

#### Facility & Transport Details

| Field | Type |
| --- | --- |
| Initiating facility (refers patient for care) | Name, Focal point, Phone No |
| Reason for referral | Free text |
| Referral facility contacted | Checkbox |
| Referral facility (receives patient & provides referral care) | Name, Focal point, Phone No |
| Ambulance | Name, Focal point, Phone No |
| Date & time of: Transfer decision | DateTime |
| Date & time of: Departure | DateTime |
| Mode of transfer (circle) | Ground (ambulance) / Air / Sea |

### Situation

| Field | Type |
| --- | --- |
| Chief complaint | Free text |
| Primary diagnosis | Free text |
| Pregnant? (circle) | Yes / No / Unknown |
| Other acute diagnoses | Free text |
| Treatments initiated | Free text |

### Background

| Field | Type |
| --- | --- |
| Brief history of present illness | Free text |
| Relevant past medical & surgical history | Free text |

#### ABCDE Conditions (Finding & Intervention)

Each category has Finding (Normal checkbox + free text) and Intervention (free text + None checkbox):

| System | Finding | Intervention |
| --- | --- | --- |
| Airway | Normal / findings | Free text / None |
| Breathing | Normal / findings | Free text / None |
| Circulation | Normal / findings | Free text / None |
| Disability (neurologic status) | Normal / findings | Free text / None |
| Exposure | Normal / findings | Free text / None |

Any other significant treatments or procedures: Free text

### Assessment

Description of what is wrong with the patient & the need for referral. Include current vital signs. (Free text)

### Recommendations

| Field | Type |
| --- | --- |
| Next steps in treatment plan, including therapies continued during transport | Free text |
| Potential worsening of patient condition | Free text |
| Cautions regarding prior therapies or interventions | Free text |
| Precautions | Checkboxes: Highly infectious disease / Spinal precautions / Weight bearing restrictions / Fall risk / Aspiration risk / Other |

#### Initiating Facility Provider

| Field | Type |
| --- | --- |
| Name | Text |
| Signature | Signature |

### For Completion by the Referral Facility

| Field | Type |
| --- | --- |
| Date & time of patient arrival | DateTime |
| Referral facility provider — Name | Text |
| Referral facility provider — Signature | Signature |
| Feedback provided to initiating facility | Checkbox |

Note: Attach copy of medication chart at discharge or list of current medications, including dose & time of last dose.

## Steps

| # | Step | Section |
| --- | --- | --- |
| 1 | Patient Identification | Patient name, DOB, sex, contacts |
| 2 | Facility & Transport | Initiating/referral facilities, ambulance, mode, times |
| 3 | Situation | Chief complaint, diagnosis, pregnancy, treatments |
| 4 | Background | History, past medical/surgical, ABCDE assessment |
| 5 | Assessment | Clinical assessment with vital signs |
| 6 | Recommendations | Treatment plan, precautions, transport concerns |
| 7 | Provider Sign-off | Initiating facility provider signature |
| 8 | Referral Facility Receipt | Arrival time, receiving provider, feedback checkbox |

## Directory structure

```
who-acute-referral-form/
  front-end-patient-form-with-svelte/     # Patient questionnaire
  front-end-clinician-dashboard-with-svelte/  # Clinician dashboard
  full-stack-with-rust-axum-loco-tera-htmx-alpine/    # Full-stack option
```

## Technology

See [root index.md](../index.md) for technology stacks.
