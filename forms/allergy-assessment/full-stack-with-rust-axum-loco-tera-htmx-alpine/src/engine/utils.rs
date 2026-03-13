use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "lifeThreatening" => "Life-Threatening",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 severity-scale items from the assessment data.
pub fn collect_severity_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Current Allergies (1 item)
        data.current_allergies.severity_rating,
        // Symptoms & Reactions (5 items)
        data.symptoms_reactions.skin_symptoms,
        data.symptoms_reactions.respiratory_symptoms,
        data.symptoms_reactions.gastrointestinal_symptoms,
        data.symptoms_reactions.cardiovascular_symptoms,
        data.symptoms_reactions.anaphylaxis_risk,
        // Environmental Triggers (4 items)
        data.environmental_triggers.pollen_sensitivity,
        data.environmental_triggers.dust_mite_sensitivity,
        data.environmental_triggers.pet_dander_sensitivity,
        data.environmental_triggers.mold_sensitivity,
        // Review Assessment (1 item)
        data.review_assessment.overall_severity,
    ]
}

/// Calculate the composite severity score (0-100) from all answered severity items.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_severity_items(data);
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

/// Calculate the dimension score (0-100) for a set of severity items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 4.0) * 100.0)
}

/// Get the symptoms dimension score.
pub fn symptoms_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.symptoms_reactions.skin_symptoms,
        data.symptoms_reactions.respiratory_symptoms,
        data.symptoms_reactions.gastrointestinal_symptoms,
        data.symptoms_reactions.cardiovascular_symptoms,
        data.symptoms_reactions.anaphylaxis_risk,
    ])
}

/// Get the environmental triggers dimension score.
pub fn environmental_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.environmental_triggers.pollen_sensitivity,
        data.environmental_triggers.dust_mite_sensitivity,
        data.environmental_triggers.pet_dander_sensitivity,
        data.environmental_triggers.mold_sensitivity,
    ])
}

/// Count the number of allergen categories present.
pub fn count_allergen_categories(data: &AssessmentData) -> usize {
    let mut count = 0;
    if !data.current_allergies.allergen_category.is_empty() {
        count += 1;
    }
    if !data.food_drug_allergies.food_allergies.is_empty()
        && data.food_drug_allergies.food_allergies != "none"
    {
        count += 1;
    }
    if !data.food_drug_allergies.drug_allergies.is_empty()
        && data.food_drug_allergies.drug_allergies != "none"
    {
        count += 1;
    }
    if data.environmental_triggers.pollen_sensitivity.is_some_and(|v| v >= 3)
        || data.environmental_triggers.dust_mite_sensitivity.is_some_and(|v| v >= 3)
        || data.environmental_triggers.pet_dander_sensitivity.is_some_and(|v| v >= 3)
        || data.environmental_triggers.mold_sensitivity.is_some_and(|v| v >= 3)
    {
        count += 1;
    }
    count
}
