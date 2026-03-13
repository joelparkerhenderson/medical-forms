Casualty Card Form Implementation Plan

Specification Driven Development

Research

- domain:cdn.who.int
- domain:hsc.unm.edu
- domain:www.saem.org
- domain:www.realfirstaid.co.uk
- domain:theprsb.org
- domain:pmc.ncbi.nlm.nih.gov
- domain:codimg.com
- domain:www.triagenet.net

Context

The casualty card form is a clinical document used in Emergency Departments (ED) and Minor Injury Units (MIU). It captures patient information from arrival through triage, assessment, treatment, and
disposition.

The form includes NEWS2 auto-calculation (National Early Warning Score 2) from vital signs as the scoring engine, analogous to the ASA grading in the pre-op form.

Step 1: Patient Demographics

- firstName, lastName, dateOfBirth, sex, nhsNumber, address, postcode, phone, email, ethnicity, preferredLanguage, interpreterRequired

Step 2: Next of Kin & GP

- nextOfKin: name, relationship, phone, notified
- gp: name, practiceName, practiceAddress, practicePhone

Step 3: Arrival & Triage

- attendanceDate, arrivalTime, attendanceCategory (first/follow-up/planned/unplanned)
- arrivalMode (ambulance/walk-in/helicopter/police/other)
- referralSource (self/gp/999/nhs111/other-hospital/police/other)
- ambulanceIncidentNumber
- triageTime, triageNurse
- mtsFlowchart (select from common flowcharts)
- mtsCategory (1-immediate/2-very-urgent/3-urgent/4-standard/5-non-urgent)
- mtsDiscriminator

Step 4: Presenting Complaint

- chiefComplaint, historyOfPresentingComplaint
- onset, duration, character, severity, location, radiation
- aggravatingFactors, relievingFactors, associatedSymptoms
- previousEpisodes, treatmentPriorToArrival

Step 5: Pain Assessment

- painPresent (yes/no)
- painScore (0-10 NRS)
- painLocation, painCharacter
- painOnset, painSeverityCategory (mild/moderate/severe)

Step 6: Medical History

- pastMedicalHistory, pastSurgicalHistory
- medications[] (name, dose, frequency)
- allergies[] (allergen, reaction, severity)
- tetanusStatus
- smokingStatus, alcoholConsumption, recreationalDrugUse
- lastOralIntake

Step 7: Vital Signs

- heartRate, systolicBP, diastolicBP, respiratoryRate
- oxygenSaturation, supplementalOxygen (yes/no), oxygenFlowRate
- temperature, bloodGlucose
- consciousnessLevel (alert/verbal/pain/unresponsive)
- pupilLeftSize, pupilLeftReactive, pupilRightSize, pupilRightReactive
- capillaryRefillTime, weight
- NEWS2 score (auto-calculated from HR, BP, RR, SpO2, temp, consciousness, supplemental O2)

Step 8: Primary Survey (ABCDE)

- airway: status (patent/compromised/obstructed), adjuncts, cSpineImmobilised
- breathing: effort (normal/laboured/shallow/absent), chestMovement, breathSounds, tracheaPosition
- circulation: pulseCharacter, skinColour, skinTemperature, capillaryRefill, haemorrhage, ivAccess
- disability: gcsEye (1-4), gcsVerbal (1-5), gcsMotor (1-6), gcsTotal (auto-calc), pupils, bloodGlucose, limbMovements
- exposure: skinExamination, injuriesIdentified, logRollFindings

Step 9: Clinical Examination

- generalAppearance
- headAndFace, neck, chestCardiovascular, chestRespiratory
- abdomen, pelvis, musculoskeletalLimbs, neurological, skin
- mentalState, bodyDiagramNotes

Step 10: Investigations

- bloodTests[] (selected from: FBC, U&E, LFTs, CRP, coagulation, troponin, etc.)
- urinalysis (dipstick results, pregnancy test)
- imaging[] (type, site, findings)
- ecg (performed yes/no, findings)
- otherInvestigations

Step 11: Treatment & Interventions

- medicationsAdministered[] (drug, dose, route, time, givenBy)
- fluidTherapy[] (type, volume, rate, timeStarted)
- procedures[] (description, time)
- oxygenTherapy (device, flowRate)
- tetanusProphylaxis (given/not-indicated/status-checked)

Step 12: Assessment & Plan

- workingDiagnosis, differentialDiagnoses
- clinicalImpression, riskStratification

Step 13: Disposition

- disposition (admitted/discharged/transferred/left-before-seen/self-discharged)
- If admitted: admittingSpecialty, admittingConsultant, ward, levelOfCare
- If discharged: dischargeDiagnosis, dischargeMedications, dischargeInstructions, followUp, returnPrecautions
- If transferred: receivingHospital, reasonForTransfer, modeOfTransfer
- dischargeTime, totalTimeInDepartment

Step 14: Safeguarding & Consent

- safeguardingConcern (yes/no), safeguardingType, referralMade
- mentalCapacityAssessment, mentalHealthActStatus
- consentForTreatment (verbal/written/lacks-capacity)
- completedBy (name, role, gmcNumber), seniorReviewingClinician

Engine: NEWS2 Calculator

The NEWS2 scoring system evaluates 7 parameters and produces a score 0-20:

Parameter Score 3 Score 2 Score 1 Score 0 Score 1 Score 2 Score 3
RR <=8 9-11 12-20 21-24 >=25
SpO2 Scale 1 <=91 92-93 94-95 >=96
Systolic BP <=90 91-100 101-110 111-219 >=220
Pulse <=40 41-50 51-90 91-110 111-130 >=131
Consciousness Alert CVPU
Temperature <=35.0 35.1-36.0 36.1-38.0 38.1-39.0 >=39.1
Supplemental O2 Yes=2 No=0

Clinical response thresholds:

- Low (0-4): Routine monitoring
- Low-Medium (3 in any single parameter): Urgent ward review
- Medium (5-6): Urgent review
- High (>=7): Emergency assessment by critical care

Engine: Flagged Issues

Safety alerts for clinical review:

- NEWS2 >= 7 (critical)
- Any single NEWS2 parameter scoring 3
- Safeguarding concerns
- Allergies with anaphylaxis history
- Anticoagulant use
- GCS <= 8 (unconscious patient)
- Abnormal pupil reactivity
- Active haemorrhage
- Compromised/obstructed airway
- Pregnancy
- Mental Health Act section
