use advance_statement_tera_crate::engine::flagged_issues::detect_additional_flags;
use advance_statement_tera_crate::engine::types::*;

fn create_complete_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1955-03-15".to_string();

    data.personal_values.important_to_me = "Being with family".to_string();

    data.care_preferences.preferred_care_location = "home".to_string();
    data.care_preferences.pain_management_preference = "Maximum pain relief".to_string();
    data.care_preferences.resuscitation_wishes = "I would not want CPR if unlikely to recover".to_string();
    data.care_preferences.ventilation_view = "Only if temporary".to_string();

    data.communication_preferences.preferred_language = "English".to_string();
    data.communication_preferences.interpreter_needed = "no".to_string();
    data.communication_preferences.who_to_inform = "John Smith".to_string();

    data.daily_living_preferences.routine_importance = Some(4);
    data.daily_living_preferences.food_preferences = "Vegetarian".to_string();

    data.spiritual_cultural.religious_practices = "Sunday worship".to_string();
    data.spiritual_cultural.dietary_restrictions = "Vegetarian".to_string();

    data.nominated_persons.primary_contact_name = "John Smith".to_string();
    data.nominated_persons.primary_contact_phone = "07700 900001".to_string();
    data.nominated_persons.has_lpa = "yes".to_string();
    data.nominated_persons.lpa_details = "John Smith, registered 2024".to_string();

    data.end_of_life_preferences.preferred_place_of_death = "Home".to_string();
    data.end_of_life_preferences.organ_donation = "yes".to_string();
    data.end_of_life_preferences.funeral_wishes = "Church service".to_string();

    data.healthcare_professional_review.reviewer_name = "Dr Williams".to_string();
    data.healthcare_professional_review.review_date = "2026-03-01".to_string();
    data.healthcare_professional_review.capacity_confirmed = "yes".to_string();
    data.healthcare_professional_review.statement_accurate = "yes".to_string();

    data.signatures_verification.patient_signature = "yes".to_string();
    data.signatures_verification.witness_name = "Robert Brown".to_string();
    data.signatures_verification.witness_signature = "yes".to_string();
    data.signatures_verification.reviewed_with_patient = "yes".to_string();

    data
}

#[test]
fn no_flags_for_complete_assessment() {
    let data = create_complete_assessment();
    let flags = detect_additional_flags(&data);
    // Only low-priority flags should remain (witness is present, so no FLAG-WIT-001)
    assert!(flags.iter().all(|f| f.priority != "high"));
}

#[test]
fn flags_capacity_not_confirmed() {
    let mut data = create_complete_assessment();
    data.healthcare_professional_review.capacity_confirmed = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CAP-001"));
}

#[test]
fn flags_no_nominated_contact() {
    let mut data = create_complete_assessment();
    data.nominated_persons.primary_contact_name = "".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CONT-001"));
}

#[test]
fn flags_end_of_life_absent() {
    let mut data = create_complete_assessment();
    data.end_of_life_preferences.preferred_place_of_death = "".to_string();
    data.end_of_life_preferences.organ_donation = "".to_string();
    data.end_of_life_preferences.funeral_wishes = "".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-EOL-001"));
}

#[test]
fn flags_lpa_not_coordinated() {
    let mut data = create_complete_assessment();
    data.nominated_persons.has_lpa = "yes".to_string();
    data.nominated_persons.lpa_details = "".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LPA-001"));
}

#[test]
fn flags_unsigned_statement() {
    let mut data = create_complete_assessment();
    data.signatures_verification.patient_signature = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SIG-001"));
}

#[test]
fn flags_no_witness() {
    let mut data = create_complete_assessment();
    data.signatures_verification.witness_signature = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-WIT-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_complete_assessment();
    // Create flags of different priorities
    data.healthcare_professional_review.capacity_confirmed = "no".to_string(); // high: FLAG-CAP-001
    data.signatures_verification.witness_signature = "no".to_string(); // low: FLAG-WIT-001
    data.healthcare_professional_review.review_date = "".to_string(); // medium: FLAG-REV-002

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
