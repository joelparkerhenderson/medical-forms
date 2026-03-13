use kinesiology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use kinesiology_assessment_tera_crate::engine::types::*;

fn create_good_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.primary_complaint = "Lower back pain".to_string();

    data.movement_history.activity_level = Some(4);
    data.movement_history.occupational_demands = Some(4);
    data.movement_history.daily_activity_limitation = Some(4);
    data.movement_history.sleep_quality = Some(4);

    data.postural_assessment.head_alignment = Some(4);
    data.postural_assessment.shoulder_symmetry = Some(4);
    data.postural_assessment.spinal_curvature = Some(4);
    data.postural_assessment.pelvic_tilt = Some(4);
    data.postural_assessment.knee_alignment = Some(4);
    data.postural_assessment.foot_arch = Some(4);
    data.postural_assessment.overall_posture = Some(4);

    data.range_of_motion.cervical_flexion = Some(4);
    data.range_of_motion.cervical_rotation = Some(4);
    data.range_of_motion.shoulder_flexion = Some(4);
    data.range_of_motion.shoulder_abduction = Some(4);
    data.range_of_motion.lumbar_flexion = Some(4);
    data.range_of_motion.lumbar_extension = Some(4);
    data.range_of_motion.hip_flexion = Some(4);
    data.range_of_motion.knee_flexion = Some(4);

    data.muscle_strength_testing.upper_extremity_strength = Some(4);
    data.muscle_strength_testing.lower_extremity_strength = Some(4);
    data.muscle_strength_testing.core_stability = Some(4);
    data.muscle_strength_testing.grip_strength = Some(4);
    data.muscle_strength_testing.bilateral_symmetry = Some(4);
    data.muscle_strength_testing.muscle_endurance = Some(4);
    data.muscle_strength_testing.functional_strength = Some(4);

    data.gait_analysis.stride_symmetry = Some(4);
    data.gait_analysis.cadence = Some(4);
    data.gait_analysis.heel_strike_pattern = Some(4);
    data.gait_analysis.toe_off_pattern = Some(4);
    data.gait_analysis.arm_swing = Some(4);
    data.gait_analysis.balance_during_gait = Some(4);
    data.gait_analysis.assistive_device_used = "none".to_string();

    data.functional_testing.sit_to_stand = Some(4);
    data.functional_testing.single_leg_balance = Some(4);
    data.functional_testing.squat_quality = Some(4);
    data.functional_testing.lunge_quality = Some(4);
    data.functional_testing.push_up_quality = Some(4);
    data.functional_testing.overhead_reach = Some(4);
    data.functional_testing.step_up_quality = Some(4);

    data.pain_assessment.pain_severity = Some(2);
    data.pain_assessment.pain_with_movement = Some(2);
    data.pain_assessment.pain_at_rest = Some(1);

    data.exercise_prescription.exercise_tolerance = Some(4);
    data.exercise_prescription.cardiovascular_fitness = Some(4);
    data.exercise_prescription.flexibility_level = Some(4);
    data.exercise_prescription.motivation_level = Some(4);
    data.exercise_prescription.home_exercise_compliance = Some(4);

    data.clinical_review.overall_functional_status = Some(4);
    data.clinical_review.treatment_response = Some(4);
    data.clinical_review.prognosis_rating = Some(4);
    data.clinical_review.follow_up_needed = "yes".to_string();
    data.clinical_review.referral_recommended = "no".to_string();

    data
}

#[test]
fn no_flags_for_good_assessment() {
    let data = create_good_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_severe_pain_at_rest() {
    let mut data = create_good_assessment();
    data.pain_assessment.pain_at_rest = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_extreme_pain_with_movement() {
    let mut data = create_good_assessment();
    data.pain_assessment.pain_with_movement = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-002"));
}

#[test]
fn flags_fall_risk_from_balance() {
    let mut data = create_good_assessment();
    data.gait_analysis.balance_during_gait = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GAIT-001"));
}

#[test]
fn flags_bilateral_asymmetry() {
    let mut data = create_good_assessment();
    data.muscle_strength_testing.bilateral_symmetry = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-STR-001"));
}

#[test]
fn flags_poor_core_stability() {
    let mut data = create_good_assessment();
    data.muscle_strength_testing.core_stability = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-STR-002"));
}

#[test]
fn flags_referral_recommended() {
    let mut data = create_good_assessment();
    data.clinical_review.referral_recommended = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CLIN-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_good_assessment();
    // Create flags of different priorities
    data.gait_analysis.balance_during_gait = Some(1); // high
    data.gait_analysis.stride_symmetry = Some(2); // medium
    data.movement_history.sleep_quality = Some(1); // medium
    data.clinical_review.referral_recommended = "yes".to_string(); // medium

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
