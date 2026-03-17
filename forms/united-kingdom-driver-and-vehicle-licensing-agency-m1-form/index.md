# United Kingdom Driver and Vehicle Licensing Agency M1 Form

Confidential medical information — mental health conditions for driving fitness assessment.

The DVLA M1 form is used by car drivers and motorcyclists in the United Kingdom to report certain types of mental health conditions to the Driver and Vehicle Licensing Agency (DVLA). It collects personal details, healthcare professional information, and a mental health questionnaire covering diagnoses of anxiety, depression, bipolar disorder, eating disorders, OCD, PTSD, personality disorders, schizophrenia, psychosis, and other mental health conditions.

## Source

- **Form**: M1 — Confidential medical information (mental health)
- **Agency**: Driver & Vehicle Licensing Agency (DVLA), United Kingdom
- **URL**: <https://assets.publishing.service.gov.uk/media/67ed101ae9c76fa33048c63c/m1-online-confidential-medical-information-accessible.odt>

## Structure

The form has three main parts plus a return information page:

### Part A: About You

Current driving licence details and change of details.

| Field | Type |
| --- | --- |
| Title | Text |
| Full name | Text |
| Date of birth | Date |
| Address | Text (multi-line) |
| Postcode | Text |
| Email | Text |
| Contact number | Text |
| Change of details | Text (multi-line, optional) |

### Part B: Healthcare Professional for Your Condition

#### GP Details

| Field | Type |
| --- | --- |
| GP name | Text |
| Surgery name | Text |
| Address | Text (multi-line) |
| Town | Text |
| Postcode | Text |
| Contact number | Text |
| Email (if known) | Text |
| Date last seen for this condition | Date (DD/MM/YYYY) |

#### Consultant Details

| Field | Type |
| --- | --- |
| Consultant name | Text |
| Speciality | Text |
| Department | Text |
| Hospital name | Text |
| Address | Text (multi-line) |
| Town | Text |
| Postcode | Text |
| Contact number | Text |
| Email (if known) | Text |
| Date last seen for this condition | Date (DD/MM/YYYY) |

### Medical Questionnaire — Mental Health

#### Question 1: Diagnosis Confirmation

Have you been diagnosed with a mental health condition?

- Yes / No
- If No, DO NOT complete the rest of the form.

#### Question 2: Mental Health Condition Diagnosis

Please confirm what mental health condition you have been diagnosed with (Yes/No for each):

- Anxiety or depression (without any impairment of concentration, memory or agitation)
- Anxiety or depression (with suicidal thoughts or impairment in concentration, memory or agitation)
- Bipolar affective disorder
- Eating disorder (anorexia nervosa, bulimia)
- Obsessive compulsive disorder or post-traumatic stress disorder
- Personality disorder (any type)
- Schizophrenia or psychosis or delusional disorder or schizoaffective disorder
- Other (please specify) — free text

#### Question 3: Recent Contact with Healthcare Professional

Have you had any contact (any phone, video or face to face consultation) with your healthcare professional about your mental health condition in the last 12 months?

- Yes / No
- If Yes, supply last date of any contact:
  - Doctor: Date (DD/MM/YY)
  - Consultant: Date (DD/MM/YY)
  - Community psychiatric nurse: Date (DD/MM/YY)

### Applicant's Authorisation

Same structure as other DVLA forms:

- Declaration authorising medical information disclosure
- Criminal offence warning for false declarations
- Name, Signature, Date
- Electronic correspondence consent (email): Yes / No
- Contact preference from DVLA: Email / SMS (Text)
- Contact preference from healthcare professional on behalf of DVLA: Email / SMS (Text)

### Return Information

- **By Post**: Drivers Medical Group, DVLA, Swansea, SA99 1DF
- **By Email**: eftd@dvla.gov.uk

## Steps

| # | Step | Section |
| --- | --- | --- |
| 1 | Personal Details | Part A — current driving licence details and change of details |
| 2 | Healthcare Professionals | Part B — GP details and consultant details |
| 3 | Diagnosis Confirmation | Q1 — has a mental health condition been diagnosed |
| 4 | Mental Health Conditions | Q2 — specific conditions diagnosed |
| 5 | Recent Contact | Q3 — recent healthcare professional contact |
| 6 | Authorisation | Applicant's authorisation and declaration |

## Directory structure

```
united-kingdom-driver-and-vehicle-licensing-agency-m1-form/
  front-end-patient-form-with-svelte/     # Patient questionnaire
  front-end-clinician-dashboard-with-svelte/  # Clinician dashboard
  full-stack-with-rust-axum-loco-tera-htmx-alpine/    # Full-stack option
```

## Technology

See [root index.md](../index.md) for technology stacks.
