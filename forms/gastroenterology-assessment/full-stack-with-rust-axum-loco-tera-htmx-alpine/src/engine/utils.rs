use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "alarm" => "Alarm",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all scored items from the assessment data.
/// These are severity/frequency ratings on a 0-4 or 1-5 scale.
pub fn collect_scored_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Upper GI Symptoms (8 items)
        data.upper_gi_symptoms.heartburn_frequency,
        data.upper_gi_symptoms.heartburn_severity,
        data.upper_gi_symptoms.dysphagia_grade,
        data.upper_gi_symptoms.nausea_frequency,
        data.upper_gi_symptoms.vomiting_frequency,
        data.upper_gi_symptoms.early_satiety,
        data.upper_gi_symptoms.epigastric_pain,
        // Lower GI Symptoms (3 scored items)
        data.lower_gi_symptoms.rectal_bleeding_frequency,
        data.lower_gi_symptoms.abdominal_pain_severity,
        data.lower_gi_symptoms.bloating_severity,
        // Nutritional Assessment (1 scored item)
        data.nutritional_assessment.must_screening_score,
        // Clinical Review (2 scored items)
        data.clinical_review.ibd_activity_index,
        data.clinical_review.quality_of_life_impact,
    ]
}

/// Calculate the composite severity score (0-100) from all answered scored items.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_scored_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    // Convert 0-4 scale to 0-100 (higher = more severe)
    let score = (avg / 4.0) * 100.0;
    Some(score.round())
}

/// Calculate upper GI symptom dimension score (0-100).
pub fn upper_gi_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.upper_gi_symptoms.heartburn_frequency,
        data.upper_gi_symptoms.heartburn_severity,
        data.upper_gi_symptoms.dysphagia_grade,
        data.upper_gi_symptoms.nausea_frequency,
        data.upper_gi_symptoms.vomiting_frequency,
        data.upper_gi_symptoms.early_satiety,
        data.upper_gi_symptoms.epigastric_pain,
    ])
}

/// Calculate lower GI symptom dimension score (0-100).
pub fn lower_gi_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.lower_gi_symptoms.rectal_bleeding_frequency,
        data.lower_gi_symptoms.abdominal_pain_severity,
        data.lower_gi_symptoms.bloating_severity,
    ])
}

/// Calculate the dimension score (0-100) for a set of scored items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg / 4.0) * 100.0).round())
}

/// Count how many alarm features are present.
pub fn count_alarm_features(data: &AssessmentData) -> u32 {
    let mut count = 0u32;
    if data.alarm_features.unintentional_weight_loss == "yes" {
        if let Some(pct) = data.alarm_features.weight_loss_percentage {
            if pct > 10.0 {
                count += 1;
            }
        } else {
            count += 1;
        }
    }
    if data.alarm_features.dysphagia_present == "yes" {
        count += 1;
    }
    if data.alarm_features.gi_bleeding == "yes" {
        count += 1;
    }
    if data.alarm_features.iron_deficiency_anaemia == "yes" {
        count += 1;
    }
    if data.alarm_features.palpable_mass == "yes" {
        count += 1;
    }
    if data.alarm_features.jaundice == "yes" {
        count += 1;
    }
    if data.alarm_features.fever_unexplained == "yes" {
        count += 1;
    }
    if data.alarm_features.age_over_50_new_symptoms == "yes" {
        count += 1;
    }
    count
}

/// Calculate BMI from weight (kg) and height (cm).
pub fn calculate_bmi(weight_kg: Option<f64>, height_cm: Option<f64>) -> Option<f64> {
    match (weight_kg, height_cm) {
        (Some(w), Some(h)) if h > 0.0 => {
            let h_m = h / 100.0;
            Some((w / (h_m * h_m) * 10.0).round() / 10.0)
        }
        _ => None,
    }
}
