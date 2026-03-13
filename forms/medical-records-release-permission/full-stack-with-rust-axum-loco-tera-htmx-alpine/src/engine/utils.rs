use super::types::AssessmentData;

/// Returns a human-readable label for a completion level.
pub fn completion_level_label(level: &str) -> &str {
    match level {
        "valid" => "Valid",
        "complete" => "Complete",
        "incomplete" => "Incomplete",
        "invalid" => "Invalid",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Count the number of required fields that are filled in.
/// Required fields are those essential for a valid medical records release.
pub fn count_required_fields(data: &AssessmentData) -> (usize, usize) {
    let required_fields: Vec<bool> = vec![
        // Patient Information (6 required)
        !data.patient_information.patient_full_name.trim().is_empty(),
        !data.patient_information.date_of_birth.trim().is_empty(),
        !data.patient_information.patient_address.trim().is_empty(),
        !data.patient_information.patient_phone.trim().is_empty(),
        !data.patient_information.medical_record_number.trim().is_empty(),
        !data.patient_information.social_security_last_four.trim().is_empty(),
        // Requesting Party (4 required)
        !data.requesting_party.requester_name.trim().is_empty(),
        !data.requesting_party.requester_relationship.trim().is_empty(),
        !data.requesting_party.requester_address.trim().is_empty(),
        !data.requesting_party.requester_phone.trim().is_empty(),
        // Records Specification (4 required)
        !data.records_specification.record_type.trim().is_empty(),
        !data.records_specification.date_range_start.trim().is_empty(),
        !data.records_specification.date_range_end.trim().is_empty(),
        !data.records_specification.delivery_format.trim().is_empty(),
        // Purpose of Release (2 required)
        !data.purpose_of_release.primary_purpose.trim().is_empty(),
        !data.purpose_of_release.purpose_details.trim().is_empty(),
        // Authorization Scope (4 required)
        !data.authorization_scope.releasing_facility_name.trim().is_empty(),
        !data.authorization_scope.releasing_provider_name.trim().is_empty(),
        !data.authorization_scope.receiving_facility_name.trim().is_empty(),
        !data.authorization_scope.receiving_provider_name.trim().is_empty(),
        // Sensitive Information (1 required)
        !data.sensitive_information.sensitive_info_acknowledgement.trim().is_empty(),
        // Duration & Expiry (3 required)
        !data.duration_expiry.authorization_start_date.trim().is_empty(),
        !data.duration_expiry.authorization_expiry_date.trim().is_empty(),
        !data.duration_expiry.revocation_understood.trim().is_empty(),
        // Verification & Identity (3 required)
        !data.verification_identity.identity_verified.trim().is_empty(),
        !data.verification_identity.verification_method.trim().is_empty(),
        !data.verification_identity.verification_date.trim().is_empty(),
        // Signatures & Consent (3 required)
        !data.signatures_consent.patient_signature.trim().is_empty(),
        !data.signatures_consent.patient_signature_date.trim().is_empty(),
        !data.signatures_consent.informed_consent_given.trim().is_empty(),
        // Clinical Review (3 required)
        !data.clinical_review.reviewer_name.trim().is_empty(),
        !data.clinical_review.review_date.trim().is_empty(),
        !data.clinical_review.review_decision.trim().is_empty(),
    ];

    let total = required_fields.len();
    let filled = required_fields.iter().filter(|&&v| v).count();
    (filled, total)
}

/// Calculate the completion score as a percentage (0-100).
pub fn calculate_completion_score(data: &AssessmentData) -> f64 {
    let (filled, total) = count_required_fields(data);
    if total == 0 {
        return 0.0;
    }
    ((filled as f64 / total as f64) * 100.0).round()
}

/// Check if patient identity is verified.
pub fn is_identity_verified(data: &AssessmentData) -> bool {
    data.verification_identity.identity_verified == "yes"
}

/// Check if informed consent is given.
pub fn is_consent_given(data: &AssessmentData) -> bool {
    data.signatures_consent.informed_consent_given == "yes"
}

/// Check if the release includes any sensitive information categories.
pub fn includes_sensitive_info(data: &AssessmentData) -> bool {
    data.sensitive_information.include_mental_health == "yes"
        || data.sensitive_information.include_substance_abuse == "yes"
        || data.sensitive_information.include_hiv_aids == "yes"
        || data.sensitive_information.include_genetic_testing == "yes"
        || data.sensitive_information.include_sexual_health == "yes"
        || data.sensitive_information.include_psychotherapy_notes == "yes"
}

/// Determine the review decision label.
pub fn review_decision_label(decision: &str) -> &str {
    match decision {
        "approved" => "Approved",
        "denied" => "Denied",
        "partialApproval" => "Partial Approval",
        "pendingReview" => "Pending Review",
        _ => "Unknown",
    }
}
