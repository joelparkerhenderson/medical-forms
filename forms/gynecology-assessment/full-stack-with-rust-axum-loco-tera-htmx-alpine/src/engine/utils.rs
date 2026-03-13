use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "urgent" => "Urgent",
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
        // Gynecological Symptoms (2 Likert items)
        data.gynecological_symptoms.pelvic_pain_severity,
        data.gynecological_symptoms.dysmenorrhoea,
        // Menopause Assessment (3 Likert items)
        data.menopause_assessment.vasomotor_symptoms,
        data.menopause_assessment.urogenital_symptoms,
        data.menopause_assessment.mood_changes,
    ]
}

/// Calculate the composite severity score (0-100) from all answered Likert items.
/// Returns None if no items are answered.
/// Higher scores indicate more severe symptoms.
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

/// Get the gynecological symptoms dimension score.
pub fn symptom_severity_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.gynecological_symptoms.pelvic_pain_severity,
        data.gynecological_symptoms.dysmenorrhoea,
    ])
}

/// Get the menopause symptoms dimension score.
pub fn menopause_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.menopause_assessment.vasomotor_symptoms,
        data.menopause_assessment.urogenital_symptoms,
        data.menopause_assessment.mood_changes,
    ])
}
