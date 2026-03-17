# WHO Emergency First Aid Form

World Health Organization standardised emergency first aid documentation form for community first aid responders (CFAR).

## Source

- **Form**: Emergency First Aid Form
- **Organisation**: World Health Organization (WHO)
- **URL**: <https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/emergency-first-aid-form.pdf?sfvrsn=fd38f178_1>
- **Pages**: 1

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

- **Patient Identification**: Name, DOB, age, sex, contacts
- **Referral & Transport**: Facility details, ambulance details, event/departure times
- **Situation**: Medical vs Trauma, pregnancy status, narrative
- **Background**: Past medical/surgical history, medications, allergies
- **CABCDE Assessment & Intervention**: Systematic assessment with paired interventions
- **Recommendations**: Transport plan, precautions, concerns
- **Community First Aid Responder**: Name, signature, contact, organisation

## Assessment steps (12 total)

1. Patient Identification - name, DOB, age, sex, contact
2. Referral & Transport - facility, ambulance, times
3. Situation - problem type, pregnancy, narrative
4. Background - history, medications, allergies
5. Major Bleeding (C) - haemorrhage assessment and intervention
6. Airway (A) - airway assessment and intervention
7. Breathing (B) - breathing assessment and intervention
8. Circulation (C) - circulation assessment and intervention
9. Disability (D) - neurological assessment and intervention
10. Exposure/Other (E) - exposure assessment and intervention
11. Recommendations - transport, precautions, concerns
12. Responder Details - CFAR identification

## CABCDE framework

Each category has:
- **Assessment**: Free text findings or "Normal" checkbox
- **Intervention**: Checkboxes for specific actions or "None"

### Interventions by category

- **C (Major Bleeding)**: Direct Pressure, Deep Wound Packing, Tourniquet (life-threatening only), Uterine Massage
- **A (Airway)**: Neck Immobilization, Head-Tilt Chin-Lift, Jaw Thrust, Choking Care
- **B (Breathing)**: Maintained position of patient comfort
- **C (Circulation)**: Pelvic Binder, Control minor bleeding, Fracture Care, Oral Hydration, Left-lateral position
- **D (Disability)**: Spinal Immobilisation, Glucose Given, Seizure Care, High/Low Temperature Care
- **E (Exposure/Other)**: Recovery Position, Burn Care, Wound Care, Drowning Care, Snakebite Care

## Precaution flags

- Highly infectious disease
- Spinal immobilization
- Possible fracture
- Fall risk
- Altered mental status

## Key domain terms

- **CABCDE**: Catastrophic bleeding, Airway, Breathing, Circulation, Disability, Exposure — systematic assessment approach
- **CFAR**: Community First Aid Responder
- **Tourniquet**: Only applied for life-threatening bleeding; time of application must be recorded
- **Left-lateral position**: Lying on left side to improve circulation

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
