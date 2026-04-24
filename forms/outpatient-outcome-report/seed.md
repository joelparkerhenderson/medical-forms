# Outpatient outcome report

Outpatient outcome reports are data-driven assessments used to monitor, evaluate, and improve the quality of care provided to patients who do not require an overnight hospital stay. These reports generally analyze data related to clinical effectiveness, patient experience, and operational efficiency, such as the number of follow-up appointments,Did Not Attend (DNA) rates, and treatment results. 

Key components and uses of outpatient outcome reports include:
Patient-Reported Outcome Measures (PROMs): Standardized, validated questionnaires used to measure a patient’s health status, quality of life, and perceived level of impairment before and after treatment. 

Patient-Reported Experience Measures (PREMs): Data on patient satisfaction with their care. 

Clinical Outcomes: Data tracking the success of treatments, such as in gynecological, hysteroscopy, or chronic disease management. 

Operational Efficiency: Analysis of appointment types (e.g., virtual vs. in-person), reduction in follow-up visits, and waiting list times. 

Key Findings from Outpatient Reports (e.g., NHS/UK Context)
Reduced Follow-ups: The use of digital tools like Patient Initiated Follow-up (PIFU) and Remote Monitoring Services (OMS) can significantly reduce the need for in-person, routine follow-up appointments, saving costs and freeing up capacity. 

Data Quality Issues: Reports, such as those from NHS Digital, often highlight that while outpatient data (HES) has been collected for years, completeness of diagnosis or procedure fields can sometimes be an issue. 

Value-Based Care: Reports aim to move towards value-based healthcare, where the focus is on outcomes that matter to patients, rather than just the volume of activity. 
Barriers to Implementation: While PROMs are valuable, studies indicate that clinicians' use of this data is sometimes limited, often due to lack of time or lack of integration into standard care processes. 

Common Metrics Included
Attendance outcome (e.g., discharged, follow-up booked).
Time waited for appointment.
Number of telephone vs. in-person consultations.
Patient satisfaction scores. 

In the UK, these reports are often compiled from Hospital Episode Statistics (HES) and used by trusts to improve service delivery.

Scoring/grading instruments:

1. NHS Attendance Outcome + FFT — UK-canonical. Primary grade is the NHS Data Dictionary Attendance Outcome code (Attended, DNA, Cancelled-by-patient, Cancelled-by-provider, etc.) combined with the Friends and Family Test response (Very Good → Very Poor). Pragmatic, well-understood, matches seed's NHS/HES framing.
2. Composite PROM + PREM score — patient-centred. EQ-5D-5L for PROMs (health status before/after) plus a short PREM satisfaction scale, producing a numeric composite outcome grade (Improved / No change / Worsened, with satisfaction tier).
3. Four-domain outcome grade —  A derived grade per domain (clinical, PROM, PREM, operational) rolling up to an overall A-E letter grade, flagging any "red"  domain.

For the PROM dimension, which do you want?

1. EQ-5D-5L — gold-standard, 5 items (mobility, self-care, usual activities, pain, anxiety) + VAS 0–100. Requires a license note in the repo; item wording kept paraphrased.
2. Global Rating of Change (GRC) + self-rated health — unlicensed, public-domain. Two items: "Compared with before treatment, how is your condition now?" (7-point: much worse → much better) plus self-rated health (excellent → poor). Simple, validated, widely cited.
3. PROMIS Global Health Short Form (v1.2) — free, NIH-funded, 10 items, two subscales (Global Physical Health, Global Mental Health). No license fee, standard attribution.

Licensing note: EQ-5D-5L item wording will be paraphrased, not reproduced verbatim. A doc/licensing.md will note the EuroQol attribution requirement and link to the registration page.

