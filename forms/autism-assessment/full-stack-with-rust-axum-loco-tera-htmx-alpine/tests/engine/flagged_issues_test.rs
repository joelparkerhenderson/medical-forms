use autism_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use autism_assessment_tera_crate::engine::types::*;

fn create_clean_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.referral_source = "gp".to_string();

    data.developmental_history.speech_delay = "no".to_string();
    data.developmental_history.motor_delay = "no".to_string();
    data.developmental_history.social_play_differences = "no".to_string();
    data.developmental_history.early_repetitive_behaviours = "no".to_string();

    data.social_communication.eye_contact = Some(1);
    data.social_communication.conversational_reciprocity = Some(1);
    data.social_communication.nonverbal_communication = Some(1);
    data.social_communication.understanding_social_cues = Some(1);
    data.social_communication.friendship_maintenance = Some(1);

    data.sensory_processing.auditory_sensitivity = Some(1);
    data.sensory_processing.visual_sensitivity = Some(1);
    data.sensory_processing.tactile_sensitivity = Some(1);
    data.sensory_processing.olfactory_sensitivity = Some(1);
    data.sensory_processing.sensory_seeking = Some(0);
    data.sensory_processing.sensory_overload_frequency = "rarely".to_string();

    data.mental_health_comorbidities.anxiety_level = Some(1);
    data.mental_health_comorbidities.depression_level = Some(0);
    data.mental_health_comorbidities.sleep_difficulties = Some(1);
    data.mental_health_comorbidities.self_harm_risk = "no".to_string();
    data.mental_health_comorbidities.safeguarding_concerns = "no".to_string();

    data.support_needs.employment_support = "no".to_string();
    data.support_needs.education_support = "no".to_string();
    data.support_needs.relationship_support = "no".to_string();
    data.support_needs.housing_support = "no".to_string();
    data.support_needs.benefits_support = "no".to_string();

    data
}

#[test]
fn no_flags_for_clean_assessment() {
    let data = create_clean_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_safeguarding_concern() {
    let mut data = create_clean_assessment();
    data.mental_health_comorbidities.safeguarding_concerns = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAFE-001"));
}

#[test]
fn flags_self_harm_risk() {
    let mut data = create_clean_assessment();
    data.mental_health_comorbidities.self_harm_risk = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MH-001"));
}

#[test]
fn flags_daily_sensory_overload() {
    let mut data = create_clean_assessment();
    data.sensory_processing.sensory_overload_frequency = "daily".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SENS-001"));
}

#[test]
fn flags_employment_support() {
    let mut data = create_clean_assessment();
    data.support_needs.employment_support = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SUPP-001"));
}

#[test]
fn flags_severe_anxiety() {
    let mut data = create_clean_assessment();
    data.mental_health_comorbidities.anxiety_level = Some(3);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MH-002"));
}

#[test]
fn flags_speech_delay() {
    let mut data = create_clean_assessment();
    data.developmental_history.speech_delay = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DEV-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_clean_assessment();
    // Create flags of different priorities
    data.mental_health_comorbidities.self_harm_risk = "yes".to_string(); // high
    data.support_needs.employment_support = "yes".to_string(); // medium
    data.developmental_history.speech_delay = "yes".to_string(); // low

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
