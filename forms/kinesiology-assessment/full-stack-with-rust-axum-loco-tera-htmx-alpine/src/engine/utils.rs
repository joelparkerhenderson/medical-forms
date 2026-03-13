use super::types::AssessmentData;

/// Returns a human-readable label for an impairment level.
pub fn impairment_level_label(level: &str) -> &str {
    match level {
        "optimal" => "Optimal",
        "mildImpairment" => "Mild Impairment",
        "moderateImpairment" => "Moderate Impairment",
        "severeImpairment" => "Severe Impairment",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Movement History (3 Likert items)
        data.movement_history.activity_level,
        data.movement_history.occupational_demands,
        data.movement_history.daily_activity_limitation,
        data.movement_history.sleep_quality,
        // Postural Assessment (7 Likert items)
        data.postural_assessment.head_alignment,
        data.postural_assessment.shoulder_symmetry,
        data.postural_assessment.spinal_curvature,
        data.postural_assessment.pelvic_tilt,
        data.postural_assessment.knee_alignment,
        data.postural_assessment.foot_arch,
        data.postural_assessment.overall_posture,
        // Range of Motion (8 Likert items)
        data.range_of_motion.cervical_flexion,
        data.range_of_motion.cervical_rotation,
        data.range_of_motion.shoulder_flexion,
        data.range_of_motion.shoulder_abduction,
        data.range_of_motion.lumbar_flexion,
        data.range_of_motion.lumbar_extension,
        data.range_of_motion.hip_flexion,
        data.range_of_motion.knee_flexion,
        // Muscle Strength Testing (7 Likert items)
        data.muscle_strength_testing.upper_extremity_strength,
        data.muscle_strength_testing.lower_extremity_strength,
        data.muscle_strength_testing.core_stability,
        data.muscle_strength_testing.grip_strength,
        data.muscle_strength_testing.bilateral_symmetry,
        data.muscle_strength_testing.muscle_endurance,
        data.muscle_strength_testing.functional_strength,
        // Gait Analysis (6 Likert items)
        data.gait_analysis.stride_symmetry,
        data.gait_analysis.cadence,
        data.gait_analysis.heel_strike_pattern,
        data.gait_analysis.toe_off_pattern,
        data.gait_analysis.arm_swing,
        data.gait_analysis.balance_during_gait,
        // Functional Testing (7 Likert items)
        data.functional_testing.sit_to_stand,
        data.functional_testing.single_leg_balance,
        data.functional_testing.squat_quality,
        data.functional_testing.lunge_quality,
        data.functional_testing.push_up_quality,
        data.functional_testing.overhead_reach,
        data.functional_testing.step_up_quality,
        // Pain Assessment (3 Likert items)
        data.pain_assessment.pain_severity,
        data.pain_assessment.pain_with_movement,
        data.pain_assessment.pain_at_rest,
        // Exercise Prescription (5 Likert items)
        data.exercise_prescription.exercise_tolerance,
        data.exercise_prescription.cardiovascular_fitness,
        data.exercise_prescription.flexibility_level,
        data.exercise_prescription.motivation_level,
        data.exercise_prescription.home_exercise_compliance,
        // Clinical Review (3 Likert items)
        data.clinical_review.overall_functional_status,
        data.clinical_review.treatment_response,
        data.clinical_review.prognosis_rating,
    ]
}

/// Calculate the composite impairment score (0-100) from all answered Likert items.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_likert_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    // Convert 1-5 scale to 0-100
    let score = ((avg - 1.0) / 4.0) * 100.0;
    Some(score.round())
}

/// Calculate the dimension score (0-100) for a set of Likert items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 4.0) * 100.0)
}

/// Get the postural assessment dimension score.
pub fn postural_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.postural_assessment.head_alignment,
        data.postural_assessment.shoulder_symmetry,
        data.postural_assessment.spinal_curvature,
        data.postural_assessment.pelvic_tilt,
        data.postural_assessment.knee_alignment,
        data.postural_assessment.foot_arch,
        data.postural_assessment.overall_posture,
    ])
}

/// Get the muscle strength dimension score.
pub fn muscle_strength_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.muscle_strength_testing.upper_extremity_strength,
        data.muscle_strength_testing.lower_extremity_strength,
        data.muscle_strength_testing.core_stability,
        data.muscle_strength_testing.grip_strength,
        data.muscle_strength_testing.bilateral_symmetry,
        data.muscle_strength_testing.muscle_endurance,
        data.muscle_strength_testing.functional_strength,
    ])
}

/// Get the range of motion dimension score.
pub fn range_of_motion_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.range_of_motion.cervical_flexion,
        data.range_of_motion.cervical_rotation,
        data.range_of_motion.shoulder_flexion,
        data.range_of_motion.shoulder_abduction,
        data.range_of_motion.lumbar_flexion,
        data.range_of_motion.lumbar_extension,
        data.range_of_motion.hip_flexion,
        data.range_of_motion.knee_flexion,
    ])
}

/// Get the functional testing dimension score.
pub fn functional_testing_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.functional_testing.sit_to_stand,
        data.functional_testing.single_leg_balance,
        data.functional_testing.squat_quality,
        data.functional_testing.lunge_quality,
        data.functional_testing.push_up_quality,
        data.functional_testing.overhead_reach,
        data.functional_testing.step_up_quality,
    ])
}

/// Get the gait analysis dimension score.
pub fn gait_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.gait_analysis.stride_symmetry,
        data.gait_analysis.cadence,
        data.gait_analysis.heel_strike_pattern,
        data.gait_analysis.toe_off_pattern,
        data.gait_analysis.arm_swing,
        data.gait_analysis.balance_during_gait,
    ])
}

/// Pain severity category from pain_severity (1-5).
pub fn pain_category(score: Option<u8>) -> &'static str {
    match score {
        Some(1) => "minimal",
        Some(2) => "mild",
        Some(3) => "moderate",
        Some(4) => "severe",
        Some(5) => "extreme",
        _ => "unknown",
    }
}
