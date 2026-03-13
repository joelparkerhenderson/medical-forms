use super::types::{AssessmentData, Aq10Screening};

/// Returns a human-readable label for a likelihood level.
pub fn likelihood_level_label(level: &str) -> &str {
    match level {
        "highlyLikely" => "Highly Likely",
        "likely" => "Likely",
        "possible" => "Possible",
        "unlikely" => "Unlikely",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate the AQ-10 score.
///
/// AQ-10 scoring: Items 1, 7, 8, 10 score 1 point for "slightly agree" or
/// "definitely agree" (value >= 2). Items 2, 3, 4, 5, 6, 9 score 1 point
/// for "slightly disagree" or "definitely disagree" (value <= 1).
///
/// Returns None if fewer than 10 items are answered.
pub fn calculate_aq10_score(aq10: &Aq10Screening) -> Option<u8> {
    let items = [
        aq10.q1_notice_sounds,
        aq10.q2_whole_picture,
        aq10.q3_multitask,
        aq10.q4_switch_back,
        aq10.q5_read_between_lines,
        aq10.q6_detect_boredom,
        aq10.q7_character_intentions,
        aq10.q8_collect_info,
        aq10.q9_read_faces,
        aq10.q10_work_out_intentions,
    ];

    // Check all 10 items are answered
    if items.iter().any(|i| i.is_none()) {
        return None;
    }

    let mut score: u8 = 0;

    // Items where agree (>=2) scores a point: Q1, Q7, Q8, Q10
    if aq10.q1_notice_sounds.unwrap() >= 2 { score += 1; }
    if aq10.q7_character_intentions.unwrap() >= 2 { score += 1; }
    if aq10.q8_collect_info.unwrap() >= 2 { score += 1; }
    if aq10.q10_work_out_intentions.unwrap() >= 2 { score += 1; }

    // Items where disagree (<=1) scores a point: Q2, Q3, Q4, Q5, Q6, Q9
    if aq10.q2_whole_picture.unwrap() <= 1 { score += 1; }
    if aq10.q3_multitask.unwrap() <= 1 { score += 1; }
    if aq10.q4_switch_back.unwrap() <= 1 { score += 1; }
    if aq10.q5_read_between_lines.unwrap() <= 1 { score += 1; }
    if aq10.q6_detect_boredom.unwrap() <= 1 { score += 1; }
    if aq10.q9_read_faces.unwrap() <= 1 { score += 1; }

    Some(score)
}

/// Collect all 0-3 scale items from sensory, social, and behavioural domains.
pub fn collect_clinical_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Social Communication (5 items)
        data.social_communication.eye_contact,
        data.social_communication.conversational_reciprocity,
        data.social_communication.nonverbal_communication,
        data.social_communication.understanding_social_cues,
        data.social_communication.friendship_maintenance,
        // Restricted Repetitive Behaviours (5 items)
        data.restricted_repetitive_behaviours.intense_interests,
        data.restricted_repetitive_behaviours.routines_rituals,
        data.restricted_repetitive_behaviours.resistance_to_change,
        data.restricted_repetitive_behaviours.repetitive_movements,
        data.restricted_repetitive_behaviours.need_for_sameness,
        // Sensory Processing (5 items)
        data.sensory_processing.auditory_sensitivity,
        data.sensory_processing.visual_sensitivity,
        data.sensory_processing.tactile_sensitivity,
        data.sensory_processing.olfactory_sensitivity,
        data.sensory_processing.sensory_seeking,
        // Daily Living Skills (5 items)
        data.daily_living_skills.personal_care,
        data.daily_living_skills.meal_preparation,
        data.daily_living_skills.time_management,
        data.daily_living_skills.financial_management,
        data.daily_living_skills.travel_independence,
        // Mental Health (3 items)
        data.mental_health_comorbidities.anxiety_level,
        data.mental_health_comorbidities.depression_level,
        data.mental_health_comorbidities.sleep_difficulties,
    ]
}

/// Calculate the sensory processing dimension score (0-100).
pub fn sensory_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.sensory_processing.auditory_sensitivity,
        data.sensory_processing.visual_sensitivity,
        data.sensory_processing.tactile_sensitivity,
        data.sensory_processing.olfactory_sensitivity,
        data.sensory_processing.sensory_seeking,
    ])
}

/// Calculate the social communication dimension score (0-100).
pub fn social_communication_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.social_communication.eye_contact,
        data.social_communication.conversational_reciprocity,
        data.social_communication.nonverbal_communication,
        data.social_communication.understanding_social_cues,
        data.social_communication.friendship_maintenance,
    ])
}

/// Calculate the restricted/repetitive behaviours dimension score (0-100).
pub fn repetitive_behaviours_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.restricted_repetitive_behaviours.intense_interests,
        data.restricted_repetitive_behaviours.routines_rituals,
        data.restricted_repetitive_behaviours.resistance_to_change,
        data.restricted_repetitive_behaviours.repetitive_movements,
        data.restricted_repetitive_behaviours.need_for_sameness,
    ])
}

/// Calculate the dimension score (0-100) for a set of 0-3 items.
/// Higher scores indicate more ASD-related traits.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some((avg / 3.0) * 100.0)
}

/// Determine the support level label from the support_level_needed field.
pub fn support_level_label(level: &str) -> &str {
    match level {
        "level1" => "Level 1 - Requiring Support",
        "level2" => "Level 2 - Requiring Substantial Support",
        "level3" => "Level 3 - Requiring Very Substantial Support",
        "none" => "No Support Required",
        _ => "Not Assessed",
    }
}
