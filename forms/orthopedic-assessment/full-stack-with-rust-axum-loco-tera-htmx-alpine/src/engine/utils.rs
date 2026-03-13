use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "surgical" => "Surgical",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Pain Assessment (4 Likert items)
        data.pain_assessment.pain_severity,
        data.pain_assessment.pain_at_rest,
        data.pain_assessment.pain_with_activity,
        data.pain_assessment.night_pain,
        // Joint Examination (4 Likert items)
        data.joint_examination.range_of_motion,
        data.joint_examination.joint_stability,
        data.joint_examination.joint_swelling,
        data.joint_examination.ligament_integrity,
        // Muscle Assessment (5 Likert items)
        data.muscle_assessment.muscle_strength,
        data.muscle_assessment.muscle_atrophy,
        data.muscle_assessment.muscle_tone,
        data.muscle_assessment.grip_strength,
        data.muscle_assessment.muscle_tenderness,
        // Spinal Assessment (4 Likert items)
        data.spinal_assessment.spinal_alignment,
        data.spinal_assessment.spinal_mobility,
        data.spinal_assessment.straight_leg_raise,
        data.spinal_assessment.spinal_tenderness,
        // Imaging & Investigations (1 Likert item)
        data.imaging_investigations.imaging_urgency,
        // Functional Status (5 Likert items)
        data.functional_status.mobility_level,
        data.functional_status.daily_activities,
        data.functional_status.work_capacity,
        data.functional_status.sleep_quality,
        data.functional_status.fall_risk,
        // Surgical Considerations (3 Likert items)
        data.surgical_considerations.surgical_urgency,
        data.surgical_considerations.anaesthetic_risk,
        data.surgical_considerations.expected_outcome,
        // Clinical Review (2 Likert items)
        data.clinical_review.overall_severity,
        data.clinical_review.patient_understanding,
    ]
}

/// Calculate the composite severity score (0-100) from all answered Likert items.
/// Higher scores indicate greater severity / worse condition.
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

/// Get the pain dimension score.
pub fn pain_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.pain_assessment.pain_severity,
        data.pain_assessment.pain_at_rest,
        data.pain_assessment.pain_with_activity,
        data.pain_assessment.night_pain,
    ])
}

/// Get the joint dimension score.
pub fn joint_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.joint_examination.range_of_motion,
        data.joint_examination.joint_stability,
        data.joint_examination.joint_swelling,
        data.joint_examination.ligament_integrity,
    ])
}

/// Get the functional status dimension score.
pub fn functional_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.functional_status.mobility_level,
        data.functional_status.daily_activities,
        data.functional_status.work_capacity,
        data.functional_status.sleep_quality,
        data.functional_status.fall_risk,
    ])
}
