use kinesiology_assessment_tera_crate::engine::kinesiology_grader::calculate_impairment;
use kinesiology_assessment_tera_crate::engine::kinesiology_rules::all_rules;
use kinesiology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_good_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.sex = "female".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.referring_provider = "Dr Johnson".to_string();
    data.patient_information.primary_complaint = "Lower back pain".to_string();
    data.patient_information.onset_date = "2026-01-15".to_string();
    data.patient_information.mechanism_of_injury = "overuse".to_string();

    // Movement History — all 4s
    data.movement_history.activity_level = Some(4);
    data.movement_history.exercise_frequency = "3to4".to_string();
    data.movement_history.sport_participation = "Running".to_string();
    data.movement_history.occupational_demands = Some(4);
    data.movement_history.previous_injuries = "None".to_string();
    data.movement_history.surgical_history = "None".to_string();
    data.movement_history.daily_activity_limitation = Some(4);
    data.movement_history.sleep_quality = Some(4);

    // Postural Assessment — all 4s
    data.postural_assessment.head_alignment = Some(4);
    data.postural_assessment.shoulder_symmetry = Some(4);
    data.postural_assessment.spinal_curvature = Some(4);
    data.postural_assessment.pelvic_tilt = Some(4);
    data.postural_assessment.knee_alignment = Some(4);
    data.postural_assessment.foot_arch = Some(4);
    data.postural_assessment.overall_posture = Some(4);

    // Range of Motion — all 4s
    data.range_of_motion.cervical_flexion = Some(4);
    data.range_of_motion.cervical_rotation = Some(4);
    data.range_of_motion.shoulder_flexion = Some(4);
    data.range_of_motion.shoulder_abduction = Some(4);
    data.range_of_motion.lumbar_flexion = Some(4);
    data.range_of_motion.lumbar_extension = Some(4);
    data.range_of_motion.hip_flexion = Some(4);
    data.range_of_motion.knee_flexion = Some(4);

    // Muscle Strength Testing — all 4s
    data.muscle_strength_testing.upper_extremity_strength = Some(4);
    data.muscle_strength_testing.lower_extremity_strength = Some(4);
    data.muscle_strength_testing.core_stability = Some(4);
    data.muscle_strength_testing.grip_strength = Some(4);
    data.muscle_strength_testing.bilateral_symmetry = Some(4);
    data.muscle_strength_testing.muscle_endurance = Some(4);
    data.muscle_strength_testing.functional_strength = Some(4);

    // Gait Analysis — all 4s
    data.gait_analysis.stride_symmetry = Some(4);
    data.gait_analysis.cadence = Some(4);
    data.gait_analysis.heel_strike_pattern = Some(4);
    data.gait_analysis.toe_off_pattern = Some(4);
    data.gait_analysis.arm_swing = Some(4);
    data.gait_analysis.balance_during_gait = Some(4);
    data.gait_analysis.assistive_device_used = "none".to_string();

    // Functional Testing — all 4s
    data.functional_testing.sit_to_stand = Some(4);
    data.functional_testing.single_leg_balance = Some(4);
    data.functional_testing.squat_quality = Some(4);
    data.functional_testing.lunge_quality = Some(4);
    data.functional_testing.push_up_quality = Some(4);
    data.functional_testing.overhead_reach = Some(4);
    data.functional_testing.step_up_quality = Some(4);

    // Pain Assessment — low pain
    data.pain_assessment.pain_severity = Some(2);
    data.pain_assessment.pain_location = "Lower back".to_string();
    data.pain_assessment.pain_type = "dull".to_string();
    data.pain_assessment.pain_with_movement = Some(2);
    data.pain_assessment.pain_at_rest = Some(1);
    data.pain_assessment.pain_frequency = "occasional".to_string();
    data.pain_assessment.aggravating_factors = "Prolonged sitting".to_string();
    data.pain_assessment.relieving_factors = "Stretching".to_string();

    // Exercise Prescription — all 4s
    data.exercise_prescription.exercise_tolerance = Some(4);
    data.exercise_prescription.cardiovascular_fitness = Some(4);
    data.exercise_prescription.flexibility_level = Some(4);
    data.exercise_prescription.motivation_level = Some(4);
    data.exercise_prescription.home_exercise_compliance = Some(4);
    data.exercise_prescription.equipment_access = "fullGym".to_string();
    data.exercise_prescription.exercise_goals = "Return to running".to_string();

    // Clinical Review — all 4s
    data.clinical_review.overall_functional_status = Some(4);
    data.clinical_review.treatment_response = Some(4);
    data.clinical_review.prognosis_rating = Some(4);
    data.clinical_review.follow_up_needed = "yes".to_string();
    data.clinical_review.referral_recommended = "no".to_string();
    data.clinical_review.clinician_notes = "Good progress".to_string();
    data.clinical_review.patient_goals = "Return to full activity".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_mild_impairment_for_all_fours() {
    let data = create_good_assessment();
    let (level, score, _fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "mildImpairment");
    assert_eq!(score, 72.0); // Most items are 4, pain items are 2/2/1, avg ≈ 3.86 → 72
}

#[test]
fn returns_optimal_for_all_fives() {
    let mut data = create_good_assessment();
    // Set all Likert items to 5
    data.movement_history.activity_level = Some(5);
    data.movement_history.occupational_demands = Some(5);
    data.movement_history.daily_activity_limitation = Some(5);
    data.movement_history.sleep_quality = Some(5);
    data.postural_assessment.head_alignment = Some(5);
    data.postural_assessment.shoulder_symmetry = Some(5);
    data.postural_assessment.spinal_curvature = Some(5);
    data.postural_assessment.pelvic_tilt = Some(5);
    data.postural_assessment.knee_alignment = Some(5);
    data.postural_assessment.foot_arch = Some(5);
    data.postural_assessment.overall_posture = Some(5);
    data.range_of_motion.cervical_flexion = Some(5);
    data.range_of_motion.cervical_rotation = Some(5);
    data.range_of_motion.shoulder_flexion = Some(5);
    data.range_of_motion.shoulder_abduction = Some(5);
    data.range_of_motion.lumbar_flexion = Some(5);
    data.range_of_motion.lumbar_extension = Some(5);
    data.range_of_motion.hip_flexion = Some(5);
    data.range_of_motion.knee_flexion = Some(5);
    data.muscle_strength_testing.upper_extremity_strength = Some(5);
    data.muscle_strength_testing.lower_extremity_strength = Some(5);
    data.muscle_strength_testing.core_stability = Some(5);
    data.muscle_strength_testing.grip_strength = Some(5);
    data.muscle_strength_testing.bilateral_symmetry = Some(5);
    data.muscle_strength_testing.muscle_endurance = Some(5);
    data.muscle_strength_testing.functional_strength = Some(5);
    data.gait_analysis.stride_symmetry = Some(5);
    data.gait_analysis.cadence = Some(5);
    data.gait_analysis.heel_strike_pattern = Some(5);
    data.gait_analysis.toe_off_pattern = Some(5);
    data.gait_analysis.arm_swing = Some(5);
    data.gait_analysis.balance_during_gait = Some(5);
    data.functional_testing.sit_to_stand = Some(5);
    data.functional_testing.single_leg_balance = Some(5);
    data.functional_testing.squat_quality = Some(5);
    data.functional_testing.lunge_quality = Some(5);
    data.functional_testing.push_up_quality = Some(5);
    data.functional_testing.overhead_reach = Some(5);
    data.functional_testing.step_up_quality = Some(5);
    data.pain_assessment.pain_severity = Some(5);
    data.pain_assessment.pain_with_movement = Some(5);
    data.pain_assessment.pain_at_rest = Some(5);
    data.exercise_prescription.exercise_tolerance = Some(5);
    data.exercise_prescription.cardiovascular_fitness = Some(5);
    data.exercise_prescription.flexibility_level = Some(5);
    data.exercise_prescription.motivation_level = Some(5);
    data.exercise_prescription.home_exercise_compliance = Some(5);
    data.clinical_review.overall_functional_status = Some(5);
    data.clinical_review.treatment_response = Some(5);
    data.clinical_review.prognosis_rating = Some(5);

    let (level, score, _fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "optimal");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_severe_impairment_for_all_ones() {
    let mut data = create_good_assessment();
    // Set all Likert items to 1
    data.movement_history.activity_level = Some(1);
    data.movement_history.occupational_demands = Some(1);
    data.movement_history.daily_activity_limitation = Some(1);
    data.movement_history.sleep_quality = Some(1);
    data.postural_assessment.head_alignment = Some(1);
    data.postural_assessment.shoulder_symmetry = Some(1);
    data.postural_assessment.spinal_curvature = Some(1);
    data.postural_assessment.pelvic_tilt = Some(1);
    data.postural_assessment.knee_alignment = Some(1);
    data.postural_assessment.foot_arch = Some(1);
    data.postural_assessment.overall_posture = Some(1);
    data.range_of_motion.cervical_flexion = Some(1);
    data.range_of_motion.cervical_rotation = Some(1);
    data.range_of_motion.shoulder_flexion = Some(1);
    data.range_of_motion.shoulder_abduction = Some(1);
    data.range_of_motion.lumbar_flexion = Some(1);
    data.range_of_motion.lumbar_extension = Some(1);
    data.range_of_motion.hip_flexion = Some(1);
    data.range_of_motion.knee_flexion = Some(1);
    data.muscle_strength_testing.upper_extremity_strength = Some(1);
    data.muscle_strength_testing.lower_extremity_strength = Some(1);
    data.muscle_strength_testing.core_stability = Some(1);
    data.muscle_strength_testing.grip_strength = Some(1);
    data.muscle_strength_testing.bilateral_symmetry = Some(1);
    data.muscle_strength_testing.muscle_endurance = Some(1);
    data.muscle_strength_testing.functional_strength = Some(1);
    data.gait_analysis.stride_symmetry = Some(1);
    data.gait_analysis.cadence = Some(1);
    data.gait_analysis.heel_strike_pattern = Some(1);
    data.gait_analysis.toe_off_pattern = Some(1);
    data.gait_analysis.arm_swing = Some(1);
    data.gait_analysis.balance_during_gait = Some(1);
    data.functional_testing.sit_to_stand = Some(1);
    data.functional_testing.single_leg_balance = Some(1);
    data.functional_testing.squat_quality = Some(1);
    data.functional_testing.lunge_quality = Some(1);
    data.functional_testing.push_up_quality = Some(1);
    data.functional_testing.overhead_reach = Some(1);
    data.functional_testing.step_up_quality = Some(1);
    data.pain_assessment.pain_severity = Some(1);
    data.pain_assessment.pain_with_movement = Some(1);
    data.pain_assessment.pain_at_rest = Some(1);
    data.exercise_prescription.exercise_tolerance = Some(1);
    data.exercise_prescription.cardiovascular_fitness = Some(1);
    data.exercise_prescription.flexibility_level = Some(1);
    data.exercise_prescription.motivation_level = Some(1);
    data.exercise_prescription.home_exercise_compliance = Some(1);
    data.clinical_review.overall_functional_status = Some(1);
    data.clinical_review.treatment_response = Some(1);
    data.clinical_review.prognosis_rating = Some(1);

    let (level, score, fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "severeImpairment");
    assert_eq!(score, 0.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_moderate_impairment_for_all_threes() {
    let mut data = create_good_assessment();
    // Set all Likert items to 3
    data.movement_history.activity_level = Some(3);
    data.movement_history.occupational_demands = Some(3);
    data.movement_history.daily_activity_limitation = Some(3);
    data.movement_history.sleep_quality = Some(3);
    data.postural_assessment.head_alignment = Some(3);
    data.postural_assessment.shoulder_symmetry = Some(3);
    data.postural_assessment.spinal_curvature = Some(3);
    data.postural_assessment.pelvic_tilt = Some(3);
    data.postural_assessment.knee_alignment = Some(3);
    data.postural_assessment.foot_arch = Some(3);
    data.postural_assessment.overall_posture = Some(3);
    data.range_of_motion.cervical_flexion = Some(3);
    data.range_of_motion.cervical_rotation = Some(3);
    data.range_of_motion.shoulder_flexion = Some(3);
    data.range_of_motion.shoulder_abduction = Some(3);
    data.range_of_motion.lumbar_flexion = Some(3);
    data.range_of_motion.lumbar_extension = Some(3);
    data.range_of_motion.hip_flexion = Some(3);
    data.range_of_motion.knee_flexion = Some(3);
    data.muscle_strength_testing.upper_extremity_strength = Some(3);
    data.muscle_strength_testing.lower_extremity_strength = Some(3);
    data.muscle_strength_testing.core_stability = Some(3);
    data.muscle_strength_testing.grip_strength = Some(3);
    data.muscle_strength_testing.bilateral_symmetry = Some(3);
    data.muscle_strength_testing.muscle_endurance = Some(3);
    data.muscle_strength_testing.functional_strength = Some(3);
    data.gait_analysis.stride_symmetry = Some(3);
    data.gait_analysis.cadence = Some(3);
    data.gait_analysis.heel_strike_pattern = Some(3);
    data.gait_analysis.toe_off_pattern = Some(3);
    data.gait_analysis.arm_swing = Some(3);
    data.gait_analysis.balance_during_gait = Some(3);
    data.functional_testing.sit_to_stand = Some(3);
    data.functional_testing.single_leg_balance = Some(3);
    data.functional_testing.squat_quality = Some(3);
    data.functional_testing.lunge_quality = Some(3);
    data.functional_testing.push_up_quality = Some(3);
    data.functional_testing.overhead_reach = Some(3);
    data.functional_testing.step_up_quality = Some(3);
    data.pain_assessment.pain_severity = Some(3);
    data.pain_assessment.pain_with_movement = Some(3);
    data.pain_assessment.pain_at_rest = Some(3);
    data.exercise_prescription.exercise_tolerance = Some(3);
    data.exercise_prescription.cardiovascular_fitness = Some(3);
    data.exercise_prescription.flexibility_level = Some(3);
    data.exercise_prescription.motivation_level = Some(3);
    data.exercise_prescription.home_exercise_compliance = Some(3);
    data.clinical_review.overall_functional_status = Some(3);
    data.clinical_review.treatment_response = Some(3);
    data.clinical_review.prognosis_rating = Some(3);

    let (level, score, _fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "moderateImpairment");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn fires_extreme_pain_rule() {
    let mut data = create_good_assessment();
    data.pain_assessment.pain_severity = Some(5);

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "KIN-002"));
}

#[test]
fn fires_balance_fall_risk_rule() {
    let mut data = create_good_assessment();
    data.gait_analysis.balance_during_gait = Some(1);

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "KIN-005"));
}

#[test]
fn fires_positive_strength_rule_for_excellent() {
    let mut data = create_good_assessment();
    // Set all muscle strength items to 5
    data.muscle_strength_testing.upper_extremity_strength = Some(5);
    data.muscle_strength_testing.lower_extremity_strength = Some(5);
    data.muscle_strength_testing.core_stability = Some(5);
    data.muscle_strength_testing.grip_strength = Some(5);
    data.muscle_strength_testing.bilateral_symmetry = Some(5);
    data.muscle_strength_testing.muscle_endurance = Some(5);
    data.muscle_strength_testing.functional_strength = Some(5);

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "KIN-017"));
}

#[test]
fn fires_core_stability_concern() {
    let mut data = create_good_assessment();
    data.muscle_strength_testing.core_stability = Some(1);

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "KIN-010"));
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
