use pediatric_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use pediatric_assessment_tera_crate::engine::types::*;

fn create_healthy_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_parent_information.patient_name = "Emma Johnson".to_string();
    data.patient_parent_information.date_of_birth = "2024-06-15".to_string();

    data.birth_neonatal_history.gestational_age_weeks = Some(39);
    data.birth_neonatal_history.birth_weight_grams = Some(3200);
    data.birth_neonatal_history.nicu_admission = "no".to_string();

    data.immunization_status.immunizations_up_to_date = "yes".to_string();
    data.immunization_status.missing_vaccines = "none".to_string();
    data.immunization_status.vaccine_refusal = "no".to_string();

    data.feeding_nutrition.food_allergies = "none".to_string();
    data.feeding_nutrition.feeding_difficulty = "no".to_string();

    data.developmental_milestones.language_expressive = Some(4);
    data.developmental_milestones.social_emotional = Some(4);

    data.behavioral_assessment.screen_time_hours = "lessThan1".to_string();

    data.family_social_history.secondhand_smoke = "no".to_string();
    data.family_social_history.family_mental_health = "none".to_string();

    data.systems_review.respiratory_concerns = Some(4);

    data.clinical_review.specialist_referrals_needed = "no".to_string();
    data.clinical_review.recent_hospitalizations = "none".to_string();

    data
}

#[test]
fn no_flags_for_healthy_child() {
    let data = create_healthy_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_very_low_birth_weight() {
    let mut data = create_healthy_assessment();
    data.birth_neonatal_history.birth_weight_grams = Some(1200);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BIRTH-001"));
}

#[test]
fn flags_nicu_admission() {
    let mut data = create_healthy_assessment();
    data.birth_neonatal_history.nicu_admission = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BIRTH-002"));
}

#[test]
fn flags_vaccine_refusal() {
    let mut data = create_healthy_assessment();
    data.immunization_status.vaccine_refusal = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IMM-001"));
}

#[test]
fn flags_language_delay() {
    let mut data = create_healthy_assessment();
    data.developmental_milestones.language_expressive = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DEV-001"));
}

#[test]
fn flags_secondhand_smoke() {
    let mut data = create_healthy_assessment();
    data.family_social_history.secondhand_smoke = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FAM-001"));
}

#[test]
fn flags_respiratory_concern() {
    let mut data = create_healthy_assessment();
    data.systems_review.respiratory_concerns = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SYS-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_healthy_assessment();
    // Create flags of different priorities
    data.birth_neonatal_history.nicu_admission = "yes".to_string(); // medium
    data.immunization_status.vaccine_refusal = "yes".to_string(); // high
    data.clinical_review.specialist_referrals_needed = "yes".to_string(); // medium
    data.developmental_milestones.language_expressive = Some(1); // high (FLAG-DEV-001)

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
