use super::types::AssessmentData;

/// Returns a human-readable label for a concern level.
pub fn concern_level_label(level: &str) -> &str {
    match level {
        "urgent" => "Urgent",
        "significantConcern" => "Significant Concern",
        "moderateConcern" => "Moderate Concern",
        "minorConcern" => "Minor Concern",
        "wellChild" => "Well Child",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Growth & Development (3 scored items)
        data.growth_development.weight_percentile,
        data.growth_development.height_percentile,
        data.growth_development.head_circumference_percentile,
        // Feeding & Nutrition (2 scored items)
        data.feeding_nutrition.diet_variety,
        data.feeding_nutrition.appetite_concern,
        // Developmental Milestones (7 scored items)
        data.developmental_milestones.gross_motor,
        data.developmental_milestones.fine_motor,
        data.developmental_milestones.language_expressive,
        data.developmental_milestones.language_receptive,
        data.developmental_milestones.social_emotional,
        data.developmental_milestones.cognitive,
        data.developmental_milestones.self_care,
        // Behavioral Assessment (5 scored items)
        data.behavioral_assessment.sleep_quality,
        data.behavioral_assessment.tantrums_frequency,
        data.behavioral_assessment.social_interaction,
        data.behavioral_assessment.attention_span,
        data.behavioral_assessment.anxiety_level,
        // Family & Social History (2 scored items)
        data.family_social_history.home_safety,
        data.family_social_history.parental_stress,
        // Systems Review (7 scored items)
        data.systems_review.respiratory_concerns,
        data.systems_review.gastrointestinal_concerns,
        data.systems_review.skin_concerns,
        data.systems_review.musculoskeletal_concerns,
        data.systems_review.neurological_concerns,
        data.systems_review.ent_concerns,
        data.systems_review.urinary_concerns,
        // Clinical Review (1 scored item)
        data.clinical_review.overall_health_impression,
    ]
}

/// Calculate the composite concern score (0-100) from all answered Likert items.
/// Higher scores indicate better health / less concern.
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

/// Get the developmental milestones dimension score.
pub fn developmental_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.developmental_milestones.gross_motor,
        data.developmental_milestones.fine_motor,
        data.developmental_milestones.language_expressive,
        data.developmental_milestones.language_receptive,
        data.developmental_milestones.social_emotional,
        data.developmental_milestones.cognitive,
        data.developmental_milestones.self_care,
    ])
}

/// Get the behavioral assessment dimension score.
pub fn behavioral_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.behavioral_assessment.sleep_quality,
        data.behavioral_assessment.tantrums_frequency,
        data.behavioral_assessment.social_interaction,
        data.behavioral_assessment.attention_span,
        data.behavioral_assessment.anxiety_level,
    ])
}

/// Get the systems review dimension score.
pub fn systems_review_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.systems_review.respiratory_concerns,
        data.systems_review.gastrointestinal_concerns,
        data.systems_review.skin_concerns,
        data.systems_review.musculoskeletal_concerns,
        data.systems_review.neurological_concerns,
        data.systems_review.ent_concerns,
        data.systems_review.urinary_concerns,
    ])
}

/// Classify overall health impression.
pub fn health_impression_category(score: Option<u8>) -> &'static str {
    match score {
        Some(1) => "poor",
        Some(2) => "belowAverage",
        Some(3) => "average",
        Some(4) => "good",
        Some(5) => "excellent",
        _ => "unknown",
    }
}
