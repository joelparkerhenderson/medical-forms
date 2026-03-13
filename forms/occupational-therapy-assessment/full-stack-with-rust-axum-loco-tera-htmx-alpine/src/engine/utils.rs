use super::types::AssessmentData;

/// Returns a human-readable label for a function level.
pub fn function_level_label(level: &str) -> &str {
    match level {
        "independent" => "Independent",
        "modified" => "Modified Independent",
        "supervisory" => "Supervisory",
        "dependent" => "Dependent",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Daily Living Activities (8 items)
        data.daily_living_activities.feeding,
        data.daily_living_activities.bathing,
        data.daily_living_activities.dressing_upper,
        data.daily_living_activities.dressing_lower,
        data.daily_living_activities.grooming,
        data.daily_living_activities.toileting,
        data.daily_living_activities.transfers,
        data.daily_living_activities.mobility,
        // Instrumental Activities (7 items)
        data.instrumental_activities.meal_preparation,
        data.instrumental_activities.household_management,
        data.instrumental_activities.medication_management,
        data.instrumental_activities.financial_management,
        data.instrumental_activities.community_mobility,
        data.instrumental_activities.shopping,
        data.instrumental_activities.telephone_use,
        // Cognitive & Perceptual (7 items)
        data.cognitive_perceptual.orientation,
        data.cognitive_perceptual.attention,
        data.cognitive_perceptual.memory,
        data.cognitive_perceptual.problem_solving,
        data.cognitive_perceptual.safety_awareness,
        data.cognitive_perceptual.visual_perception,
        data.cognitive_perceptual.sequencing,
        // Motor & Sensory (8 items)
        data.motor_sensory.upper_extremity_strength,
        data.motor_sensory.lower_extremity_strength,
        data.motor_sensory.range_of_motion,
        data.motor_sensory.fine_motor_coordination,
        data.motor_sensory.gross_motor_coordination,
        data.motor_sensory.balance,
        data.motor_sensory.sensation,
        data.motor_sensory.endurance,
        // Home Environment (4 Likert items)
        data.home_environment.home_accessibility,
        data.home_environment.bathroom_safety,
        data.home_environment.kitchen_safety,
        data.home_environment.fall_risk_factors,
        // Work & Leisure (4 Likert items)
        data.work_leisure.return_to_work_potential,
        data.work_leisure.leisure_participation,
        data.work_leisure.social_participation,
        data.work_leisure.community_integration,
        // Goals & Priorities (1 Likert item)
        data.goals_priorities.motivation_level,
        // Clinical Review (4 Likert items - inverted for pain/fatigue)
        data.clinical_review.pain_level,
        data.clinical_review.fatigue_level,
        data.clinical_review.emotional_status,
        data.clinical_review.skin_integrity,
    ]
}

/// Calculate the composite function score (0-100) from all answered Likert items.
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

/// Get the daily living activities dimension score.
pub fn adl_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.daily_living_activities.feeding,
        data.daily_living_activities.bathing,
        data.daily_living_activities.dressing_upper,
        data.daily_living_activities.dressing_lower,
        data.daily_living_activities.grooming,
        data.daily_living_activities.toileting,
        data.daily_living_activities.transfers,
        data.daily_living_activities.mobility,
    ])
}

/// Get the instrumental activities dimension score.
pub fn iadl_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.instrumental_activities.meal_preparation,
        data.instrumental_activities.household_management,
        data.instrumental_activities.medication_management,
        data.instrumental_activities.financial_management,
        data.instrumental_activities.community_mobility,
        data.instrumental_activities.shopping,
        data.instrumental_activities.telephone_use,
    ])
}

/// Get the cognitive/perceptual dimension score.
pub fn cognitive_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.cognitive_perceptual.orientation,
        data.cognitive_perceptual.attention,
        data.cognitive_perceptual.memory,
        data.cognitive_perceptual.problem_solving,
        data.cognitive_perceptual.safety_awareness,
        data.cognitive_perceptual.visual_perception,
        data.cognitive_perceptual.sequencing,
    ])
}

/// Get the motor/sensory dimension score.
pub fn motor_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.motor_sensory.upper_extremity_strength,
        data.motor_sensory.lower_extremity_strength,
        data.motor_sensory.range_of_motion,
        data.motor_sensory.fine_motor_coordination,
        data.motor_sensory.gross_motor_coordination,
        data.motor_sensory.balance,
        data.motor_sensory.sensation,
        data.motor_sensory.endurance,
    ])
}
