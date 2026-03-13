use consent_to_treatment_tera_crate::engine::consent_grader::calculate_consent;
use consent_to_treatment_tera_crate::engine::consent_rules::all_rules;
use consent_to_treatment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_valid_consent() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.address = "123 High Street, London".to_string();
    data.patient_information.contact_phone = "07700900000".to_string();

    // Procedure Details
    data.procedure_details.procedure_name = "Total Hip Replacement".to_string();
    data.procedure_details.procedure_type = "elective".to_string();
    data.procedure_details.procedure_description = "Replacement of the hip joint with a prosthetic implant".to_string();
    data.procedure_details.surgeon_name = "Mr J. Smith".to_string();
    data.procedure_details.surgeon_role = "consultant".to_string();
    data.procedure_details.planned_date = "2026-04-01".to_string();
    data.procedure_details.planned_location = "Theatre 3".to_string();
    data.procedure_details.anaesthesia_type = "general".to_string();
    data.procedure_details.estimated_duration = "1to2hours".to_string();
    data.procedure_details.laterality = "right".to_string();

    // Risks and Benefits
    data.risks_and_benefits.specific_risks = "Infection, dislocation, leg length discrepancy, nerve damage".to_string();
    data.risks_and_benefits.general_risks = "DVT, PE, anaesthetic complications, bleeding".to_string();
    data.risks_and_benefits.risk_of_no_treatment = "Continued pain and reduced mobility".to_string();
    data.risks_and_benefits.expected_benefits = "Improved mobility, reduced pain, better quality of life".to_string();
    data.risks_and_benefits.success_rate = "90-95%".to_string();
    data.risks_and_benefits.risks_explained_verbally = Some(5);
    data.risks_and_benefits.risks_understood = Some(5);
    data.risks_and_benefits.benefits_understood = Some(5);

    // Alternatives
    data.alternatives.alternative_treatments = "Conservative management, physiotherapy, pain medication, partial hip replacement".to_string();
    data.alternatives.no_treatment_option = "Continue with current symptoms, may worsen over time".to_string();
    data.alternatives.alternatives_explained = Some(5);
    data.alternatives.alternatives_understood = Some(5);
    data.alternatives.reason_for_chosen_treatment = "Patient wishes to improve mobility for quality of life".to_string();

    // Capacity Assessment
    data.capacity_assessment.patient_has_capacity = "yes".to_string();
    data.capacity_assessment.can_understand_information = Some(5);
    data.capacity_assessment.can_retain_information = Some(5);
    data.capacity_assessment.can_weigh_information = Some(5);
    data.capacity_assessment.can_communicate_decision = Some(5);
    data.capacity_assessment.capacity_assessed_by = "Dr A. Jones, Consultant".to_string();
    data.capacity_assessment.capacity_assessment_date = "2026-03-01".to_string();

    // Patient Understanding
    data.patient_understanding.can_explain_procedure = Some(5);
    data.patient_understanding.can_explain_risks = Some(5);
    data.patient_understanding.can_explain_alternatives = Some(5);
    data.patient_understanding.questions_answered_satisfactorily = Some(5);
    data.patient_understanding.information_leaflet_provided = "yes".to_string();
    data.patient_understanding.time_to_consider = "yes".to_string();
    data.patient_understanding.second_opinion_offered = "offered".to_string();

    // Additional Considerations
    data.additional_considerations.blood_product_consent = "consented".to_string();
    data.additional_considerations.photography_consent = "consented".to_string();
    data.additional_considerations.teaching_consent = "consented".to_string();

    // Interpreter Requirements
    data.interpreter_requirements.interpreter_needed = "no".to_string();
    data.interpreter_requirements.communication_aids_needed = "no".to_string();

    // Signatures
    data.signatures.patient_signature = "Jane Smith".to_string();
    data.signatures.patient_signature_date = "2026-03-09".to_string();
    data.signatures.consent_voluntary = "yes".to_string();
    data.signatures.right_to_withdraw_understood = "yes".to_string();
    data.signatures.witness_name = "Nurse Brown".to_string();
    data.signatures.witness_signature = "Nurse Brown".to_string();
    data.signatures.witness_signature_date = "2026-03-09".to_string();

    // Clinical Verification
    data.clinical_verification.clinician_name = "Mr J. Smith".to_string();
    data.clinical_verification.clinician_role = "consultant".to_string();
    data.clinical_verification.clinician_gmc_number = "1234567".to_string();
    data.clinical_verification.clinician_signature = "Mr J. Smith".to_string();
    data.clinical_verification.clinician_signature_date = "2026-03-09".to_string();
    data.clinical_verification.consent_confirmed_on_day = "yes".to_string();
    data.clinical_verification.patient_condition_changed = "no".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (status, score, fired_rules) = calculate_consent(&data);
    assert_eq!(status, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_valid_for_complete_consent() {
    let data = create_valid_consent();
    let (status, score, fired_rules) = calculate_consent(&data);
    assert_eq!(status, "valid");
    assert_eq!(score, 100.0);
    // Only low-concern positive rules should fire
    let high_medium: Vec<&FiredRule> = fired_rules
        .iter()
        .filter(|r| r.concern_level == "high" || r.concern_level == "medium")
        .collect();
    assert_eq!(high_medium.len(), 0);
}

#[test]
fn returns_invalid_when_capacity_not_confirmed() {
    let mut data = create_valid_consent();
    data.capacity_assessment.patient_has_capacity = "no".to_string();
    let (status, _score, fired_rules) = calculate_consent(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "CON-001"));
}

#[test]
fn returns_invalid_when_risks_not_explained() {
    let mut data = create_valid_consent();
    data.risks_and_benefits.specific_risks = "".to_string();
    data.risks_and_benefits.general_risks = "".to_string();
    let (status, _score, fired_rules) = calculate_consent(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "CON-002"));
}

#[test]
fn returns_invalid_when_procedure_not_identified() {
    let mut data = create_valid_consent();
    data.procedure_details.procedure_name = "".to_string();
    let (status, _score, fired_rules) = calculate_consent(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "CON-003"));
}

#[test]
fn returns_invalid_when_no_signature() {
    let mut data = create_valid_consent();
    data.signatures.patient_signature = "".to_string();
    let (status, _score, fired_rules) = calculate_consent(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "CON-004"));
}

#[test]
fn returns_invalid_when_patient_cannot_explain_procedure() {
    let mut data = create_valid_consent();
    data.patient_understanding.can_explain_procedure = Some(1);
    let (status, _score, fired_rules) = calculate_consent(&data);
    assert_eq!(status, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "CON-005"));
}

#[test]
fn fires_alternatives_not_discussed_rule() {
    let mut data = create_valid_consent();
    data.alternatives.alternative_treatments = "".to_string();
    let (_status, _score, fired_rules) = calculate_consent(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CON-006"));
}

#[test]
fn fires_positive_capacity_rule_for_high_scores() {
    let data = create_valid_consent();
    let (_status, _score, fired_rules) = calculate_consent(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CON-019"));
}

#[test]
fn fires_positive_understanding_rule_for_high_scores() {
    let data = create_valid_consent();
    let (_status, _score, fired_rules) = calculate_consent(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CON-020"));
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
fn returns_incomplete_when_consent_not_voluntary() {
    let mut data = create_valid_consent();
    data.signatures.consent_voluntary = "no".to_string();
    let (status, _score, fired_rules) = calculate_consent(&data);
    // CON-011 is medium concern, so status should be incomplete
    assert_eq!(status, "incomplete");
    assert!(fired_rules.iter().any(|r| r.id == "CON-011"));
}
