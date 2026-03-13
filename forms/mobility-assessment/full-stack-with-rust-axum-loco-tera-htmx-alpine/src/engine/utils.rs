use super::types::AssessmentData;

/// Returns a human-readable label for a mobility level.
pub fn mobility_level_label(level: &str) -> &str {
    match level {
        "independent" => "Independent",
        "minimalAssistance" => "Minimal Assistance",
        "moderateAssistance" => "Moderate Assistance",
        "maximalAssistance" => "Maximal Assistance",
        "dependent" => "Dependent",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Mobility History (4 Likert items)
        data.mobility_history.pre_morbid_mobility,
        data.mobility_history.current_mobility_level,
        data.mobility_history.pain_with_movement,
        data.mobility_history.endurance_level,
        // Balance Assessment (6 Likert items)
        data.balance_assessment.static_sitting_balance,
        data.balance_assessment.dynamic_sitting_balance,
        data.balance_assessment.static_standing_balance,
        data.balance_assessment.dynamic_standing_balance,
        data.balance_assessment.single_leg_stance,
        data.balance_assessment.tandem_stance,
        // Gait Analysis (6 Likert items)
        data.gait_analysis.gait_pattern_quality,
        data.gait_analysis.gait_speed,
        data.gait_analysis.step_length_symmetry,
        data.gait_analysis.turning_ability,
        data.gait_analysis.outdoor_walking,
        data.gait_analysis.walking_endurance,
        // Transfers & Bed Mobility (6 Likert items)
        data.transfers_bed_mobility.bed_mobility,
        data.transfers_bed_mobility.sit_to_stand,
        data.transfers_bed_mobility.stand_to_sit,
        data.transfers_bed_mobility.chair_transfer,
        data.transfers_bed_mobility.toilet_transfer,
        data.transfers_bed_mobility.car_transfer,
        // Stairs & Obstacles (6 Likert items)
        data.stairs_obstacles.stair_ascent,
        data.stairs_obstacles.stair_descent,
        data.stairs_obstacles.curb_negotiation,
        data.stairs_obstacles.uneven_surfaces,
        data.stairs_obstacles.obstacle_avoidance,
        data.stairs_obstacles.ramp_navigation,
        // Upper Limb Function (6 Likert items)
        data.upper_limb_function.reaching_overhead,
        data.upper_limb_function.grip_strength,
        data.upper_limb_function.fine_motor_control,
        data.upper_limb_function.bilateral_coordination,
        data.upper_limb_function.upper_limb_weight_bearing,
        data.upper_limb_function.functional_reach,
        // Assistive Devices (3 Likert items; device_appropriateness excluded as conditional)
        data.assistive_devices.device_usage_competence,
        data.assistive_devices.device_condition,
        data.assistive_devices.wheelchair_skills,
        // Falls Risk Assessment (5 Likert items)
        data.falls_risk_assessment.fear_of_falling,
        data.falls_risk_assessment.medication_fall_risk,
        data.falls_risk_assessment.postural_hypotension,
        data.falls_risk_assessment.vision_impairment,
        data.falls_risk_assessment.cognitive_impact_on_mobility,
        // Clinical Review (2 Likert items)
        data.clinical_review.overall_mobility_rating,
        data.clinical_review.rehabilitation_potential,
    ]
}

/// Calculate the composite mobility score (0-100) from all answered Likert items.
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

/// Get the balance dimension score.
pub fn balance_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.balance_assessment.static_sitting_balance,
        data.balance_assessment.dynamic_sitting_balance,
        data.balance_assessment.static_standing_balance,
        data.balance_assessment.dynamic_standing_balance,
        data.balance_assessment.single_leg_stance,
        data.balance_assessment.tandem_stance,
    ])
}

/// Get the gait dimension score.
pub fn gait_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.gait_analysis.gait_pattern_quality,
        data.gait_analysis.gait_speed,
        data.gait_analysis.step_length_symmetry,
        data.gait_analysis.turning_ability,
        data.gait_analysis.outdoor_walking,
        data.gait_analysis.walking_endurance,
    ])
}

/// Get the transfers dimension score.
pub fn transfers_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.transfers_bed_mobility.bed_mobility,
        data.transfers_bed_mobility.sit_to_stand,
        data.transfers_bed_mobility.stand_to_sit,
        data.transfers_bed_mobility.chair_transfer,
        data.transfers_bed_mobility.toilet_transfer,
        data.transfers_bed_mobility.car_transfer,
    ])
}

/// Falls risk category from falls_in_past_year string.
pub fn falls_risk_category(falls: &str) -> &'static str {
    match falls {
        "none" => "low",
        "one" => "moderate",
        "twoOrMore" => "high",
        _ => "unknown",
    }
}
