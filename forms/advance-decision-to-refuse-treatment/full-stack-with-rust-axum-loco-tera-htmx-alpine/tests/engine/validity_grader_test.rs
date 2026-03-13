use advance_decision_tera_crate::engine::validity_grader::calculate_validity;
use advance_decision_tera_crate::engine::validity_rules::all_rules;
use advance_decision_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

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
                specification: "I refuse CPR in all circumstances described above.".to_string(),
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
                specification: "I refuse artificial nutrition and hydration.".to_string(),
            },
            other_life_sustaining: vec![],
        },
        exceptions_conditions: ExceptionsConditions {
            has_exceptions: "yes".to_string(),
            exceptions_description: "Does not apply if realistic prospect of regaining capacity.".to_string(),
            has_time_limitations: "no".to_string(),
            time_limitations_description: String::new(),
            invalidating_conditions: String::new(),
        },
        other_wishes: OtherWishes {
            preferred_care_setting: "I wish to remain at home.".to_string(),
            comfort_measures: "Adequate pain relief.".to_string(),
            spiritual_religious_wishes: String::new(),
            other_preferences: String::new(),
        },
        lasting_power_of_attorney: LastingPowerOfAttorney {
            has_lpa: "yes".to_string(),
            lpa_type: "health-and-welfare".to_string(),
            lpa_registered: "yes".to_string(),
            lpa_registration_date: "2025-06-01".to_string(),
            donee_names: "Michael Smith (husband)".to_string(),
            relationship_between_adrt_and_lpa: "This ADRT takes precedence over the LPA for the specific treatments refused.".to_string(),
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
            life_sustaining_statement_text: "I confirm that my refusal applies even if my life is at risk.".to_string(),
            life_sustaining_signature: "yes".to_string(),
            life_sustaining_witness_signature: "yes".to_string(),
            life_sustaining_witness_name: "Dr Sarah Johnson".to_string(),
            life_sustaining_witness_address: "Central Hospital, London".to_string(),
        },
    }
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (status, fired_rules) = calculate_validity(&data);
    assert_eq!(status, "draft");
    assert!(fired_rules.len() > 0);
}

#[test]
fn returns_valid_for_fully_completed_adrt() {
    let data = create_valid_assessment();
    let (status, fired_rules) = calculate_validity(&data);
    assert_eq!(status, "valid");
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_invalid_when_life_sustaining_lacks_even_if_life_at_risk() {
    let mut data = create_valid_assessment();
    data.treatments_refused_life_sustaining.cpr.even_if_life_at_risk = String::new();
    let (status, fired_rules) = calculate_validity(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "VR-001"));
}

#[test]
fn returns_invalid_when_life_sustaining_lacks_witness_signature() {
    let mut data = create_valid_assessment();
    data.legal_signatures.life_sustaining_witness_signature = String::new();
    let (status, fired_rules) = calculate_validity(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "VR-006"));
}

#[test]
fn returns_invalid_when_life_sustaining_lacks_written_statement() {
    let mut data = create_valid_assessment();
    data.legal_signatures.life_sustaining_written_statement = String::new();
    let (status, fired_rules) = calculate_validity(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "VR-004"));
}

#[test]
fn returns_invalid_when_patient_has_not_signed() {
    let mut data = create_valid_assessment();
    data.legal_signatures.patient_signature = String::new();
    let (status, fired_rules) = calculate_validity(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "VR-007"));
}

#[test]
fn returns_invalid_when_capacity_not_confirmed() {
    let mut data = create_valid_assessment();
    data.capacity_declaration.confirms_capacity = String::new();
    let (status, _) = calculate_validity(&data);
    assert_eq!(status, "invalid");
}

#[test]
fn returns_complete_when_only_recommended_missing() {
    let mut data = create_valid_assessment();
    data.healthcare_professional_review.reviewed_by_clinician_name = String::new();
    data.healthcare_professional_review.review_date = String::new();
    data.personal_information.nhs_number = String::new();
    data.personal_information.gp_name = String::new();
    data.lasting_power_of_attorney.has_lpa = String::new();
    let (status, _) = calculate_validity(&data);
    assert_eq!(status, "complete");
}

#[test]
fn all_rule_ids_are_unique() {
    let rules = all_rules();
    let ids: Vec<&str> = rules.iter().map(|r| r.id).collect();
    let mut unique_ids = ids.clone();
    unique_ids.sort();
    unique_ids.dedup();
    assert_eq!(unique_ids.len(), ids.len());
}

#[test]
fn no_life_sustaining_rules_when_none_refused() {
    let mut data = create_valid_assessment();
    data.treatments_refused_life_sustaining.cpr.refused = "no".to_string();
    data.treatments_refused_life_sustaining.mechanical_ventilation.refused = "no".to_string();
    data.treatments_refused_life_sustaining.artificial_nutrition_hydration.refused = "no".to_string();
    // Clear life-sustaining signatures since not needed
    data.legal_signatures.life_sustaining_written_statement = String::new();
    data.legal_signatures.life_sustaining_signature = String::new();
    data.legal_signatures.life_sustaining_witness_signature = String::new();
    let (_, fired_rules) = calculate_validity(&data);
    let ls_rules: Vec<_> = fired_rules
        .iter()
        .filter(|r| r.category == "Life-Sustaining Treatment")
        .collect();
    assert_eq!(ls_rules.len(), 0);
}
