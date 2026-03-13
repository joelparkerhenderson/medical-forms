use advance_decision_tera_crate::engine::flagged_issues::detect_additional_flags;
use advance_decision_tera_crate::engine::types::*;

fn create_valid_assessment() -> AssessmentData {
    AssessmentData {
        personal_information: PersonalInformation {
            full_legal_name: "Jane Smith".to_string(),
            date_of_birth: "1960-05-15".to_string(),
            nhs_number: "943 476 5919".to_string(),
            address: "10 Downing Street, London".to_string(),
            postcode: "SW1A 2AA".to_string(),
            telephone: "020 7946 0958".to_string(),
            email: "jane.smith@example.com".to_string(),
            gp_name: "Dr Robert Brown".to_string(),
            gp_practice: "Central Surgery".to_string(),
            gp_address: "1 High Street, London".to_string(),
            gp_telephone: "020 7946 0000".to_string(),
        },
        capacity_declaration: CapacityDeclaration {
            confirms_capacity: "yes".to_string(),
            understands_consequences: "yes".to_string(),
            no_undue_influence: "yes".to_string(),
            professional_capacity_assessment: "yes".to_string(),
            assessed_by_name: "Dr Sarah Johnson".to_string(),
            assessed_by_role: "Consultant Psychiatrist".to_string(),
            assessment_date: "2026-01-15".to_string(),
            assessment_details: "Patient demonstrates full understanding.".to_string(),
        },
        circumstances: Circumstances {
            specific_circumstances: "In the event of advanced dementia.".to_string(),
            medical_conditions: "Early-stage Alzheimer's disease.".to_string(),
            situations_description: "When unable to make decisions.".to_string(),
        },
        treatments_refused_general: TreatmentsRefusedGeneral {
            antibiotics: TreatmentRefusal {
                treatment: "Antibiotics".to_string(),
                refused: "yes".to_string(),
                specification: "Only for life-threatening infections.".to_string(),
            },
            blood_transfusion: TreatmentRefusal {
                treatment: "Blood Transfusion".to_string(),
                refused: "no".to_string(),
                specification: String::new(),
            },
            iv_fluids: TreatmentRefusal {
                treatment: "IV Fluids".to_string(),
                refused: "no".to_string(),
                specification: String::new(),
            },
            tube_feeding: TreatmentRefusal {
                treatment: "Tube Feeding".to_string(),
                refused: "yes".to_string(),
                specification: "Refuse all forms of tube feeding.".to_string(),
            },
            dialysis: TreatmentRefusal {
                treatment: "Dialysis".to_string(),
                refused: "no".to_string(),
                specification: String::new(),
            },
            ventilation: TreatmentRefusal {
                treatment: "Ventilation".to_string(),
                refused: "no".to_string(),
                specification: String::new(),
            },
            other_treatments: vec![],
        },
        treatments_refused_life_sustaining: TreatmentsRefusedLifeSustaining {
            cpr: LifeSustainingRefusal {
                treatment: "CPR".to_string(),
                refused: "yes".to_string(),
                even_if_life_at_risk: "yes".to_string(),
                specification: "I refuse CPR.".to_string(),
            },
            mechanical_ventilation: LifeSustainingRefusal {
                treatment: "Mechanical Ventilation".to_string(),
                refused: "yes".to_string(),
                even_if_life_at_risk: "yes".to_string(),
                specification: "I refuse mechanical ventilation.".to_string(),
            },
            artificial_nutrition_hydration: LifeSustainingRefusal {
                treatment: "Artificial Nutrition/Hydration".to_string(),
                refused: "yes".to_string(),
                even_if_life_at_risk: "yes".to_string(),
                specification: "I refuse artificial nutrition.".to_string(),
            },
            other_life_sustaining: vec![],
        },
        exceptions_conditions: ExceptionsConditions {
            has_exceptions: "yes".to_string(),
            exceptions_description: "Does not apply if prospect of regaining capacity.".to_string(),
            has_time_limitations: "no".to_string(),
            time_limitations_description: String::new(),
            invalidating_conditions: String::new(),
        },
        other_wishes: OtherWishes {
            preferred_care_setting: "Home".to_string(),
            comfort_measures: "Pain relief.".to_string(),
            spiritual_religious_wishes: String::new(),
            other_preferences: String::new(),
        },
        lasting_power_of_attorney: LastingPowerOfAttorney {
            has_lpa: "yes".to_string(),
            lpa_type: "health-and-welfare".to_string(),
            lpa_registered: "yes".to_string(),
            lpa_registration_date: "2025-06-01".to_string(),
            donee_names: "Michael Smith".to_string(),
            relationship_between_adrt_and_lpa: "ADRT takes precedence for specific treatments.".to_string(),
        },
        healthcare_professional_review: HealthcareProfessionalReview {
            reviewed_by_clinician_name: "Dr Sarah Johnson".to_string(),
            reviewed_by_clinician_role: "Consultant Psychiatrist".to_string(),
            review_date: "2026-01-20".to_string(),
            clinical_opinion_on_capacity: "Patient has full mental capacity.".to_string(),
            any_concerns: "no".to_string(),
            concerns_details: String::new(),
        },
        legal_signatures: LegalSignatures {
            patient_signature: "yes".to_string(),
            patient_statement_of_understanding: "yes".to_string(),
            patient_signature_date: "2026-01-20".to_string(),
            witness_signature: "yes".to_string(),
            witness_name: "Dr Sarah Johnson".to_string(),
            witness_address: "Central Hospital, London".to_string(),
            witness_signature_date: "2026-01-20".to_string(),
            life_sustaining_written_statement: "yes".to_string(),
            life_sustaining_statement_text: "My refusal applies even if life is at risk.".to_string(),
            life_sustaining_signature: "yes".to_string(),
            life_sustaining_witness_signature: "yes".to_string(),
            life_sustaining_witness_name: "Dr Sarah Johnson".to_string(),
            life_sustaining_witness_address: "Central Hospital, London".to_string(),
        },
    }
}

#[test]
fn returns_flags_for_empty_assessment() {
    let data = AssessmentData::default();
    let flags = detect_additional_flags(&data);
    assert!(flags.len() > 0);
}

#[test]
fn flags_life_sustaining_without_witness() {
    let mut data = create_valid_assessment();
    data.legal_signatures.life_sustaining_witness_signature = String::new();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LS-001"));
}

#[test]
fn flags_missing_written_statement() {
    let mut data = create_valid_assessment();
    data.legal_signatures.life_sustaining_written_statement = String::new();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LS-002"));
}

#[test]
fn flags_unsigned_document() {
    let mut data = create_valid_assessment();
    data.legal_signatures.patient_signature = String::new();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SIG-001"));
}

#[test]
fn flags_lpa_conflict() {
    let mut data = create_valid_assessment();
    data.lasting_power_of_attorney.relationship_between_adrt_and_lpa = String::new();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LPA-001"));
}

#[test]
fn flags_no_capacity_assessment() {
    let mut data = create_valid_assessment();
    data.capacity_declaration.confirms_capacity = String::new();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CAP-001"));
}

#[test]
fn flags_clinician_concerns() {
    let mut data = create_valid_assessment();
    data.healthcare_professional_review.any_concerns = "yes".to_string();
    data.healthcare_professional_review.concerns_details = "Patient may be under pressure".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-REV-002"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_valid_assessment();
    data.legal_signatures.life_sustaining_witness_signature = String::new();
    data.healthcare_professional_review.review_date = String::new();
    data.personal_information.gp_name = String::new();
    let flags = detect_additional_flags(&data);
    let priorities: Vec<&str> = flags.iter().map(|f| f.priority.as_str()).collect();
    let mut sorted = priorities.clone();
    sorted.sort_by_key(|p| match *p {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });
    assert_eq!(priorities, sorted);
}
