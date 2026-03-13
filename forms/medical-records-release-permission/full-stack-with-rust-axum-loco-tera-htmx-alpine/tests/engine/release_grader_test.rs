use medical_records_release_tera_crate::engine::release_grader::calculate_completion;
use medical_records_release_tera_crate::engine::release_rules::all_rules;
use medical_records_release_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_valid_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.patient_address = "123 Main St, Springfield, IL 62701".to_string();
    data.patient_information.patient_phone = "(555) 123-4567".to_string();
    data.patient_information.patient_email = "jane.smith@example.com".to_string();
    data.patient_information.medical_record_number = "MRN-12345".to_string();
    data.patient_information.social_security_last_four = "6789".to_string();

    // Requesting Party
    data.requesting_party.requester_name = "Dr John Doe".to_string();
    data.requesting_party.requester_relationship = "physician".to_string();
    data.requesting_party.requester_organization = "City Hospital".to_string();
    data.requesting_party.requester_address = "456 Oak Ave, Springfield, IL 62702".to_string();
    data.requesting_party.requester_phone = "(555) 987-6543".to_string();
    data.requesting_party.requester_email = "jdoe@cityhospital.com".to_string();

    // Records Specification
    data.records_specification.record_type = "completeRecord".to_string();
    data.records_specification.date_range_start = "2025-01-01".to_string();
    data.records_specification.date_range_end = "2026-03-01".to_string();
    data.records_specification.delivery_format = "electronic".to_string();
    data.records_specification.delivery_method = "secureEmail".to_string();
    data.records_specification.urgency_level = "routine".to_string();

    // Purpose of Release
    data.purpose_of_release.primary_purpose = "continuityOfCare".to_string();
    data.purpose_of_release.purpose_details = "Transfer of care to new provider".to_string();
    data.purpose_of_release.is_court_ordered = "no".to_string();

    // Authorization Scope
    data.authorization_scope.releasing_facility_name = "General Hospital".to_string();
    data.authorization_scope.releasing_facility_address = "789 Hospital Dr, Springfield, IL 62703".to_string();
    data.authorization_scope.releasing_provider_name = "Dr Jane Wilson".to_string();
    data.authorization_scope.receiving_facility_name = "City Hospital".to_string();
    data.authorization_scope.receiving_facility_address = "456 Oak Ave, Springfield, IL 62702".to_string();
    data.authorization_scope.receiving_provider_name = "Dr John Doe".to_string();

    // Sensitive Information
    data.sensitive_information.include_mental_health = "no".to_string();
    data.sensitive_information.include_substance_abuse = "no".to_string();
    data.sensitive_information.include_hiv_aids = "no".to_string();
    data.sensitive_information.include_genetic_testing = "no".to_string();
    data.sensitive_information.include_sexual_health = "no".to_string();
    data.sensitive_information.include_psychotherapy_notes = "no".to_string();
    data.sensitive_information.sensitive_info_acknowledgement = "yes".to_string();

    // Duration & Expiry
    data.duration_expiry.authorization_start_date = "2026-03-10".to_string();
    data.duration_expiry.authorization_expiry_date = "2027-03-10".to_string();
    data.duration_expiry.auto_renew = "no".to_string();
    data.duration_expiry.revocation_understood = "yes".to_string();
    data.duration_expiry.revocation_method = "written".to_string();

    // Verification & Identity
    data.verification_identity.identity_verified = "yes".to_string();
    data.verification_identity.verification_method = "inPerson".to_string();
    data.verification_identity.verification_document_type = "governmentId".to_string();
    data.verification_identity.verification_document_number = "DL-123456".to_string();
    data.verification_identity.verified_by_name = "Mary Johnson".to_string();
    data.verification_identity.verification_date = "2026-03-10".to_string();

    // Signatures & Consent
    data.signatures_consent.patient_signature = "Jane Smith".to_string();
    data.signatures_consent.patient_signature_date = "2026-03-10".to_string();
    data.signatures_consent.informed_consent_given = "yes".to_string();

    // Clinical Review
    data.clinical_review.reviewer_name = "Dr Sarah Adams".to_string();
    data.clinical_review.reviewer_title = "Health Information Manager".to_string();
    data.clinical_review.review_date = "2026-03-10".to_string();
    data.clinical_review.review_decision = "approved".to_string();
    data.clinical_review.redactions_required = "no".to_string();
    data.clinical_review.compliance_confirmed = "yes".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_completion(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_valid_for_complete_assessment() {
    let data = create_valid_assessment();
    let (level, score, _fired_rules) = calculate_completion(&data);
    assert_eq!(level, "valid");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_invalid_when_consent_not_given() {
    let mut data = create_valid_assessment();
    data.signatures_consent.informed_consent_given = "no".to_string();
    let (level, _score, fired_rules) = calculate_completion(&data);
    assert_eq!(level, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "MRR-001"));
}

#[test]
fn returns_invalid_when_identity_not_verified() {
    let mut data = create_valid_assessment();
    data.verification_identity.identity_verified = "no".to_string();
    let (level, _score, fired_rules) = calculate_completion(&data);
    assert_eq!(level, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "MRR-002"));
}

#[test]
fn returns_invalid_when_signature_missing() {
    let mut data = create_valid_assessment();
    data.signatures_consent.patient_signature = "".to_string();
    let (level, _score, fired_rules) = calculate_completion(&data);
    assert_eq!(level, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "MRR-003"));
}

#[test]
fn returns_invalid_when_review_denied() {
    let mut data = create_valid_assessment();
    data.clinical_review.review_decision = "denied".to_string();
    let (level, _score, fired_rules) = calculate_completion(&data);
    assert_eq!(level, "invalid");
    assert!(fired_rules.iter().any(|r| r.id == "MRR-005"));
}

#[test]
fn fires_sensitive_info_rule_without_acknowledgement() {
    let mut data = create_valid_assessment();
    data.sensitive_information.include_mental_health = "yes".to_string();
    data.sensitive_information.sensitive_info_acknowledgement = "no".to_string();
    let (_level, _score, fired_rules) = calculate_completion(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MRR-006"));
}

#[test]
fn fires_pending_review_rule() {
    let mut data = create_valid_assessment();
    data.clinical_review.review_decision = "pendingReview".to_string();
    let (_level, _score, fired_rules) = calculate_completion(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MRR-014"));
}

#[test]
fn fires_positive_rules_for_valid_assessment() {
    let data = create_valid_assessment();
    let (_level, _score, fired_rules) = calculate_completion(&data);
    // Should fire low-concern positive rules
    assert!(fired_rules.iter().any(|r| r.id == "MRR-017")); // Approved no redactions
    assert!(fired_rules.iter().any(|r| r.id == "MRR-018")); // Compliance confirmed
    assert!(fired_rules.iter().any(|r| r.id == "MRR-019")); // Revocation understood
    assert!(fired_rules.iter().any(|r| r.id == "MRR-020")); // Govt ID verified
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
fn returns_incomplete_when_partially_filled() {
    let mut data = create_valid_assessment();
    // Remove some required fields to bring below 80%
    data.requesting_party.requester_name = "".to_string();
    data.requesting_party.requester_relationship = "".to_string();
    data.requesting_party.requester_address = "".to_string();
    data.requesting_party.requester_phone = "".to_string();
    data.records_specification.record_type = "".to_string();
    data.records_specification.date_range_start = "".to_string();
    data.records_specification.date_range_end = "".to_string();
    data.records_specification.delivery_format = "".to_string();
    let (level, _score, _fired_rules) = calculate_completion(&data);
    assert_eq!(level, "incomplete");
}
