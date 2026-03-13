use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "verySevere" => "Very Severe",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "clear" => "Clear",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate DLQI total score (0-30) from all 10 DLQI items (each 0-3).
/// Returns None if no items are answered.
pub fn calculate_dlqi_score(data: &AssessmentData) -> Option<u8> {
    let items = collect_dlqi_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: u8 = answered.iter().sum();
    Some(sum)
}

/// Collect all 10 DLQI items from the assessment data.
pub fn collect_dlqi_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.quality_of_life.dlqi1_symptoms,
        data.quality_of_life.dlqi2_embarrassment,
        data.quality_of_life.dlqi3_shopping,
        data.quality_of_life.dlqi4_clothing,
        data.quality_of_life.dlqi5_social,
        data.quality_of_life.dlqi6_sport,
        data.quality_of_life.dlqi7_work,
        data.quality_of_life.dlqi8_relationships,
        data.quality_of_life.dlqi9_sex,
        data.quality_of_life.dlqi10_treatment,
    ]
}

/// Calculate BSA (Body Surface Area) percentage approximation from affected areas.
/// Uses body area severity scores (0-4) weighted by approximate BSA contribution.
pub fn calculate_bsa_percent(data: &AssessmentData) -> Option<u8> {
    // If body_area_affected is directly provided, use it
    if let Some(bsa) = data.current_condition.body_area_affected {
        return Some(bsa);
    }
    None
}

/// Collect symptom severity items for composite scoring.
pub fn collect_symptom_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.symptom_severity.itching,
        data.symptom_severity.pain,
        data.symptom_severity.burning,
        data.symptom_severity.dryness,
        data.symptom_severity.scaling,
        data.symptom_severity.erythema,
        data.symptom_severity.thickness,
        data.symptom_severity.sleep_disturbance,
    ]
}

/// Count the number of answered DLQI items.
pub fn dlqi_answered_count(data: &AssessmentData) -> usize {
    collect_dlqi_items(data).iter().filter(|x| x.is_some()).count()
}
