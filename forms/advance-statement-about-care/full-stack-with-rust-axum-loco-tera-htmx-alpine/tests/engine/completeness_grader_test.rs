use advance_statement_tera_crate::engine::completeness_grader::calculate_completeness;
use advance_statement_tera_crate::engine::completeness_rules::all_rules;
use advance_statement_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_complete_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Step 1: Patient Information
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1955-03-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.address = "42 Elm Street, London".to_string();
    data.patient_information.postcode = "SW1A 1AA".to_string();
    data.patient_information.telephone = "07700 900000".to_string();
    data.patient_information.email = "jane@example.com".to_string();
    data.patient_information.gp_name = "Dr Johnson".to_string();
    data.patient_information.gp_practice = "Riverside Medical Centre".to_string();

    // Step 2: Personal Values
    data.personal_values.important_to_me = "Being with family, maintaining dignity".to_string();
    data.personal_values.quality_of_life_factors = "Independence, being pain-free".to_string();
    data.personal_values.unacceptable_outcomes = "Being in persistent vegetative state".to_string();
    data.personal_values.religious_belief = "Christian faith".to_string();
    data.personal_values.cultural_considerations = "None specific".to_string();
    data.personal_values.personal_philosophy = "Quality over quantity of life".to_string();

    // Step 3: Care Preferences
    data.care_preferences.preferred_care_location = "home".to_string();
    data.care_preferences.pain_management_preference = "Prefer maximum pain relief even if it affects alertness".to_string();
    data.care_preferences.treatment_goals = "Comfort and dignity".to_string();
    data.care_preferences.resuscitation_wishes = "I would not want CPR if unlikely to recover".to_string();
    data.care_preferences.artificial_nutrition_view = "Only if temporary and recovery expected".to_string();
    data.care_preferences.ventilation_view = "Only if temporary and recovery expected".to_string();

    // Step 4: Communication Preferences
    data.communication_preferences.preferred_language = "English".to_string();
    data.communication_preferences.interpreter_needed = "no".to_string();
    data.communication_preferences.communication_aids = "Reading glasses".to_string();
    data.communication_preferences.information_sharing_wishes = "Full information please".to_string();
    data.communication_preferences.who_to_inform = "John Smith (husband), Mary Jones (daughter)".to_string();
    data.communication_preferences.how_to_break_bad_news = "Directly, with family present".to_string();

    // Step 5: Daily Living Preferences
    data.daily_living_preferences.routine_importance = Some(4);
    data.daily_living_preferences.food_preferences = "Vegetarian, enjoys tea".to_string();
    data.daily_living_preferences.personal_care_wishes = "Prefer female carers for personal care".to_string();
    data.daily_living_preferences.clothing_preferences = "Comfortable clothes, own nightwear".to_string();
    data.daily_living_preferences.social_activities = "Reading, garden visits, family time".to_string();
    data.daily_living_preferences.pet_considerations = "Cat - daughter will care for".to_string();

    // Step 6: Spiritual & Cultural
    data.spiritual_cultural.religious_practices = "Sunday worship, daily prayer".to_string();
    data.spiritual_cultural.spiritual_support = "yes".to_string();
    data.spiritual_cultural.specific_rituals = "Last rites if condition deteriorates".to_string();
    data.spiritual_cultural.dietary_restrictions = "Vegetarian".to_string();
    data.spiritual_cultural.cultural_practices = "None specific".to_string();
    data.spiritual_cultural.chaplain_visit = "yes".to_string();

    // Step 7: Nominated Persons
    data.nominated_persons.primary_contact_name = "John Smith".to_string();
    data.nominated_persons.primary_contact_relationship = "Husband".to_string();
    data.nominated_persons.primary_contact_phone = "07700 900001".to_string();
    data.nominated_persons.secondary_contact_name = "Mary Jones".to_string();
    data.nominated_persons.secondary_contact_relationship = "Daughter".to_string();
    data.nominated_persons.secondary_contact_phone = "07700 900002".to_string();
    data.nominated_persons.has_lpa = "yes".to_string();
    data.nominated_persons.lpa_details = "John Smith, registered 2024".to_string();

    // Step 8: End of Life Preferences
    data.end_of_life_preferences.preferred_place_of_death = "Home".to_string();
    data.end_of_life_preferences.organ_donation = "yes".to_string();
    data.end_of_life_preferences.funeral_wishes = "Church service, burial".to_string();
    data.end_of_life_preferences.after_death_wishes = "Donate to cancer research".to_string();
    data.end_of_life_preferences.music_or_comfort = "Hymns, family photos nearby".to_string();
    data.end_of_life_preferences.who_should_be_present = "Family".to_string();

    // Step 9: Healthcare Professional Review
    data.healthcare_professional_review.reviewer_name = "Dr Sarah Williams".to_string();
    data.healthcare_professional_review.reviewer_role = "Consultant".to_string();
    data.healthcare_professional_review.review_date = "2026-03-01".to_string();
    data.healthcare_professional_review.capacity_confirmed = "yes".to_string();
    data.healthcare_professional_review.discussion_notes = "Patient clearly articulated wishes".to_string();
    data.healthcare_professional_review.statement_accurate = "yes".to_string();

    // Step 10: Signatures
    data.signatures_verification.patient_signature = "yes".to_string();
    data.signatures_verification.patient_signature_date = "2026-03-01".to_string();
    data.signatures_verification.witness_name = "Robert Brown".to_string();
    data.signatures_verification.witness_signature = "yes".to_string();
    data.signatures_verification.witness_signature_date = "2026-03-01".to_string();
    data.signatures_verification.reviewed_with_patient = "yes".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (status, sections, fired_rules) = calculate_completeness(&data);
    assert_eq!(status, "draft");
    assert_eq!(sections, 0);
    // High concern rules should fire for empty data
    assert!(fired_rules.iter().any(|r| r.concern_level == "high"));
}

#[test]
fn returns_reviewed_for_complete_assessment() {
    let data = create_complete_assessment();
    let (status, sections, _fired_rules) = calculate_completeness(&data);
    assert_eq!(status, "reviewed");
    assert_eq!(sections, 10);
}

#[test]
fn returns_complete_when_all_sections_but_not_reviewed() {
    let mut data = create_complete_assessment();
    // Remove clinician review accuracy confirmation
    data.healthcare_professional_review.statement_accurate = "".to_string();

    let (status, _sections, _fired_rules) = calculate_completeness(&data);
    assert_eq!(status, "complete");
}

#[test]
fn returns_incomplete_for_partial_assessment() {
    let mut data = AssessmentData::default();
    // Fill only patient info and personal values (2 sections)
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1955-03-15".to_string();
    data.personal_values.important_to_me = "Family".to_string();

    let (status, sections, _fired_rules) = calculate_completeness(&data);
    assert_eq!(status, "incomplete");
    assert_eq!(sections, 2);
}

#[test]
fn fires_no_nominated_contact_rule() {
    let mut data = create_complete_assessment();
    data.nominated_persons.primary_contact_name = "".to_string();

    let (_status, _sections, fired_rules) = calculate_completeness(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AS-001"));
}

#[test]
fn fires_end_of_life_absent_rule() {
    let mut data = create_complete_assessment();
    data.end_of_life_preferences.preferred_place_of_death = "".to_string();
    data.end_of_life_preferences.organ_donation = "".to_string();
    data.end_of_life_preferences.funeral_wishes = "".to_string();

    let (_status, _sections, fired_rules) = calculate_completeness(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AS-002"));
}

#[test]
fn fires_no_capacity_confirmation_rule() {
    let mut data = create_complete_assessment();
    data.healthcare_professional_review.capacity_confirmed = "no".to_string();

    let (_status, _sections, fired_rules) = calculate_completeness(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AS-003"));
}

#[test]
fn fires_unsigned_statement_rule() {
    let mut data = create_complete_assessment();
    data.signatures_verification.patient_signature = "no".to_string();

    let (_status, _sections, fired_rules) = calculate_completeness(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AS-005"));
}

#[test]
fn fires_positive_rules_for_complete_assessment() {
    let data = create_complete_assessment();
    let (_status, _sections, fired_rules) = calculate_completeness(&data);
    // AS-016: All sections completed
    assert!(fired_rules.iter().any(|r| r.id == "AS-016"));
    // AS-017: Clinician reviewed and confirmed accuracy
    assert!(fired_rules.iter().any(|r| r.id == "AS-017"));
    // AS-019: Patient satisfied with statement
    assert!(fired_rules.iter().any(|r| r.id == "AS-019"));
    // AS-020: Nominated persons confirmed
    assert!(fired_rules.iter().any(|r| r.id == "AS-020"));
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
