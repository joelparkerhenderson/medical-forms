use super::types::AssessmentData;

/// Returns a human-readable label for a consent status.
pub fn consent_status_label(status: &str) -> &str {
    match status {
        "valid" => "Valid",
        "invalid" => "Invalid",
        "complete" => "Complete",
        "incomplete" => "Incomplete",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Check if a required text field is filled (non-empty after trimming).
pub fn field_filled(value: &str) -> bool {
    !value.trim().is_empty()
}

/// Check if a required rating field is answered.
pub fn rating_filled(value: Option<u8>) -> bool {
    value.is_some()
}

/// Count total required fields in the consent form.
pub fn count_required_fields() -> usize {
    // Patient Information: patient_name, date_of_birth (2)
    // Procedure Details: procedure_name, procedure_type, surgeon_name, anaesthesia_type (4)
    // Risks and Benefits: specific_risks, general_risks, expected_benefits, risks_explained_verbally, risks_understood, benefits_understood (6)
    // Alternatives: alternative_treatments, alternatives_explained, alternatives_understood (3)
    // Capacity Assessment: patient_has_capacity, can_understand_information, can_retain_information, can_weigh_information, can_communicate_decision, capacity_assessed_by (6)
    // Patient Understanding: can_explain_procedure, can_explain_risks, can_explain_alternatives, questions_answered_satisfactorily (4)
    // Signatures: patient_signature, patient_signature_date, consent_voluntary, right_to_withdraw_understood (4)
    // Clinical Verification: clinician_name, clinician_signature, clinician_signature_date (3)
    32
}

/// Count how many required fields are filled.
pub fn count_completed_fields(data: &AssessmentData) -> usize {
    let mut count = 0;

    // Patient Information
    if field_filled(&data.patient_information.patient_name) { count += 1; }
    if field_filled(&data.patient_information.date_of_birth) { count += 1; }

    // Procedure Details
    if field_filled(&data.procedure_details.procedure_name) { count += 1; }
    if field_filled(&data.procedure_details.procedure_type) { count += 1; }
    if field_filled(&data.procedure_details.surgeon_name) { count += 1; }
    if field_filled(&data.procedure_details.anaesthesia_type) { count += 1; }

    // Risks and Benefits
    if field_filled(&data.risks_and_benefits.specific_risks) { count += 1; }
    if field_filled(&data.risks_and_benefits.general_risks) { count += 1; }
    if field_filled(&data.risks_and_benefits.expected_benefits) { count += 1; }
    if rating_filled(data.risks_and_benefits.risks_explained_verbally) { count += 1; }
    if rating_filled(data.risks_and_benefits.risks_understood) { count += 1; }
    if rating_filled(data.risks_and_benefits.benefits_understood) { count += 1; }

    // Alternatives
    if field_filled(&data.alternatives.alternative_treatments) { count += 1; }
    if rating_filled(data.alternatives.alternatives_explained) { count += 1; }
    if rating_filled(data.alternatives.alternatives_understood) { count += 1; }

    // Capacity Assessment
    if field_filled(&data.capacity_assessment.patient_has_capacity) { count += 1; }
    if rating_filled(data.capacity_assessment.can_understand_information) { count += 1; }
    if rating_filled(data.capacity_assessment.can_retain_information) { count += 1; }
    if rating_filled(data.capacity_assessment.can_weigh_information) { count += 1; }
    if rating_filled(data.capacity_assessment.can_communicate_decision) { count += 1; }
    if field_filled(&data.capacity_assessment.capacity_assessed_by) { count += 1; }

    // Patient Understanding
    if rating_filled(data.patient_understanding.can_explain_procedure) { count += 1; }
    if rating_filled(data.patient_understanding.can_explain_risks) { count += 1; }
    if rating_filled(data.patient_understanding.can_explain_alternatives) { count += 1; }
    if rating_filled(data.patient_understanding.questions_answered_satisfactorily) { count += 1; }

    // Signatures
    if field_filled(&data.signatures.patient_signature) { count += 1; }
    if field_filled(&data.signatures.patient_signature_date) { count += 1; }
    if field_filled(&data.signatures.consent_voluntary) { count += 1; }
    if field_filled(&data.signatures.right_to_withdraw_understood) { count += 1; }

    // Clinical Verification
    if field_filled(&data.clinical_verification.clinician_name) { count += 1; }
    if field_filled(&data.clinical_verification.clinician_signature) { count += 1; }
    if field_filled(&data.clinical_verification.clinician_signature_date) { count += 1; }

    count
}

/// Calculate the completeness score (0-100) based on required fields.
pub fn calculate_completeness_score(data: &AssessmentData) -> f64 {
    let completed = count_completed_fields(data) as f64;
    let total = count_required_fields() as f64;
    ((completed / total) * 100.0).round()
}

/// Collect all rated items (1-5 scale) from the assessment data.
pub fn collect_rated_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Risks and Benefits
        data.risks_and_benefits.risks_explained_verbally,
        data.risks_and_benefits.risks_understood,
        data.risks_and_benefits.benefits_understood,
        // Alternatives
        data.alternatives.alternatives_explained,
        data.alternatives.alternatives_understood,
        // Capacity Assessment
        data.capacity_assessment.can_understand_information,
        data.capacity_assessment.can_retain_information,
        data.capacity_assessment.can_weigh_information,
        data.capacity_assessment.can_communicate_decision,
        // Patient Understanding
        data.patient_understanding.can_explain_procedure,
        data.patient_understanding.can_explain_risks,
        data.patient_understanding.can_explain_alternatives,
        data.patient_understanding.questions_answered_satisfactorily,
    ]
}

/// Calculate the average capacity score from the 4 capacity items.
pub fn capacity_score(data: &AssessmentData) -> Option<f64> {
    let items = [
        data.capacity_assessment.can_understand_information,
        data.capacity_assessment.can_retain_information,
        data.capacity_assessment.can_weigh_information,
        data.capacity_assessment.can_communicate_decision,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    Some(((sum / answered.len() as f64 - 1.0) / 4.0) * 100.0)
}

/// Calculate the understanding score from understanding items.
pub fn understanding_score(data: &AssessmentData) -> Option<f64> {
    let items = [
        data.patient_understanding.can_explain_procedure,
        data.patient_understanding.can_explain_risks,
        data.patient_understanding.can_explain_alternatives,
        data.patient_understanding.questions_answered_satisfactorily,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    Some(((sum / answered.len() as f64 - 1.0) / 4.0) * 100.0)
}
