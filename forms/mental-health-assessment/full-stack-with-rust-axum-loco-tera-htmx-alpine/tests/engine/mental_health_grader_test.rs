use mental_health_assessment_tera_crate::engine::mental_health_grader::calculate_severity;
use mental_health_assessment_tera_crate::engine::mental_health_rules::all_rules;
use mental_health_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Johnson".to_string();
    data.patient_information.gp_practice = "Riverside Medical Centre".to_string();

    // Presenting Concerns
    data.presenting_concerns.primary_concern = "Low mood and anxiety".to_string();
    data.presenting_concerns.duration_of_symptoms = "1to3Months".to_string();
    data.presenting_concerns.onset_type = "gradual".to_string();
    data.presenting_concerns.current_mood_rating = Some(4);
    data.presenting_concerns.sleep_quality = Some(3);
    data.presenting_concerns.appetite_change = "decreased".to_string();

    // Depression Screening (PHQ-9) — moderate: each item = 1, total = 9
    data.depression_screening.phq1_interest = Some(1);
    data.depression_screening.phq2_mood = Some(1);
    data.depression_screening.phq3_sleep = Some(1);
    data.depression_screening.phq4_fatigue = Some(1);
    data.depression_screening.phq5_appetite = Some(1);
    data.depression_screening.phq6_self_esteem = Some(1);
    data.depression_screening.phq7_concentration = Some(1);
    data.depression_screening.phq8_psychomotor = Some(1);
    data.depression_screening.phq9_self_harm = Some(0);

    // Anxiety Screening (GAD-7) — moderate: each item = 1, total = 7
    data.anxiety_screening.gad1_nervous = Some(1);
    data.anxiety_screening.gad2_uncontrollable = Some(1);
    data.anxiety_screening.gad3_excessive_worry = Some(1);
    data.anxiety_screening.gad4_trouble_relaxing = Some(1);
    data.anxiety_screening.gad5_restless = Some(1);
    data.anxiety_screening.gad6_irritable = Some(1);
    data.anxiety_screening.gad7_afraid = Some(1);

    // Risk Assessment — low risk
    data.risk_assessment.suicidal_ideation = "none".to_string();
    data.risk_assessment.self_harm_history = "no".to_string();
    data.risk_assessment.self_harm_recent = "none".to_string();
    data.risk_assessment.suicide_plan_or_means = "no".to_string();
    data.risk_assessment.risk_level = "low".to_string();
    data.risk_assessment.safeguarding_concerns = "no".to_string();

    // Substance Use — none
    data.substance_use.alcohol_use = "social".to_string();
    data.substance_use.cannabis_use = "none".to_string();
    data.substance_use.other_substances = "none".to_string();
    data.substance_use.prescription_misuse = "no".to_string();

    // Social & Functional Status
    data.social_functional_status.employment_status = "employed".to_string();
    data.social_functional_status.housing_status = "stable".to_string();
    data.social_functional_status.social_support = Some(3);
    data.social_functional_status.daily_functioning = Some(3);
    data.social_functional_status.work_impact = Some(3);
    data.social_functional_status.social_impact = Some(3);
    data.social_functional_status.financial_concerns = "no".to_string();

    // Mental Health History
    data.mental_health_history.previous_diagnoses = "None".to_string();
    data.mental_health_history.previous_treatment = "None".to_string();
    data.mental_health_history.hospitalisations = Some(0);
    data.mental_health_history.trauma_history = "no".to_string();
    data.mental_health_history.childhood_adversity = "no".to_string();

    // Current Treatment
    data.current_treatment.current_medication = "none".to_string();
    data.current_treatment.therapy_type = "none".to_string();
    data.current_treatment.side_effects = "none".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr Patel".to_string();
    data.clinical_review.review_date = "2026-03-09".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_moderate_for_moderate_scores() {
    let data = create_moderate_assessment();
    // PHQ-9 = 8 (items 1-8 each 1, item 9 = 0), GAD-7 = 7
    // Combined = 15, which is in 13-21 range = moderate
    let (level, _score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderate");
}

#[test]
fn returns_minimal_for_all_zeros() {
    let mut data = create_moderate_assessment();
    // Set all PHQ-9 items to 0
    data.depression_screening.phq1_interest = Some(0);
    data.depression_screening.phq2_mood = Some(0);
    data.depression_screening.phq3_sleep = Some(0);
    data.depression_screening.phq4_fatigue = Some(0);
    data.depression_screening.phq5_appetite = Some(0);
    data.depression_screening.phq6_self_esteem = Some(0);
    data.depression_screening.phq7_concentration = Some(0);
    data.depression_screening.phq8_psychomotor = Some(0);
    data.depression_screening.phq9_self_harm = Some(0);
    // Set all GAD-7 items to 0
    data.anxiety_screening.gad1_nervous = Some(0);
    data.anxiety_screening.gad2_uncontrollable = Some(0);
    data.anxiety_screening.gad3_excessive_worry = Some(0);
    data.anxiety_screening.gad4_trouble_relaxing = Some(0);
    data.anxiety_screening.gad5_restless = Some(0);
    data.anxiety_screening.gad6_irritable = Some(0);
    data.anxiety_screening.gad7_afraid = Some(0);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "minimal");
    assert_eq!(score, 0.0); // 0/48 * 100 = 0
}

#[test]
fn returns_severe_for_all_threes() {
    let mut data = create_moderate_assessment();
    // Set all PHQ-9 items to 3 (total = 27)
    data.depression_screening.phq1_interest = Some(3);
    data.depression_screening.phq2_mood = Some(3);
    data.depression_screening.phq3_sleep = Some(3);
    data.depression_screening.phq4_fatigue = Some(3);
    data.depression_screening.phq5_appetite = Some(3);
    data.depression_screening.phq6_self_esteem = Some(3);
    data.depression_screening.phq7_concentration = Some(3);
    data.depression_screening.phq8_psychomotor = Some(3);
    data.depression_screening.phq9_self_harm = Some(3);
    // Set all GAD-7 items to 3 (total = 21)
    data.anxiety_screening.gad1_nervous = Some(3);
    data.anxiety_screening.gad2_uncontrollable = Some(3);
    data.anxiety_screening.gad3_excessive_worry = Some(3);
    data.anxiety_screening.gad4_trouble_relaxing = Some(3);
    data.anxiety_screening.gad5_restless = Some(3);
    data.anxiety_screening.gad6_irritable = Some(3);
    data.anxiety_screening.gad7_afraid = Some(3);

    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
    assert_eq!(score, 100.0); // 48/48 * 100 = 100
    assert!(fired_rules.len() >= 3); // Multiple high concern rules should fire
}

#[test]
fn returns_mild_for_low_scores() {
    let mut data = create_moderate_assessment();
    // PHQ-9: items all 0 except two at 1, total = 2
    data.depression_screening.phq1_interest = Some(1);
    data.depression_screening.phq2_mood = Some(1);
    data.depression_screening.phq3_sleep = Some(0);
    data.depression_screening.phq4_fatigue = Some(0);
    data.depression_screening.phq5_appetite = Some(0);
    data.depression_screening.phq6_self_esteem = Some(0);
    data.depression_screening.phq7_concentration = Some(0);
    data.depression_screening.phq8_psychomotor = Some(0);
    data.depression_screening.phq9_self_harm = Some(0);
    // GAD-7: items all 0 except three at 1, total = 3
    data.anxiety_screening.gad1_nervous = Some(1);
    data.anxiety_screening.gad2_uncontrollable = Some(1);
    data.anxiety_screening.gad3_excessive_worry = Some(1);
    data.anxiety_screening.gad4_trouble_relaxing = Some(0);
    data.anxiety_screening.gad5_restless = Some(0);
    data.anxiety_screening.gad6_irritable = Some(0);
    data.anxiety_screening.gad7_afraid = Some(0);

    // Combined = 5, which is in 5-12 range = mild
    let (level, _score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
}

#[test]
fn fires_severe_depression_rule() {
    let mut data = create_moderate_assessment();
    // PHQ-9 all 3s except Q9 = 2, total = 26 >= 20
    data.depression_screening.phq1_interest = Some(3);
    data.depression_screening.phq2_mood = Some(3);
    data.depression_screening.phq3_sleep = Some(3);
    data.depression_screening.phq4_fatigue = Some(3);
    data.depression_screening.phq5_appetite = Some(3);
    data.depression_screening.phq6_self_esteem = Some(3);
    data.depression_screening.phq7_concentration = Some(3);
    data.depression_screening.phq8_psychomotor = Some(3);
    data.depression_screening.phq9_self_harm = Some(2);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MH-002")); // PHQ-9 >= 20
    assert!(fired_rules.iter().any(|r| r.id == "MH-001")); // PHQ-9 Q9 >= 2
}

#[test]
fn fires_suicide_plan_rule() {
    let mut data = create_moderate_assessment();
    data.risk_assessment.suicide_plan_or_means = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MH-003"));
}

#[test]
fn fires_safeguarding_rule() {
    let mut data = create_moderate_assessment();
    data.risk_assessment.safeguarding_concerns = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MH-005"));
}

#[test]
fn fires_positive_rules_for_minimal_scores() {
    let mut data = create_moderate_assessment();
    // Set all PHQ-9 and GAD-7 items to 0
    data.depression_screening.phq1_interest = Some(0);
    data.depression_screening.phq2_mood = Some(0);
    data.depression_screening.phq3_sleep = Some(0);
    data.depression_screening.phq4_fatigue = Some(0);
    data.depression_screening.phq5_appetite = Some(0);
    data.depression_screening.phq6_self_esteem = Some(0);
    data.depression_screening.phq7_concentration = Some(0);
    data.depression_screening.phq8_psychomotor = Some(0);
    data.depression_screening.phq9_self_harm = Some(0);
    data.anxiety_screening.gad1_nervous = Some(0);
    data.anxiety_screening.gad2_uncontrollable = Some(0);
    data.anxiety_screening.gad3_excessive_worry = Some(0);
    data.anxiety_screening.gad4_trouble_relaxing = Some(0);
    data.anxiety_screening.gad5_restless = Some(0);
    data.anxiety_screening.gad6_irritable = Some(0);
    data.anxiety_screening.gad7_afraid = Some(0);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MH-016")); // PHQ-9 < 5
    assert!(fired_rules.iter().any(|r| r.id == "MH-017")); // GAD-7 < 5
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
