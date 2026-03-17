# WHO Counter-Referral Form

World Health Organization standardised counter-referral form for discharging patients back from a referral facility to their primary care facility.

This single-page form documents the counter-referral (discharge back) of a patient from a referral facility to the initiating or primary care facility. It follows the SBAR communication framework and captures patient identification, facility details, communication about patient care, follow-up timeframe, situation including treatments initiated during stay (ICU, surgery, hospitalization), background with history and investigation results, assessment with diagnoses and prognosis, and recommendations for follow-up care.

## Source

- **Form**: Counter-Referral Form
- **Organisation**: World Health Organization (WHO)
- **URL**: <https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/ect/counter-referral-form.pdf?sfvrsn=d56d08c9_2>
- **Pages**: 1

## Structure

### For Completion by the Referral Facility

#### Patient Identification

| Field | Type |
| --- | --- |
| Patient name (LAST, First) | Text |
| Date of birth (day-month-year) | Date |
| Sex | Male / Female / Unknown |
| Patient contact information | Phone No |
| Patient's emergency contact person | Name + Contact information |

#### Facility Details

| Field | Type |
| --- | --- |
| Initiating facility (referred patient for care) | Name, Focal point, Phone No |
| Date and reason for referral | Free text |
| Acuity | Acute / Non-acute |
| Referral facility (received patient & provided referral care) | Name, Focal point, Phone No |
| Referral facility communication about patient care | Discussed follow-up care with primary care provider (checkbox) / Discussed follow-up care with initiating facility (checkbox) |
| Patient's primary care facility (if different from initiating facility) | Name, Focal point, Phone No |
| Time frame for primary care follow-up with patient | Urgent (within 24 hours) / 2-6 days / 1-2 weeks / > 2 weeks |

### Situation

| Field | Type |
| --- | --- |
| Chief complaint | Free text |
| Primary diagnosis | Free text |
| Pregnant? (circle) | Yes / No / Unknown |
| Treatments Initiated | Free text (procedures performed; detail any medications changes; consultations made with other specialists or health facilities) |
| ICU stay | Checkbox |
| Surgery | Checkbox |
| Hospitalized | Checkbox |

### Background

| Field | Type |
| --- | --- |
| Brief history of present illness | Free text |
| Relevant past medical history | Free text |
| Any other significant investigations results or important events | Free text (e.g. abnormal lab data, allergic reaction, cardiac arrest, other complications) |

### Assessment

| Field | Type |
| --- | --- |
| Final diagnoses/problem list (include social factors for consideration) | Free text |
| Prognosis and goals of care | Free text |
| Patient/family informed of diagnosis (circle) | Yes / No |
| Explain | Free text |

### Recommendations

| Field | Type |
| --- | --- |
| Next steps in follow-up plan | Free text (e.g. medications to stop or continue, instructions on wound management, palliative care) |
| Pending investigations results or further tests required | Free text |
| Follow up arrangements (when, where, with whom) | Free text |
| Instructions if patient's condition deteriorates | Free text |
| Contact name and information | Text |
| Status | Checkboxes: Cognitive impairment / Carer-dependent / Spinal precautions / Weight-bearing restrictions / Palliative care |

#### Referral Facility Provider

| Field | Type |
| --- | --- |
| Name | Text |
| Signature | Signature |

Note: Attach copy of medication chart at discharge or list of current medications (including additions, changes or deletion).

## Steps

| # | Step | Section |
| --- | --- | --- |
| 1 | Patient Identification | Patient name, DOB, sex, contacts |
| 2 | Facility Details | Initiating/referral/primary care facilities, communication, follow-up timeframe |
| 3 | Situation | Chief complaint, diagnosis, pregnancy, treatments, ICU/surgery/hospitalized |
| 4 | Background | History, past medical, significant investigation results/events |
| 5 | Assessment | Final diagnoses, prognosis, patient/family informed |
| 6 | Recommendations | Follow-up plan, pending investigations, deterioration instructions, status flags |
| 7 | Provider Sign-off | Referral facility provider signature |

## Directory structure

```
who-counter-referral-form/
  front-end-patient-form-with-svelte/     # Patient questionnaire
  front-end-clinician-dashboard-with-svelte/  # Clinician dashboard
  full-stack-with-rust-axum-loco-tera-htmx-alpine/    # Full-stack option
```

## Technology

See [root index.md](../index.md) for technology stacks.
