use mental_health_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use mental_health_assessment_tera_crate::engine::types::*;

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();

    // PHQ-9 — mild: total = 8
    data.depression_screening.phq1_interest = Some(1);
    data.depression_screening.phq2_mood = Some(1);
    data.depression_screening.phq3_sleep = Some(1);
    data.depression_screening.phq4_fatigue = Some(1);
    data.depression_screening.phq5_appetite = Some(1);
    data.depression_screening.phq6_self_esteem = Some(1);
    data.depression_screening.phq7_concentration = Some(1);
    data.depression_screening.phq8_psychomotor = Some(1);
    data.depression_screening.phq9_self_harm = Some(0);

    // GAD-7 — mild: total = 7
    data.anxiety_screening.gad1_nervous = Some(1);
    data.anxiety_screening.gad2_uncontrollable = Some(1);
    data.anxiety_screening.gad3_excessive_worry = Some(1);
    data.anxiety_screening.gad4_trouble_relaxing = Some(1);
    data.anxiety_screening.gad5_restless = Some(1);
    data.anxiety_screening.gad6_irritable = Some(1);
    data.anxiety_screening.gad7_afraid = Some(1);

    // Risk — low
    data.risk_assessment.suicidal_ideation = "none".to_string();
    data.risk_assessment.self_harm_history = "no".to_string();
    data.risk_assessment.self_harm_recent = "none".to_string();
    data.risk_assessment.suicide_plan_or_means = "no".to_string();
    data.risk_assessment.safeguarding_concerns = "no".to_string();
    data.risk_assessment.risk_level = "low".to_string();

    // Substance — none
    data.substance_use.other_substances = "none".to_string();
    data.substance_use.prescription_misuse = "no".to_string();

    // Social
    data.social_functional_status.social_support = Some(4);
    data.social_functional_status.daily_functioning = Some(4);

    // Treatment
    data.current_treatment.current_medication = "none".to_string();
    data.current_treatment.side_effects = "none".to_string();
    data.current_treatment.therapy_type = "none".to_string();

    // History
    data.mental_health_history.hospitalisations = Some(0);

    data
}

#[test]
fn no_flags_for_low_risk_patient() {
    let data = create_low_risk_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_active_suicidal_ideation() {
    let mut data = create_low_risk_assessment();
    data.risk_assessment.suicidal_ideation = "active".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RISK-001"));
}

#[test]
fn flags_suicide_plan_or_means() {
    let mut data = create_low_risk_assessment();
    data.risk_assessment.suicide_plan_or_means = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RISK-002"));
}

#[test]
fn flags_recent_self_harm() {
    let mut data = create_low_risk_assessment();
    data.risk_assessment.self_harm_history = "yes".to_string();
    data.risk_assessment.self_harm_recent = "last week".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RISK-003"));
}

#[test]
fn flags_safeguarding_concerns() {
    let mut data = create_low_risk_assessment();
    data.risk_assessment.safeguarding_concerns = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAFE-001"));
}

#[test]
fn flags_severe_depression() {
    let mut data = create_low_risk_assessment();
    // Set PHQ-9 to severe (>= 20)
    data.depression_screening.phq1_interest = Some(3);
    data.depression_screening.phq2_mood = Some(3);
    data.depression_screening.phq3_sleep = Some(3);
    data.depression_screening.phq4_fatigue = Some(3);
    data.depression_screening.phq5_appetite = Some(3);
    data.depression_screening.phq6_self_esteem = Some(3);
    data.depression_screening.phq7_concentration = Some(2);
    data.depression_screening.phq8_psychomotor = Some(0);
    data.depression_screening.phq9_self_harm = Some(0);
    // Total = 20
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PHQ-001"));
}

#[test]
fn flags_phq9_q9_positive() {
    let mut data = create_low_risk_assessment();
    data.depression_screening.phq9_self_harm = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PHQ-002"));
}

#[test]
fn flags_social_isolation() {
    let mut data = create_low_risk_assessment();
    data.social_functional_status.social_support = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SOCIAL-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_low_risk_assessment();
    // Create flags of different priorities
    data.risk_assessment.suicidal_ideation = "active".to_string(); // high
    data.social_functional_status.social_support = Some(1); // medium
    data.current_treatment.treatment_response = Some(1); // medium

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
