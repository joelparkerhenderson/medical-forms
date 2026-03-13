use consent_to_treatment_tera_crate::engine::flagged_issues::detect_additional_flags;
use consent_to_treatment_tera_crate::engine::types::*;

fn create_valid_consent() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();

    data.procedure_details.procedure_name = "Total Hip Replacement".to_string();
    data.procedure_details.procedure_type = "elective".to_string();
    data.procedure_details.surgeon_name = "Mr J. Smith".to_string();
    data.procedure_details.anaesthesia_type = "general".to_string();

    data.risks_and_benefits.specific_risks = "Infection, dislocation".to_string();
    data.risks_and_benefits.general_risks = "DVT, PE".to_string();
    data.risks_and_benefits.expected_benefits = "Improved mobility".to_string();
    data.risks_and_benefits.risks_explained_verbally = Some(5);
    data.risks_and_benefits.risks_understood = Some(5);
    data.risks_and_benefits.benefits_understood = Some(5);

    data.alternatives.alternative_treatments = "Conservative management".to_string();
    data.alternatives.alternatives_explained = Some(5);
    data.alternatives.alternatives_understood = Some(5);

    data.capacity_assessment.patient_has_capacity = "yes".to_string();
    data.capacity_assessment.can_understand_information = Some(5);
    data.capacity_assessment.can_retain_information = Some(5);
    data.capacity_assessment.can_weigh_information = Some(5);
    data.capacity_assessment.can_communicate_decision = Some(5);
    data.capacity_assessment.capacity_assessed_by = "Dr Jones".to_string();

    data.patient_understanding.can_explain_procedure = Some(5);
    data.patient_understanding.can_explain_risks = Some(5);
    data.patient_understanding.can_explain_alternatives = Some(5);
    data.patient_understanding.questions_answered_satisfactorily = Some(5);
    data.patient_understanding.information_leaflet_provided = "yes".to_string();
    data.patient_understanding.second_opinion_offered = "offered".to_string();

    data.additional_considerations.blood_product_consent = "consented".to_string();
    data.additional_considerations.photography_consent = "consented".to_string();
    data.additional_considerations.teaching_consent = "consented".to_string();

    data.interpreter_requirements.interpreter_needed = "no".to_string();
    data.interpreter_requirements.communication_aids_needed = "no".to_string();

    data.signatures.patient_signature = "Jane Smith".to_string();
    data.signatures.patient_signature_date = "2026-03-09".to_string();
    data.signatures.consent_voluntary = "yes".to_string();
    data.signatures.right_to_withdraw_understood = "yes".to_string();

    data.clinical_verification.clinician_name = "Mr J. Smith".to_string();
    data.clinical_verification.clinician_signature = "Mr J. Smith".to_string();
    data.clinical_verification.clinician_signature_date = "2026-03-09".to_string();
    data.clinical_verification.patient_condition_changed = "no".to_string();

    data
}

#[test]
fn no_flags_for_valid_consent() {
    let data = create_valid_consent();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_capacity_concerns() {
    let mut data = create_valid_consent();
    data.capacity_assessment.patient_has_capacity = "uncertain".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CAP-001"));
}

#[test]
fn flags_low_capacity_items() {
    let mut data = create_valid_consent();
    data.capacity_assessment.can_understand_information = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CAP-002"));
}

#[test]
fn flags_interpreter_needed() {
    let mut data = create_valid_consent();
    data.interpreter_requirements.interpreter_needed = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-INT-001"));
}

#[test]
fn flags_second_opinion_requested() {
    let mut data = create_valid_consent();
    data.patient_understanding.second_opinion_offered = "requested".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-OPN-001"));
}

#[test]
fn flags_blood_product_refusal() {
    let mut data = create_valid_consent();
    data.additional_considerations.blood_product_consent = "refused".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BLD-001"));
}

#[test]
fn flags_emergency_consent() {
    let mut data = create_valid_consent();
    data.procedure_details.procedure_type = "emergency".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-EMG-001"));
}

#[test]
fn flags_minor_consent() {
    let mut data = create_valid_consent();
    data.signatures.parent_guardian_name = "Mrs Smith".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MIN-001"));
}

#[test]
fn flags_advance_directive() {
    let mut data = create_valid_consent();
    data.additional_considerations.advance_directive_exists = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ADV-001"));
}

#[test]
fn flags_condition_changed() {
    let mut data = create_valid_consent();
    data.clinical_verification.patient_condition_changed = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CHG-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_valid_consent();
    // Create flags of different priorities
    data.capacity_assessment.patient_has_capacity = "uncertain".to_string(); // high
    data.additional_considerations.advance_directive_exists = "yes".to_string(); // medium
    data.additional_considerations.photography_consent = "refused".to_string(); // low
    data.additional_considerations.teaching_consent = "refused".to_string(); // low

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
