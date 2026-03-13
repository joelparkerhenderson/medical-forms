use medical_records_release_tera_crate::engine::flagged_issues::detect_additional_flags;
use medical_records_release_tera_crate::engine::types::*;

fn create_clean_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.medical_record_number = "MRN-12345".to_string();

    data.requesting_party.requester_name = "Dr John Doe".to_string();
    data.requesting_party.requester_relationship = "physician".to_string();

    data.records_specification.record_type = "completeRecord".to_string();
    data.records_specification.urgency_level = "routine".to_string();

    data.purpose_of_release.primary_purpose = "continuityOfCare".to_string();
    data.purpose_of_release.is_court_ordered = "no".to_string();

    data.sensitive_information.include_mental_health = "no".to_string();
    data.sensitive_information.include_substance_abuse = "no".to_string();
    data.sensitive_information.include_hiv_aids = "no".to_string();
    data.sensitive_information.include_genetic_testing = "no".to_string();
    data.sensitive_information.include_sexual_health = "no".to_string();
    data.sensitive_information.include_psychotherapy_notes = "no".to_string();

    data.duration_expiry.authorization_expiry_date = "2027-03-10".to_string();
    data.duration_expiry.auto_renew = "no".to_string();

    data.signatures_consent.informed_consent_given = "yes".to_string();

    data.clinical_review.review_decision = "approved".to_string();
    data.clinical_review.redactions_required = "no".to_string();

    data
}

#[test]
fn no_flags_for_clean_assessment() {
    let data = create_clean_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_psychotherapy_notes() {
    let mut data = create_clean_assessment();
    data.sensitive_information.include_psychotherapy_notes = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SENS-001"));
}

#[test]
fn flags_hiv_aids_records() {
    let mut data = create_clean_assessment();
    data.sensitive_information.include_hiv_aids = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SENS-002"));
}

#[test]
fn flags_substance_abuse_records() {
    let mut data = create_clean_assessment();
    data.sensitive_information.include_substance_abuse = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SENS-003"));
}

#[test]
fn flags_court_ordered_release() {
    let mut data = create_clean_assessment();
    data.purpose_of_release.is_court_ordered = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LEGAL-001"));
}

#[test]
fn flags_no_expiry_date() {
    let mut data = create_clean_assessment();
    data.duration_expiry.authorization_expiry_date = "".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUTH-001"));
}

#[test]
fn flags_guardian_signing() {
    let mut data = create_clean_assessment();
    data.signatures_consent.guardian_name = "Robert Smith".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CONSENT-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_clean_assessment();
    // Create flags of different priorities
    data.sensitive_information.include_psychotherapy_notes = "yes".to_string(); // high
    data.duration_expiry.auto_renew = "yes".to_string(); // medium
    data.purpose_of_release.primary_purpose = "legal".to_string(); // low (legal without case number)

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
