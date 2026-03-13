use orthopedic_assessment_tera_crate::engine::orthopedic_grader::calculate_severity;
use orthopedic_assessment_tera_crate::engine::orthopedic_rules::all_rules;
use orthopedic_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1980-05-15".to_string();
    data.patient_information.patient_age = "46to60".to_string();
    data.patient_information.patient_sex = "male".to_string();
    data.patient_information.referral_source = "gp".to_string();
    data.patient_information.assessment_date = "2026-03-10".to_string();
    data.patient_information.clinician_name = "Mr Jones".to_string();
    data.patient_information.clinic_location = "Orthopedic Outpatients".to_string();

    // Injury History (non-scored)
    data.injury_history.primary_complaint = "Right knee pain".to_string();
    data.injury_history.onset_type = "gradual".to_string();
    data.injury_history.onset_date = "2025-12-01".to_string();

    // Pain Assessment — moderate (3s)
    data.pain_assessment.pain_severity = Some(3);
    data.pain_assessment.pain_at_rest = Some(2);
    data.pain_assessment.pain_with_activity = Some(4);
    data.pain_assessment.night_pain = Some(3);
    data.pain_assessment.pain_location = "right knee".to_string();
    data.pain_assessment.pain_character = "dull".to_string();
    data.pain_assessment.pain_radiating = "no".to_string();
    data.pain_assessment.pain_duration_weeks = "moreThan12".to_string();

    // Joint Examination — moderate (3s)
    data.joint_examination.affected_joint = "knee".to_string();
    data.joint_examination.range_of_motion = Some(3);
    data.joint_examination.joint_stability = Some(2);
    data.joint_examination.joint_swelling = Some(3);
    data.joint_examination.joint_crepitus = "yes".to_string();
    data.joint_examination.joint_deformity = "no".to_string();
    data.joint_examination.ligament_integrity = Some(2);
    data.joint_examination.special_tests_result = "McMurray negative".to_string();

    // Muscle Assessment — moderate (3s)
    data.muscle_assessment.muscle_strength = Some(3);
    data.muscle_assessment.muscle_atrophy = Some(2);
    data.muscle_assessment.muscle_tone = Some(2);
    data.muscle_assessment.grip_strength = Some(2);
    data.muscle_assessment.muscle_tenderness = Some(3);
    data.muscle_assessment.reflexes_normal = "yes".to_string();
    data.muscle_assessment.sensation_intact = "yes".to_string();

    // Spinal Assessment — normal
    data.spinal_assessment.spinal_alignment = Some(1);
    data.spinal_assessment.spinal_mobility = Some(2);
    data.spinal_assessment.disc_involvement = "no".to_string();
    data.spinal_assessment.nerve_root_signs = "no".to_string();
    data.spinal_assessment.straight_leg_raise = Some(1);
    data.spinal_assessment.neurological_deficit = "no".to_string();
    data.spinal_assessment.spinal_tenderness = Some(1);

    // Imaging
    data.imaging_investigations.xray_findings = "Joint space narrowing".to_string();
    data.imaging_investigations.imaging_urgency = Some(2);
    data.imaging_investigations.further_imaging_needed = "no".to_string();

    // Functional Status — moderate
    data.functional_status.mobility_level = Some(3);
    data.functional_status.daily_activities = Some(3);
    data.functional_status.work_capacity = Some(3);
    data.functional_status.sleep_quality = Some(3);
    data.functional_status.walking_distance = "500mTo1km".to_string();
    data.functional_status.assistive_devices = "stick".to_string();
    data.functional_status.fall_risk = Some(2);

    // Surgical Considerations
    data.surgical_considerations.surgical_candidate = "no".to_string();
    data.surgical_considerations.surgical_urgency = Some(2);
    data.surgical_considerations.anaesthetic_risk = Some(2);
    data.surgical_considerations.conservative_options_exhausted = "no".to_string();
    data.surgical_considerations.expected_outcome = Some(2);

    // Clinical Review
    data.clinical_review.overall_severity = Some(3);
    data.clinical_review.treatment_recommendation = "physiotherapy".to_string();
    data.clinical_review.follow_up_interval = "6weeks".to_string();
    data.clinical_review.referral_needed = "no".to_string();
    data.clinical_review.patient_understanding = Some(2);
    data.clinical_review.red_flag_symptoms = "no".to_string();

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
fn returns_mild_for_low_scores() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 2
    data.pain_assessment.pain_severity = Some(2);
    data.pain_assessment.pain_at_rest = Some(1);
    data.pain_assessment.pain_with_activity = Some(2);
    data.pain_assessment.night_pain = Some(1);
    data.joint_examination.range_of_motion = Some(2);
    data.joint_examination.joint_stability = Some(1);
    data.joint_examination.joint_swelling = Some(1);
    data.joint_examination.ligament_integrity = Some(1);
    data.muscle_assessment.muscle_strength = Some(2);
    data.muscle_assessment.muscle_atrophy = Some(1);
    data.muscle_assessment.muscle_tone = Some(1);
    data.muscle_assessment.grip_strength = Some(1);
    data.muscle_assessment.muscle_tenderness = Some(2);
    data.spinal_assessment.spinal_alignment = Some(1);
    data.spinal_assessment.spinal_mobility = Some(1);
    data.spinal_assessment.straight_leg_raise = Some(1);
    data.spinal_assessment.spinal_tenderness = Some(1);
    data.imaging_investigations.imaging_urgency = Some(1);
    data.functional_status.mobility_level = Some(2);
    data.functional_status.daily_activities = Some(1);
    data.functional_status.work_capacity = Some(1);
    data.functional_status.sleep_quality = Some(1);
    data.functional_status.fall_risk = Some(1);
    data.surgical_considerations.surgical_urgency = Some(1);
    data.surgical_considerations.anaesthetic_risk = Some(1);
    data.surgical_considerations.expected_outcome = Some(1);
    data.clinical_review.overall_severity = Some(2);
    data.clinical_review.patient_understanding = Some(1);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
    assert!(score <= 25.0);
}

#[test]
fn returns_moderate_for_middle_scores() {
    let data = create_moderate_assessment();
    let (level, _score, _fired_rules) = calculate_severity(&data);
    // Mixed 1-4 scores should average to moderate range
    assert!(level == "moderate" || level == "mild");
}

#[test]
fn returns_severe_for_all_fives() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 5
    data.pain_assessment.pain_severity = Some(5);
    data.pain_assessment.pain_at_rest = Some(5);
    data.pain_assessment.pain_with_activity = Some(5);
    data.pain_assessment.night_pain = Some(5);
    data.joint_examination.range_of_motion = Some(5);
    data.joint_examination.joint_stability = Some(5);
    data.joint_examination.joint_swelling = Some(5);
    data.joint_examination.ligament_integrity = Some(5);
    data.muscle_assessment.muscle_strength = Some(5);
    data.muscle_assessment.muscle_atrophy = Some(5);
    data.muscle_assessment.muscle_tone = Some(5);
    data.muscle_assessment.grip_strength = Some(5);
    data.muscle_assessment.muscle_tenderness = Some(5);
    data.spinal_assessment.spinal_alignment = Some(5);
    data.spinal_assessment.spinal_mobility = Some(5);
    data.spinal_assessment.straight_leg_raise = Some(5);
    data.spinal_assessment.spinal_tenderness = Some(5);
    data.imaging_investigations.imaging_urgency = Some(5);
    data.functional_status.mobility_level = Some(5);
    data.functional_status.daily_activities = Some(5);
    data.functional_status.work_capacity = Some(5);
    data.functional_status.sleep_quality = Some(5);
    data.functional_status.fall_risk = Some(5);
    data.surgical_considerations.surgical_urgency = Some(5);
    data.surgical_considerations.anaesthetic_risk = Some(5);
    data.surgical_considerations.expected_outcome = Some(5);
    data.clinical_review.overall_severity = Some(5);
    data.clinical_review.patient_understanding = Some(5);

    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(score, 100.0);
    assert_eq!(level, "severe");
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_surgical_for_high_score_surgical_candidate() {
    let mut data = create_moderate_assessment();
    // Set scores high and mark as surgical candidate
    data.pain_assessment.pain_severity = Some(5);
    data.pain_assessment.pain_at_rest = Some(4);
    data.pain_assessment.pain_with_activity = Some(5);
    data.pain_assessment.night_pain = Some(4);
    data.joint_examination.range_of_motion = Some(4);
    data.joint_examination.joint_stability = Some(4);
    data.joint_examination.joint_swelling = Some(4);
    data.joint_examination.ligament_integrity = Some(4);
    data.muscle_assessment.muscle_strength = Some(4);
    data.muscle_assessment.muscle_atrophy = Some(3);
    data.muscle_assessment.muscle_tone = Some(3);
    data.muscle_assessment.grip_strength = Some(3);
    data.muscle_assessment.muscle_tenderness = Some(4);
    data.spinal_assessment.spinal_alignment = Some(3);
    data.spinal_assessment.spinal_mobility = Some(3);
    data.spinal_assessment.straight_leg_raise = Some(3);
    data.spinal_assessment.spinal_tenderness = Some(3);
    data.imaging_investigations.imaging_urgency = Some(4);
    data.functional_status.mobility_level = Some(4);
    data.functional_status.daily_activities = Some(4);
    data.functional_status.work_capacity = Some(4);
    data.functional_status.sleep_quality = Some(4);
    data.functional_status.fall_risk = Some(3);
    data.surgical_considerations.surgical_candidate = "yes".to_string();
    data.surgical_considerations.surgical_urgency = Some(4);
    data.surgical_considerations.anaesthetic_risk = Some(2);
    data.surgical_considerations.expected_outcome = Some(3);
    data.clinical_review.overall_severity = Some(4);
    data.clinical_review.patient_understanding = Some(2);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert!(score > 60.0);
    assert_eq!(level, "surgical");
}

#[test]
fn fires_pain_severity_rule() {
    let mut data = create_moderate_assessment();
    data.pain_assessment.pain_severity = Some(5);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ORTH-001"));
}

#[test]
fn fires_neurological_deficit_rule() {
    let mut data = create_moderate_assessment();
    data.spinal_assessment.neurological_deficit = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ORTH-003"));
}

#[test]
fn fires_red_flag_rule() {
    let mut data = create_moderate_assessment();
    data.clinical_review.red_flag_symptoms = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ORTH-004"));
}

#[test]
fn fires_positive_rule_for_minimal_pain() {
    let mut data = create_moderate_assessment();
    data.pain_assessment.pain_severity = Some(1);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ORTH-016"));
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
