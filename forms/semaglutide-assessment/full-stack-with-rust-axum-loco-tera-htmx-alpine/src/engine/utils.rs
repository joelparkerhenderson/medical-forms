use super::types::AssessmentData;

/// Returns a human-readable label for an eligibility level.
pub fn eligibility_level_label(level: &str) -> &str {
    match level {
        "eligible" => "Eligible",
        "cautionRequired" => "Caution Required",
        "notEligible" => "Not Eligible",
        "contraindicated" => "Contraindicated",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Lifestyle Assessment (6 Likert items)
        data.lifestyle_assessment.diet_quality,
        data.lifestyle_assessment.physical_activity_level,
        data.lifestyle_assessment.sleep_quality,
        data.lifestyle_assessment.stress_level,
        data.lifestyle_assessment.motivation_to_change,
        data.lifestyle_assessment.social_support,
        // Treatment Goals (2 Likert items)
        data.treatment_goals.realistic_expectations,
        data.treatment_goals.commitment_to_lifestyle_changes,
        // Clinical Review (4 Likert items)
        data.clinical_review.overall_eligibility_assessment,
        data.clinical_review.benefit_risk_ratio,
        data.clinical_review.patient_suitability,
        data.clinical_review.clinical_confidence,
    ]
}

/// Calculate the composite eligibility score (0-100) from all answered Likert items.
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

/// Get the lifestyle dimension score.
pub fn lifestyle_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.lifestyle_assessment.diet_quality,
        data.lifestyle_assessment.physical_activity_level,
        data.lifestyle_assessment.sleep_quality,
        data.lifestyle_assessment.stress_level,
        data.lifestyle_assessment.motivation_to_change,
        data.lifestyle_assessment.social_support,
    ])
}

/// Get the clinical review dimension score.
pub fn clinical_review_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.clinical_review.overall_eligibility_assessment,
        data.clinical_review.benefit_risk_ratio,
        data.clinical_review.patient_suitability,
        data.clinical_review.clinical_confidence,
    ])
}

/// Count the number of absolute contraindications present.
pub fn count_contraindications(data: &AssessmentData) -> usize {
    let checks = [
        &data.contraindications.personal_medullary_thyroid_cancer,
        &data.contraindications.family_men2,
        &data.contraindications.pancreatitis_history,
        &data.contraindications.severe_gi_disease,
        &data.contraindications.pregnancy_or_planning,
        &data.contraindications.breastfeeding,
        &data.contraindications.type1_diabetes,
        &data.contraindications.severe_renal_impairment,
        &data.contraindications.known_hypersensitivity,
        &data.contraindications.eating_disorder,
    ];
    checks.iter().filter(|c| c.as_str() == "yes").count()
}

/// Check whether patient has any absolute contraindication.
pub fn has_any_contraindication(data: &AssessmentData) -> bool {
    count_contraindications(data) > 0
}

/// BMI category from BMI value.
pub fn bmi_category(bmi: Option<f64>) -> &'static str {
    match bmi {
        Some(v) if v >= 40.0 => "morbidlyObese",
        Some(v) if v >= 35.0 => "severelyObese",
        Some(v) if v >= 30.0 => "obese",
        Some(v) if v >= 27.0 => "overweight",
        Some(v) if v >= 25.0 => "mildlyOverweight",
        Some(_) => "normal",
        None => "unknown",
    }
}
