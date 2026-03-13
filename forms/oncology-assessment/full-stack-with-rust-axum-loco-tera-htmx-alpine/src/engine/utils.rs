use super::types::AssessmentData;

/// Returns a human-readable label for an oncology assessment level.
pub fn oncology_level_label(level: &str) -> &str {
    match level {
        "draft" => "Draft",
        "stable" => "Stable",
        "monitoring" => "Monitoring",
        "activeIssue" => "Active Issue",
        "urgent" => "Urgent",
        "palliative" => "Palliative",
        _ => "Unknown",
    }
}

/// Collect all scored items (1-5 scale) from the assessment data.
/// These come from Side Effects & Toxicity, Performance Status,
/// Psychosocial Assessment, and Palliative Care Needs.
pub fn collect_scored_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Side Effects & Toxicity (6 scored items)
        data.side_effects_toxicity.nausea_severity,
        data.side_effects_toxicity.fatigue_severity,
        data.side_effects_toxicity.pain_severity,
        data.side_effects_toxicity.neuropathy_severity,
        data.side_effects_toxicity.mucositis_severity,
        data.side_effects_toxicity.skin_toxicity_severity,
        // Performance Status (6 scored items, excluding ECOG/Karnofsky)
        data.performance_status.self_care_ability,
        data.performance_status.daily_activity_level,
        data.performance_status.nutritional_status,
        data.performance_status.cognitive_function,
        data.performance_status.sleep_quality,
        // Psychosocial Assessment (6 scored items)
        data.psychosocial_assessment.anxiety_level,
        data.psychosocial_assessment.depression_screening,
        data.psychosocial_assessment.distress_thermometer,
        data.psychosocial_assessment.social_support,
        data.psychosocial_assessment.financial_toxicity,
        data.psychosocial_assessment.coping_ability,
        // Palliative Care Needs (3 scored items)
        data.palliative_care_needs.symptom_burden,
        data.palliative_care_needs.pain_management_adequacy,
        data.palliative_care_needs.quality_of_life_score,
    ]
}

/// Calculate the composite oncology score (0-100) from all answered scored items.
/// Higher scores indicate worse clinical status (more severe symptoms/issues).
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_scored_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    // Convert 1-5 scale to 0-100 (higher = worse)
    let score = ((avg - 1.0) / 4.0) * 100.0;
    Some(score.round())
}

/// Calculate the dimension score (0-100) for a set of scored items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 4.0) * 100.0)
}

/// Get the side effects dimension score (0-100).
pub fn side_effects_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.side_effects_toxicity.nausea_severity,
        data.side_effects_toxicity.fatigue_severity,
        data.side_effects_toxicity.pain_severity,
        data.side_effects_toxicity.neuropathy_severity,
        data.side_effects_toxicity.mucositis_severity,
        data.side_effects_toxicity.skin_toxicity_severity,
    ])
}

/// Get the psychosocial dimension score (0-100).
pub fn psychosocial_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.psychosocial_assessment.anxiety_level,
        data.psychosocial_assessment.depression_screening,
        data.psychosocial_assessment.distress_thermometer,
        data.psychosocial_assessment.social_support,
        data.psychosocial_assessment.financial_toxicity,
        data.psychosocial_assessment.coping_ability,
    ])
}

/// Get the performance status dimension score (0-100).
pub fn performance_status_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.performance_status.self_care_ability,
        data.performance_status.daily_activity_level,
        data.performance_status.nutritional_status,
        data.performance_status.cognitive_function,
        data.performance_status.sleep_quality,
    ])
}

/// Overall stage category for dashboard display.
pub fn stage_category(stage: &str) -> &'static str {
    match stage {
        "I" | "IA" | "IB" => "early",
        "II" | "IIA" | "IIB" => "early",
        "III" | "IIIA" | "IIIB" | "IIIC" => "advanced",
        "IV" | "IVA" | "IVB" => "metastatic",
        _ => "unknown",
    }
}
