# WHO Counter-Referral Form

World Health Organization standardised counter-referral form for discharging patients back to primary care.

## Source

- **Form**: Counter-Referral Form
- **Organisation**: World Health Organization (WHO)
- **URL**: <https://cdn.who.int/media/docs/default-source/integrated-health-services-(ihs)/csy/ect/counter-referral-form.pdf?sfvrsn=d56d08c9_2>
- **Pages**: 1

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./doc/ - Reference documentation

## Form sections (SBAR framework)

- **Patient Identification**: Name, DOB, sex, contacts
- **Facility Details**: Initiating facility, referral facility, primary care facility, communication, follow-up timeframe
- **Situation**: Chief complaint, primary diagnosis, pregnancy, treatments initiated (ICU/surgery/hospitalized flags)
- **Background**: History of present illness, past medical history, significant investigations/events
- **Assessment**: Final diagnoses/problem list, prognosis, goals of care, patient/family informed
- **Recommendations**: Follow-up plan, pending investigations, follow-up arrangements, deterioration instructions, status flags
- **Provider Sign-off**: Referral facility provider name + signature

## Assessment steps (7 total)

1. Patient Identification - name, DOB, sex, contacts
2. Facility Details - initiating/referral/primary care facilities, communication, follow-up timeframe
3. Situation - complaint, diagnosis, pregnancy, treatments, ICU/surgery/hospitalized
4. Background - history, past medical, significant events
5. Assessment - final diagnoses, prognosis, patient/family informed
6. Recommendations - follow-up plan, pending investigations, deterioration instructions
7. Provider Sign-off - referral facility provider signature

## Follow-up timeframes

- Urgent (within 24 hours)
- 2-6 days
- 1-2 weeks
- > 2 weeks

## Status flags

- Cognitive impairment
- Carer-dependent
- Spinal precautions
- Weight-bearing restrictions
- Palliative care

## Relationship to Acute Referral Form

The Counter-Referral Form is the return complement to the Acute Referral Form:
- **Acute Referral**: Initiating facility -> Referral facility (patient transfer up)
- **Counter-Referral**: Referral facility -> Primary care facility (patient discharge back)

## Key domain terms

- **SBAR**: Situation, Background, Assessment, Recommendations
- **Counter-referral**: Return of patient from referral facility back to primary/initiating care
- **Initiating facility**: Original facility that referred the patient
- **Referral facility**: Facility that received and treated the patient
- **Primary care facility**: Patient's ongoing care provider (may differ from initiating facility)

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
