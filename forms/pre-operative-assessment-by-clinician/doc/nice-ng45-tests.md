# NICE NG45 — Routine Pre-operative Tests

NICE guideline NG45 (*Routine preoperative tests for elective surgery*, 2016)
sets out which tests to order by **ASA grade** and **surgical severity**.
This document is the data source for the "Investigations" hints rendered in
step 8 (renal/hepatic), step 9 (haematology), and step 10 (endocrine) of the
wizard.

## Surgical severity grades (NICE NG45)

| Grade | Examples |
| --- | --- |
| Minor | excision of skin lesion, drainage of breast abscess |
| Intermediate | primary repair of inguinal hernia, varicose veins, tonsillectomy, knee arthroscopy |
| Major | total abdominal hysterectomy, TURP, lumbar discectomy, thyroidectomy |
| Major+ | total joint replacement, lung operations, colonic resection, radical neck dissection |

## Test matrix (adult, elective)

Y = offer routinely; C = consider; — = do not offer routinely.

### Full Blood Count (FBC)

| ASA | Minor | Intermediate | Major | Major+ |
| --- | --- | --- | --- | --- |
| I | — | — | C | Y |
| II | — | C | Y | Y |
| III–IV | C | Y | Y | Y |

### Haemostasis tests (INR, APTT)

Offer for ASA III–IV with chronic liver disease or on anticoagulants;
consider for neuraxial anaesthesia. Do not offer routinely to ASA I / II.

### Kidney function (U&Es, creatinine, eGFR)

| ASA | Minor | Intermediate | Major | Major+ |
| --- | --- | --- | --- | --- |
| I | — | — | C | Y |
| II | — | C | Y | Y |
| III–IV | Y | Y | Y | Y |

### ECG

| ASA | Minor | Intermediate | Major | Major+ |
| --- | --- | --- | --- | --- |
| I | — | — | — | C |
| II | — | — | C | Y |
| III–IV (CV comorbidity) | C | Y | Y | Y |

Age ≥ 65 with no CV history: consider ECG for major+.

### Lung function / arterial blood gases

Not routinely. Consider in ASA III–IV for major / major+ surgery, or with
symptomatic respiratory disease. Senior anaesthetist should decide.

### Chest radiography

Do not offer routinely at any grade.

### Echocardiography

Do not offer routinely. Consider if: heart murmur of unknown cause with
cardiac symptoms, or signs or symptoms of heart failure. Requires specialist
request.

### HbA1c / glucose

Offer to all patients with known diabetes. Consider in high-risk groups
before major surgery.

### Pregnancy test

Offer to women of reproductive age before general anaesthesia, where
pregnancy would be clinically relevant to the procedure or anaesthesia.

### Sickle-cell screening

Offer to patients of high-risk ethnic groups who have not previously been
tested.

### Urinalysis

Do not offer routinely. Consider if urinary tract infection is suspected.

## Using this in the wizard

The hint panel beside each lab field in steps 8–10 shows a one-line "NICE
NG45 suggestion" based on the patient's **computed ASA grade** (step 16
derives live from entered data) and the **surgical severity** (step 2). This
is advisory only; the clinician remains responsible for the final decision.
