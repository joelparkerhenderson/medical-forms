use hearing_aid_assessment_tera_crate::engine::hearing_aid_grader::calculate_hearing_aid_level;
use hearing_aid_assessment_tera_crate::engine::hearing_aid_rules::all_rules;
use hearing_aid_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1960-05-15".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.referral_source = "gp".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.audiologist_name = "Dr Johnson".to_string();

    // Hearing History (non-scored)
    data.hearing_history.onset_duration = "5to10Years".to_string();
    data.hearing_history.hearing_loss_type = "sensorineural".to_string();
    data.hearing_history.affected_ear = "bilateral".to_string();
    data.hearing_history.family_history = "yes".to_string();
    data.hearing_history.noise_exposure = "past".to_string();
    data.hearing_history.tinnitus_present = "no".to_string();
    data.hearing_history.previous_hearing_aid_use = "never".to_string();
    data.hearing_history.medical_conditions = "no".to_string();

    // Audiometric Results (non-scored, except PTA/speech recognition used in rules)
    data.audiometric_results.right_ear_pta = Some(45);
    data.audiometric_results.left_ear_pta = Some(50);
    data.audiometric_results.speech_recognition_right = Some(80);
    data.audiometric_results.speech_recognition_left = Some(75);
    data.audiometric_results.hearing_loss_severity = "moderate".to_string();
    data.audiometric_results.audiogram_configuration = "sloping".to_string();

    // Communication Needs — all 4s (Little Difficulty)
    data.communication_needs.quiet_conversation = Some(4);
    data.communication_needs.group_conversation = Some(4);
    data.communication_needs.telephone_use = Some(4);
    data.communication_needs.television_listening = Some(4);
    data.communication_needs.public_settings = Some(4);
    data.communication_needs.workplace_communication = Some(4);

    // Lifestyle Assessment — all 4s
    data.lifestyle_assessment.social_activity_level = Some(4);
    data.lifestyle_assessment.outdoor_activity_level = Some(4);
    data.lifestyle_assessment.technology_comfort = Some(4);
    data.lifestyle_assessment.manual_dexterity = Some(4);
    data.lifestyle_assessment.cosmetic_concern = Some(4);
    data.lifestyle_assessment.motivation_level = Some(4);

    // Current Hearing Aids
    data.current_hearing_aids.currently_wearing = "no".to_string();
    data.current_hearing_aids.current_aid_type = "none".to_string();
    data.current_hearing_aids.current_aid_age = "notApplicable".to_string();
    data.current_hearing_aids.daily_usage_hours = "notApplicable".to_string();

    // Fitting Requirements
    data.fitting_requirements.preferred_style = "rite".to_string();
    data.fitting_requirements.ear_canal_suitability = Some(4);
    data.fitting_requirements.connectivity_needs = Some(4);
    data.fitting_requirements.rechargeable_preference = "rechargeable".to_string();
    data.fitting_requirements.bilateral_fitting = "bilateral".to_string();
    data.fitting_requirements.budget_range = "mid".to_string();

    // Expectations & Goals — all 4s
    data.expectations_goals.realistic_expectations = Some(4);
    data.expectations_goals.primary_goal = "conversation".to_string();
    data.expectations_goals.willingness_to_adapt = Some(4);
    data.expectations_goals.support_system = Some(4);
    data.expectations_goals.follow_up_commitment = Some(4);
    data.expectations_goals.overall_readiness = Some(4);

    // Trial Period — all 4s
    data.trial_period.trial_duration = "30days".to_string();
    data.trial_period.initial_comfort = Some(4);
    data.trial_period.sound_quality = Some(4);
    data.trial_period.feedback_management = Some(4);
    data.trial_period.daily_wear_compliance = Some(4);
    data.trial_period.reported_benefit = Some(4);

    // Clinical Review — all 4s
    data.clinical_review.aided_improvement = Some(4);
    data.clinical_review.patient_satisfaction = Some(4);
    data.clinical_review.recommendation_confidence = Some(4);
    data.clinical_review.additional_services_needed = "none".to_string();
    data.clinical_review.follow_up_plan = "3months".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_hearing_aid_level(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_moderate_for_all_fours() {
    let data = create_moderate_assessment();
    let (level, score, _fired_rules) = calculate_hearing_aid_level(&data);
    assert_eq!(level, "moderate");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn returns_minimal_for_all_fives() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 5
    data.communication_needs.quiet_conversation = Some(5);
    data.communication_needs.group_conversation = Some(5);
    data.communication_needs.telephone_use = Some(5);
    data.communication_needs.television_listening = Some(5);
    data.communication_needs.public_settings = Some(5);
    data.communication_needs.workplace_communication = Some(5);
    data.lifestyle_assessment.social_activity_level = Some(5);
    data.lifestyle_assessment.outdoor_activity_level = Some(5);
    data.lifestyle_assessment.technology_comfort = Some(5);
    data.lifestyle_assessment.manual_dexterity = Some(5);
    data.lifestyle_assessment.cosmetic_concern = Some(5);
    data.lifestyle_assessment.motivation_level = Some(5);
    data.fitting_requirements.ear_canal_suitability = Some(5);
    data.fitting_requirements.connectivity_needs = Some(5);
    data.expectations_goals.realistic_expectations = Some(5);
    data.expectations_goals.willingness_to_adapt = Some(5);
    data.expectations_goals.support_system = Some(5);
    data.expectations_goals.follow_up_commitment = Some(5);
    data.expectations_goals.overall_readiness = Some(5);
    data.trial_period.initial_comfort = Some(5);
    data.trial_period.sound_quality = Some(5);
    data.trial_period.feedback_management = Some(5);
    data.trial_period.daily_wear_compliance = Some(5);
    data.trial_period.reported_benefit = Some(5);
    data.clinical_review.aided_improvement = Some(5);
    data.clinical_review.patient_satisfaction = Some(5);
    data.clinical_review.recommendation_confidence = Some(5);

    let (level, score, _fired_rules) = calculate_hearing_aid_level(&data);
    assert_eq!(level, "minimal");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_profound_for_all_ones() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 1
    data.communication_needs.quiet_conversation = Some(1);
    data.communication_needs.group_conversation = Some(1);
    data.communication_needs.telephone_use = Some(1);
    data.communication_needs.television_listening = Some(1);
    data.communication_needs.public_settings = Some(1);
    data.communication_needs.workplace_communication = Some(1);
    data.lifestyle_assessment.social_activity_level = Some(1);
    data.lifestyle_assessment.outdoor_activity_level = Some(1);
    data.lifestyle_assessment.technology_comfort = Some(1);
    data.lifestyle_assessment.manual_dexterity = Some(1);
    data.lifestyle_assessment.cosmetic_concern = Some(1);
    data.lifestyle_assessment.motivation_level = Some(1);
    data.current_hearing_aids.satisfaction_with_current = Some(1);
    data.fitting_requirements.ear_canal_suitability = Some(1);
    data.fitting_requirements.connectivity_needs = Some(1);
    data.expectations_goals.realistic_expectations = Some(1);
    data.expectations_goals.willingness_to_adapt = Some(1);
    data.expectations_goals.support_system = Some(1);
    data.expectations_goals.follow_up_commitment = Some(1);
    data.expectations_goals.overall_readiness = Some(1);
    data.trial_period.initial_comfort = Some(1);
    data.trial_period.sound_quality = Some(1);
    data.trial_period.feedback_management = Some(1);
    data.trial_period.daily_wear_compliance = Some(1);
    data.trial_period.reported_benefit = Some(1);
    data.clinical_review.aided_improvement = Some(1);
    data.clinical_review.patient_satisfaction = Some(1);
    data.clinical_review.recommendation_confidence = Some(1);

    let (level, score, fired_rules) = calculate_hearing_aid_level(&data);
    assert_eq!(level, "profound");
    assert_eq!(score, 0.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_significant_for_all_twos() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 2
    data.communication_needs.quiet_conversation = Some(2);
    data.communication_needs.group_conversation = Some(2);
    data.communication_needs.telephone_use = Some(2);
    data.communication_needs.television_listening = Some(2);
    data.communication_needs.public_settings = Some(2);
    data.communication_needs.workplace_communication = Some(2);
    data.lifestyle_assessment.social_activity_level = Some(2);
    data.lifestyle_assessment.outdoor_activity_level = Some(2);
    data.lifestyle_assessment.technology_comfort = Some(2);
    data.lifestyle_assessment.manual_dexterity = Some(2);
    data.lifestyle_assessment.cosmetic_concern = Some(2);
    data.lifestyle_assessment.motivation_level = Some(2);
    data.fitting_requirements.ear_canal_suitability = Some(2);
    data.fitting_requirements.connectivity_needs = Some(2);
    data.expectations_goals.realistic_expectations = Some(2);
    data.expectations_goals.willingness_to_adapt = Some(2);
    data.expectations_goals.support_system = Some(2);
    data.expectations_goals.follow_up_commitment = Some(2);
    data.expectations_goals.overall_readiness = Some(2);
    data.trial_period.initial_comfort = Some(2);
    data.trial_period.sound_quality = Some(2);
    data.trial_period.feedback_management = Some(2);
    data.trial_period.daily_wear_compliance = Some(2);
    data.trial_period.reported_benefit = Some(2);
    data.clinical_review.aided_improvement = Some(2);
    data.clinical_review.patient_satisfaction = Some(2);
    data.clinical_review.recommendation_confidence = Some(2);

    let (level, score, _fired_rules) = calculate_hearing_aid_level(&data);
    assert_eq!(level, "significant");
    assert_eq!(score, 25.0); // (2-1)/4 * 100 = 25
}

#[test]
fn fires_severe_hearing_loss_rule() {
    let mut data = create_moderate_assessment();
    data.audiometric_results.right_ear_pta = Some(80);

    let (_level, _score, fired_rules) = calculate_hearing_aid_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HA-001"));
}

#[test]
fn fires_poor_speech_recognition_rule() {
    let mut data = create_moderate_assessment();
    data.audiometric_results.speech_recognition_left = Some(40);

    let (_level, _score, fired_rules) = calculate_hearing_aid_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HA-003"));
}

#[test]
fn fires_communication_concern_for_low_scores() {
    let mut data = create_moderate_assessment();
    // Set all communication items to 1 -> score = 0%
    data.communication_needs.quiet_conversation = Some(1);
    data.communication_needs.group_conversation = Some(1);
    data.communication_needs.telephone_use = Some(1);
    data.communication_needs.television_listening = Some(1);
    data.communication_needs.public_settings = Some(1);
    data.communication_needs.workplace_communication = Some(1);

    let (_level, _score, fired_rules) = calculate_hearing_aid_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HA-002")); // Communication below 40%
}

#[test]
fn fires_positive_rules_for_excellent_outcomes() {
    let mut data = create_moderate_assessment();
    data.clinical_review.patient_satisfaction = Some(5);
    data.trial_period.reported_benefit = Some(5);
    data.clinical_review.aided_improvement = Some(5);
    data.expectations_goals.overall_readiness = Some(5);

    // Set all communication to 5 for HA-020
    data.communication_needs.quiet_conversation = Some(5);
    data.communication_needs.group_conversation = Some(5);
    data.communication_needs.telephone_use = Some(5);
    data.communication_needs.television_listening = Some(5);
    data.communication_needs.public_settings = Some(5);
    data.communication_needs.workplace_communication = Some(5);

    let (_level, _score, fired_rules) = calculate_hearing_aid_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HA-016")); // Patient satisfaction 5
    assert!(fired_rules.iter().any(|r| r.id == "HA-017")); // Reported benefit 5
    assert!(fired_rules.iter().any(|r| r.id == "HA-018")); // Overall readiness 5
    assert!(fired_rules.iter().any(|r| r.id == "HA-019")); // Aided improvement 5
    assert!(fired_rules.iter().any(|r| r.id == "HA-020")); // All communication 4-5
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
fn returns_significant_for_all_threes() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 3
    data.communication_needs.quiet_conversation = Some(3);
    data.communication_needs.group_conversation = Some(3);
    data.communication_needs.telephone_use = Some(3);
    data.communication_needs.television_listening = Some(3);
    data.communication_needs.public_settings = Some(3);
    data.communication_needs.workplace_communication = Some(3);
    data.lifestyle_assessment.social_activity_level = Some(3);
    data.lifestyle_assessment.outdoor_activity_level = Some(3);
    data.lifestyle_assessment.technology_comfort = Some(3);
    data.lifestyle_assessment.manual_dexterity = Some(3);
    data.lifestyle_assessment.cosmetic_concern = Some(3);
    data.lifestyle_assessment.motivation_level = Some(3);
    data.fitting_requirements.ear_canal_suitability = Some(3);
    data.fitting_requirements.connectivity_needs = Some(3);
    data.expectations_goals.realistic_expectations = Some(3);
    data.expectations_goals.willingness_to_adapt = Some(3);
    data.expectations_goals.support_system = Some(3);
    data.expectations_goals.follow_up_commitment = Some(3);
    data.expectations_goals.overall_readiness = Some(3);
    data.trial_period.initial_comfort = Some(3);
    data.trial_period.sound_quality = Some(3);
    data.trial_period.feedback_management = Some(3);
    data.trial_period.daily_wear_compliance = Some(3);
    data.trial_period.reported_benefit = Some(3);
    data.clinical_review.aided_improvement = Some(3);
    data.clinical_review.patient_satisfaction = Some(3);
    data.clinical_review.recommendation_confidence = Some(3);

    let (level, score, _fired_rules) = calculate_hearing_aid_level(&data);
    assert_eq!(level, "significant");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}
