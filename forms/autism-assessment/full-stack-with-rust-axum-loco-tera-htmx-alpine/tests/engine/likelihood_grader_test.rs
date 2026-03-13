use autism_assessment_tera_crate::engine::likelihood_grader::calculate_likelihood;
use autism_assessment_tera_crate::engine::likelihood_rules::all_rules;
use autism_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_likely_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.patient_age = "35to44".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.referral_source = "gp".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();
    data.patient_information.clinician_name = "Dr Jones".to_string();
    data.patient_information.clinician_role = "psychiatrist".to_string();

    // Developmental History
    data.developmental_history.speech_delay = "yes".to_string();
    data.developmental_history.motor_delay = "no".to_string();
    data.developmental_history.social_play_differences = "yes".to_string();
    data.developmental_history.early_repetitive_behaviours = "yes".to_string();
    data.developmental_history.age_first_concerns = "6to11".to_string();
    data.developmental_history.previous_assessments = "no".to_string();

    // Social Communication — moderate difficulties (2s)
    data.social_communication.eye_contact = Some(2);
    data.social_communication.conversational_reciprocity = Some(2);
    data.social_communication.nonverbal_communication = Some(2);
    data.social_communication.understanding_social_cues = Some(2);
    data.social_communication.friendship_maintenance = Some(2);
    data.social_communication.communication_preference = "verbal".to_string();

    // Restricted Repetitive Behaviours — moderate (2s)
    data.restricted_repetitive_behaviours.intense_interests = Some(2);
    data.restricted_repetitive_behaviours.routines_rituals = Some(2);
    data.restricted_repetitive_behaviours.resistance_to_change = Some(2);
    data.restricted_repetitive_behaviours.repetitive_movements = Some(1);
    data.restricted_repetitive_behaviours.need_for_sameness = Some(2);

    // Sensory Processing — moderate (2s)
    data.sensory_processing.auditory_sensitivity = Some(2);
    data.sensory_processing.visual_sensitivity = Some(1);
    data.sensory_processing.tactile_sensitivity = Some(2);
    data.sensory_processing.olfactory_sensitivity = Some(1);
    data.sensory_processing.sensory_seeking = Some(1);
    data.sensory_processing.sensory_overload_frequency = "weekly".to_string();

    // AQ-10 — score 7 (likely)
    // Q1 agree (scores): definitely agree = 3 -> 1
    data.aq10_screening.q1_notice_sounds = Some(3);
    // Q2 agree (does NOT score): slightly agree = 2 -> 0
    data.aq10_screening.q2_whole_picture = Some(2);
    // Q3 disagree (scores): definitely disagree = 0 -> 1
    data.aq10_screening.q3_multitask = Some(0);
    // Q4 agree (does NOT score): slightly agree = 2 -> 0
    data.aq10_screening.q4_switch_back = Some(2);
    // Q5 disagree (scores): definitely disagree = 0 -> 1
    data.aq10_screening.q5_read_between_lines = Some(0);
    // Q6 agree (does NOT score): slightly agree = 2 -> 0
    data.aq10_screening.q6_detect_boredom = Some(2);
    // Q7 agree (scores): slightly agree = 2 -> 1
    data.aq10_screening.q7_character_intentions = Some(2);
    // Q8 agree (scores): definitely agree = 3 -> 1
    data.aq10_screening.q8_collect_info = Some(3);
    // Q9 disagree (scores): definitely disagree = 0 -> 1
    data.aq10_screening.q9_read_faces = Some(0);
    // Q10 agree (scores): slightly agree = 2 -> 1
    data.aq10_screening.q10_work_out_intentions = Some(2);
    // Total: Q1(1)+Q3(1)+Q5(1)+Q7(1)+Q8(1)+Q9(1)+Q10(1) = 7

    // Daily Living Skills — moderate difficulties
    data.daily_living_skills.personal_care = Some(1);
    data.daily_living_skills.meal_preparation = Some(2);
    data.daily_living_skills.time_management = Some(2);
    data.daily_living_skills.financial_management = Some(2);
    data.daily_living_skills.travel_independence = Some(1);

    // Mental Health — mild
    data.mental_health_comorbidities.anxiety_level = Some(2);
    data.mental_health_comorbidities.depression_level = Some(1);
    data.mental_health_comorbidities.sleep_difficulties = Some(2);
    data.mental_health_comorbidities.self_harm_risk = "no".to_string();
    data.mental_health_comorbidities.safeguarding_concerns = "no".to_string();

    // Support Needs
    data.support_needs.employment_support = "yes".to_string();
    data.support_needs.education_support = "no".to_string();
    data.support_needs.relationship_support = "yes".to_string();
    data.support_needs.housing_support = "no".to_string();
    data.support_needs.benefits_support = "no".to_string();
    data.support_needs.support_level_needed = "level1".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_likelihood(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_likely_for_aq10_score_7() {
    let data = create_likely_assessment();
    let (level, score, _fired_rules) = calculate_likelihood(&data);
    assert_eq!(level, "likely");
    assert_eq!(score, 7); // Q1(1)+Q3(1)+Q5(1)+Q7(1)+Q8(1)+Q9(1)+Q10(1) = 7
}

#[test]
fn returns_highly_likely_for_aq10_score_8_plus() {
    let mut data = create_likely_assessment();
    // Adjust to get score 8: make Q4 disagree (score) by setting to 1
    data.aq10_screening.q4_switch_back = Some(1);

    let (level, score, _fired_rules) = calculate_likelihood(&data);
    assert_eq!(level, "highlyLikely");
    assert_eq!(score, 8);
}

#[test]
fn returns_unlikely_for_low_aq10() {
    let mut data = create_likely_assessment();
    // Set all AQ-10 items to non-scoring values
    // Items 1,7,8,10: set to disagree (<=1), won't score
    data.aq10_screening.q1_notice_sounds = Some(0);
    data.aq10_screening.q7_character_intentions = Some(0);
    data.aq10_screening.q8_collect_info = Some(0);
    data.aq10_screening.q10_work_out_intentions = Some(0);
    // Items 2,3,4,5,6,9: set to agree (>=2), won't score
    data.aq10_screening.q2_whole_picture = Some(3);
    data.aq10_screening.q3_multitask = Some(3);
    data.aq10_screening.q4_switch_back = Some(3);
    data.aq10_screening.q5_read_between_lines = Some(3);
    data.aq10_screening.q6_detect_boredom = Some(3);
    data.aq10_screening.q9_read_faces = Some(3);

    let (level, score, _fired_rules) = calculate_likelihood(&data);
    assert_eq!(level, "unlikely");
    assert_eq!(score, 0);
}

#[test]
fn returns_possible_for_aq10_score_4_to_5() {
    let mut data = create_likely_assessment();
    // Adjust to get exactly score 5
    // Q1 agree (scores): 3 -> scores
    data.aq10_screening.q1_notice_sounds = Some(3);
    // Q2 agree (no score): 3
    data.aq10_screening.q2_whole_picture = Some(3);
    // Q3 agree (no score): 3
    data.aq10_screening.q3_multitask = Some(3);
    // Q4 disagree (scores): 0
    data.aq10_screening.q4_switch_back = Some(0);
    // Q5 disagree (scores): 1
    data.aq10_screening.q5_read_between_lines = Some(1);
    // Q6 agree (no score): 2
    data.aq10_screening.q6_detect_boredom = Some(2);
    // Q7 agree (scores): 2
    data.aq10_screening.q7_character_intentions = Some(2);
    // Q8 disagree (no score): 1
    data.aq10_screening.q8_collect_info = Some(1);
    // Q9 agree (no score): 3
    data.aq10_screening.q9_read_faces = Some(3);
    // Q10 agree (scores): 2
    data.aq10_screening.q10_work_out_intentions = Some(2);
    // Score: Q1(1) + Q4(1) + Q5(1) + Q7(1) + Q10(1) = 5

    let (level, score, _fired_rules) = calculate_likelihood(&data);
    assert_eq!(score, 5);
    assert_eq!(level, "possible");
}

#[test]
fn fires_high_aq10_rule_for_score_8() {
    let mut data = create_likely_assessment();
    data.aq10_screening.q4_switch_back = Some(1); // Make Q4 score too -> total 8

    let (_level, _score, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ASD-001"));
}

#[test]
fn fires_self_harm_risk_rule() {
    let mut data = create_likely_assessment();
    data.mental_health_comorbidities.self_harm_risk = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ASD-004"));
}

#[test]
fn fires_safeguarding_rule() {
    let mut data = create_likely_assessment();
    data.mental_health_comorbidities.safeguarding_concerns = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ASD-005"));
}

#[test]
fn fires_low_aq10_rule_for_score_below_6() {
    let mut data = create_likely_assessment();
    // Set all to non-scoring to get score 0
    data.aq10_screening.q1_notice_sounds = Some(0);
    data.aq10_screening.q7_character_intentions = Some(0);
    data.aq10_screening.q8_collect_info = Some(0);
    data.aq10_screening.q10_work_out_intentions = Some(0);
    data.aq10_screening.q2_whole_picture = Some(3);
    data.aq10_screening.q3_multitask = Some(3);
    data.aq10_screening.q4_switch_back = Some(3);
    data.aq10_screening.q5_read_between_lines = Some(3);
    data.aq10_screening.q6_detect_boredom = Some(3);
    data.aq10_screening.q9_read_faces = Some(3);

    let (_level, _score, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ASD-016"));
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
