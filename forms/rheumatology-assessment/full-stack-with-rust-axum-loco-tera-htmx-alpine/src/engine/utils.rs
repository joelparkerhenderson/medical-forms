use super::types::AssessmentData;

/// Returns a human-readable label for an activity level.
pub fn activity_level_label(level: &str) -> &str {
    match level {
        "severe" => "Severe",
        "highActivity" => "High Activity",
        "moderateActivity" => "Moderate Activity",
        "lowActivity" => "Low Activity",
        "remission" => "Remission",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all scored items from the assessment data.
/// These are the numeric fields (1-10 scale or similar) used for composite scoring.
pub fn collect_scored_items(data: &AssessmentData) -> Vec<Option<f64>> {
    vec![
        // Joint Assessment
        data.joint_assessment.swollen_joint_count.map(|v| v as f64),
        data.joint_assessment.tender_joint_count.map(|v| v as f64),
        data.joint_assessment.joint_range_of_motion.map(|v| v as f64),
        // Morning Stiffness
        data.morning_stiffness.stiffness_severity.map(|v| v as f64),
        data.morning_stiffness.stiffness_impact_on_function.map(|v| v as f64),
        // Disease Activity
        data.disease_activity.patient_global_assessment.map(|v| v as f64),
        data.disease_activity.physician_global_assessment.map(|v| v as f64),
        data.disease_activity.pain_vas_score.map(|v| v as f64),
        data.disease_activity.fatigue_severity.map(|v| v as f64),
        // Functional Status
        data.functional_status.grip_strength.map(|v| v as f64),
        data.functional_status.walking_ability.map(|v| v as f64),
        data.functional_status.self_care_ability.map(|v| v as f64),
        // Clinical Review
        data.clinical_review.treatment_response.map(|v| v as f64),
    ]
}

/// Calculate a composite disease activity score (0-100).
/// Higher scores indicate MORE disease activity (worse).
/// Uses a weighted composite of clinical indicators on 1-10 scales.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_scored_items(data);
    let answered: Vec<f64> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().sum();
    let avg = sum / answered.len() as f64;
    // Convert 1-10 scale to 0-100 (higher = more active disease)
    let score = ((avg - 1.0) / 9.0) * 100.0;
    Some(score.round())
}

/// Calculate the dimension score (0-100) for a set of 1-10 scale items.
/// Higher score = more disease activity (worse).
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 9.0) * 100.0)
}

/// Get the joint assessment dimension score.
pub fn joint_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.joint_assessment.swollen_joint_count,
        data.joint_assessment.tender_joint_count,
        data.joint_assessment.joint_range_of_motion,
    ])
}

/// Get the disease activity dimension score.
pub fn disease_activity_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.disease_activity.patient_global_assessment,
        data.disease_activity.physician_global_assessment,
        data.disease_activity.pain_vas_score,
        data.disease_activity.fatigue_severity,
    ])
}

/// Get the functional status dimension score.
pub fn functional_status_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.functional_status.grip_strength,
        data.functional_status.walking_ability,
        data.functional_status.self_care_ability,
    ])
}

/// DAS28 category from the DAS28 score.
pub fn das28_category(score: Option<f64>) -> &'static str {
    match score {
        Some(s) if s < 2.6 => "remission",
        Some(s) if s < 3.2 => "lowActivity",
        Some(s) if s <= 5.1 => "moderateActivity",
        Some(s) if s > 5.1 => "highActivity",
        _ => "unknown",
    }
}
