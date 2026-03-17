# WHO Prehospital Form

World Health Organization standardised prehospital clinical documentation form for emergency medical services (EMS).

## Source

- **Form**: WHO Prehospital Form (SCF Prehospital)
- **Organisation**: World Health Organization (WHO)
- **URL**: <https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/prehospital-scf.pdf?sfvrsn=53881340_2>
- **Pages**: 2
- **Reference**: Use with WHO Reference Card; see who.int/emergencycare

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./doc/ - Reference documentation
- ./front-end-patient-form-with-html/ - Form; HTML
- ./front-end-patient-form-with-svelte/ - Form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-html/ - Dashboard; HTML
- ./front-end-clinician-dashboard-with-svelte/ - Dashboard; SvelteKit + SVAR DataGrid
- ./full-stack-with-rust-axum-loco-tera-htmx-alpine/ - Full-stack option; Rust + Tera templates

## Form sections

- **Caller & Scene**: Caller info, patient ID, scene location/type, timestamps
- **Chief Complaint & Initial Vitals**: Complaint, injury flag, HR/RR/BP/Temp/RBS/SpO2, pregnancy, pain scale
- **High Risk Signs**: A/B (airway/breathing), C (circulation), D (disability), Other
- **Triage**: RED / YELLOW / GREEN
- **Primary Survey (ABCDE)**: Detailed assessment and interventions per system
- **SAMPLE History**: Signs, Allergies, Medications, Past medical/surgical, Last ate, Events
- **Injury Details**: Intent, mechanism, road traffic, safety equipment
- **Physical Exam**: 10 body systems (General, HEENT, Respiratory, Cardiac, Abdominal, Pelvis/GU, Neurologic, Psychiatric, MSK, Skin)
- **Additional Interventions**: Medications given, procedures performed
- **Assessment & Plan**: Summary, differential, presumptive diagnoses
- **Reassessment**: Up to 3 reassessment vital sign sets
- **Disposition**: Handover details, final vitals, provider signature

## Assessment steps (16 total)

1. Caller & Scene - caller info, patient ID, scene details, timestamps
2. Chief Complaint & Vitals - complaint, initial vital signs, pregnancy, pain
3. High Risk Signs - A/B, C, D, Other risk indicators
4. Triage - RED / YELLOW / GREEN category
5. Airway (A) - assessment and interventions
6. Breathing (B) - assessment and interventions
7. Circulation (C) - assessment and interventions
8. Disability (D) - neurological assessment and interventions
9. Exposure (E) - exposure assessment
10. SAMPLE History - signs, allergies, medications, past medical, last ate, events
11. Injury Details - intent, mechanism, road traffic, safety
12. Physical Exam - 10 body systems
13. Additional Interventions - medications and procedures
14. Assessment & Plan - summary, differential, diagnoses
15. Reassessment - up to 3 vital sign reassessments
16. Disposition - handover, final vitals, provider signature

## Vital signs captured

- HR (heart rate)
- RR (respiratory rate)
- BP (blood pressure)
- Temp (temperature)
- RBS (random blood sugar)
- SpO2 (oxygen saturation, % on)
- Pain (0-10 scale)

## GCS (Glasgow Coma Scale)

- E (Eye opening): 1-4
- V (Verbal response): 1-5
- M (Motor response): 1-6
- Total: 3-15

## Triage categories

- **RED**: Immediate/life-threatening
- **YELLOW**: Urgent
- **GREEN**: Non-urgent

## Key domain terms

- **ABCDE**: Airway, Breathing, Circulation, Disability, Exposure — primary survey framework
- **SAMPLE**: Signs/symptoms, Allergies, Medications, Past medical, Last ate, Events — history mnemonic
- **GCS**: Glasgow Coma Scale
- **AVPU**: Alert, Voice, Pain, Unresponsive — rapid consciousness assessment
- **OPA/NPA**: Oropharyngeal/Nasopharyngeal airway
- **ETT**: Endotracheal tube
- **LMA**: Laryngeal mask airway
- **BVM**: Bag-valve mask
- **BiPAP/CPAP**: Bi-level/Continuous positive airway pressure
- **JVD**: Jugular venous distension
- **IVF**: Intravenous fluid
- **NS/LR**: Normal saline / Lactated Ringer's
- **HEENT**: Head, Eyes, Ears, Nose, Throat
- **MSK**: Musculoskeletal
- **ROS**: Review of Systems

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
