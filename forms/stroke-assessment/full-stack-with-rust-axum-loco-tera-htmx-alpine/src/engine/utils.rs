use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "severe" => "Severe",
        "moderateSevere" => "Moderate-Severe",
        "moderate" => "Moderate",
        "minor" => "Minor",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate the NIHSS total score from all 15 NIHSS items.
/// Returns None if no items are answered.
pub fn calculate_nihss_total(data: &AssessmentData) -> Option<u8> {
    let items = collect_nihss_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: u8 = answered.iter().sum();
    Some(sum)
}

/// Collect all NIHSS items from the assessment data.
pub fn collect_nihss_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.nihss_assessment.consciousness,
        data.nihss_assessment.orientation_questions,
        data.nihss_assessment.response_to_commands,
        data.nihss_assessment.best_gaze,
        data.nihss_assessment.visual_fields,
        data.nihss_assessment.facial_palsy,
        data.nihss_assessment.motor_left_arm,
        data.nihss_assessment.motor_right_arm,
        data.nihss_assessment.motor_left_leg,
        data.nihss_assessment.motor_right_leg,
        data.nihss_assessment.limb_ataxia,
        data.nihss_assessment.sensory,
        data.nihss_assessment.language,
        data.nihss_assessment.dysarthria,
        data.nihss_assessment.neglect,
    ]
}

/// Determine the severity level from an NIHSS total score.
/// 0 = no stroke symptoms, 1-4 = minor, 5-15 = moderate,
/// 16-20 = moderateSevere, 21-42 = severe.
pub fn severity_from_nihss(nihss_total: u8) -> &'static str {
    match nihss_total {
        0 => "minor",
        1..=4 => "minor",
        5..=15 => "moderate",
        16..=20 => "moderateSevere",
        21..=42 => "severe",
        _ => "severe",
    }
}
