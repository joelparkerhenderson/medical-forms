use gerontology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use gerontology_assessment_tera_crate::engine::types::*;

fn create_fit_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Margaret Jones".to_string();

    // Functional — all independent
    data.functional_assessment.feeding = Some(2);
    data.functional_assessment.bathing = Some(2);
    data.functional_assessment.grooming = Some(2);
    data.functional_assessment.dressing = Some(2);
    data.functional_assessment.bowel_control = Some(2);
    data.functional_assessment.bladder_control = Some(2);
    data.functional_assessment.toilet_use = Some(2);
    data.functional_assessment.transfers = Some(2);
    data.functional_assessment.mobility = Some(2);
    data.functional_assessment.stairs = Some(2);

    // Cognitive — normal
    data.cognitive_screening.mmse_score = Some(28);
    data.cognitive_screening.four_at_alertness = Some(0);
    data.cognitive_screening.four_at_amts4 = Some(0);
    data.cognitive_screening.four_at_attention = Some(0);
    data.cognitive_screening.four_at_acute_change = Some(0);
    data.cognitive_screening.known_dementia_diagnosis = "no".to_string();

    // Falls — none
    data.falls_risk.falls_last_12_months = Some(0);
    data.falls_risk.falls_with_injury = Some(0);
    data.falls_risk.fear_of_falling = "no".to_string();
    data.falls_risk.tinetti_sitting_balance = Some(2);
    data.falls_risk.tinetti_arising = Some(2);
    data.falls_risk.tinetti_standing_balance = Some(2);
    data.falls_risk.tinetti_nudge_test = Some(2);
    data.falls_risk.tinetti_eyes_closed = Some(2);
    data.falls_risk.tinetti_turning = Some(2);

    // Medications — few
    data.medication_review.total_medications = Some(3);
    data.medication_review.high_risk_medications = "no".to_string();

    // Mood — no depression
    data.mood_assessment.gds_satisfied_with_life = "yes".to_string();
    data.mood_assessment.gds_dropped_activities = "no".to_string();
    data.mood_assessment.gds_life_feels_empty = "no".to_string();
    data.mood_assessment.gds_often_bored = "no".to_string();
    data.mood_assessment.gds_good_spirits = "yes".to_string();
    data.mood_assessment.gds_afraid_something_bad = "no".to_string();
    data.mood_assessment.gds_feels_happy = "yes".to_string();
    data.mood_assessment.gds_feels_helpless = "no".to_string();
    data.mood_assessment.gds_prefers_staying_home = "no".to_string();
    data.mood_assessment.gds_memory_problems = "no".to_string();
    data.mood_assessment.gds_wonderful_to_be_alive = "yes".to_string();
    data.mood_assessment.gds_feels_worthless = "no".to_string();
    data.mood_assessment.gds_feels_full_of_energy = "yes".to_string();
    data.mood_assessment.gds_feels_hopeless = "no".to_string();
    data.mood_assessment.gds_others_better_off = "no".to_string();
    data.mood_assessment.social_isolation = "no".to_string();

    // Social
    data.social_circumstances.lives_alone = "no".to_string();
    data.social_circumstances.carer_stress = "no".to_string();
    data.social_circumstances.safeguarding_concerns = "no".to_string();
    data.social_circumstances.advance_care_plan = "yes".to_string();
    data.social_circumstances.driving_status = "stoppedRecently".to_string();
    data.social_circumstances.formal_care_package = "no".to_string();

    // Continence
    data.continence_assessment.urinary_incontinence = "no".to_string();
    data.continence_assessment.continence_impact_on_quality = "none".to_string();

    // Clinical
    data.clinical_review.clinical_frailty_scale = Some(2);
    data.clinical_review.pressure_ulcer_risk = "low".to_string();
    data.clinical_review.palliative_care_needs = "no".to_string();

    data
}

#[test]
fn no_flags_for_fit_patient() {
    let data = create_fit_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_falls_prevention_programme() {
    let mut data = create_fit_assessment();
    data.falls_risk.falls_last_12_months = Some(2);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FALL-001"));
}

#[test]
fn flags_extreme_polypharmacy() {
    let mut data = create_fit_assessment();
    data.medication_review.total_medications = Some(12);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MED-001"));
}

#[test]
fn flags_delirium_screening() {
    let mut data = create_fit_assessment();
    data.cognitive_screening.four_at_alertness = Some(4);
    data.cognitive_screening.four_at_acute_change = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DEL-001"));
}

#[test]
fn flags_safeguarding() {
    let mut data = create_fit_assessment();
    data.social_circumstances.safeguarding_concerns = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAFE-001"));
}

#[test]
fn flags_carer_stress() {
    let mut data = create_fit_assessment();
    data.social_circumstances.carer_stress = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CARE-001"));
}

#[test]
fn flags_care_home_assessment() {
    let mut data = create_fit_assessment();
    data.clinical_review.clinical_frailty_scale = Some(7);
    data.social_circumstances.lives_alone = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HOME-001"));
}

#[test]
fn flags_driving_assessment() {
    let mut data = create_fit_assessment();
    data.social_circumstances.driving_status = "drives".to_string();
    data.cognitive_screening.known_dementia_diagnosis = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DRIVE-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_fit_assessment();
    // Create flags of different priorities
    data.falls_risk.falls_last_12_months = Some(3); // high (FLAG-FALL-001)
    data.social_circumstances.carer_stress = "yes".to_string(); // medium (FLAG-CARE-001)
    data.medication_review.high_risk_medications = "yes".to_string(); // medium (FLAG-MED-003)

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
