use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "crisis" => "Crisis",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "stable" => "Stable",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Presenting Complaint (2 Likert items)
        data.presenting_complaint.symptom_severity,
        data.presenting_complaint.functional_impact,
        // Psychiatric History (1 Likert item)
        data.psychiatric_history.treatment_response,
        // Mental State Examination (9 Likert items)
        data.mental_state_examination.appearance_behaviour,
        data.mental_state_examination.speech_assessment,
        data.mental_state_examination.mood_rating,
        data.mental_state_examination.affect_congruence,
        data.mental_state_examination.thought_form,
        data.mental_state_examination.thought_content,
        data.mental_state_examination.perception,
        data.mental_state_examination.cognition,
        data.mental_state_examination.insight_judgement,
        // Risk Assessment (6 Likert items)
        data.risk_assessment.suicidal_ideation,
        data.risk_assessment.self_harm_risk,
        data.risk_assessment.harm_to_others,
        data.risk_assessment.safeguarding_concerns,
        data.risk_assessment.risk_plan_specificity,
        data.risk_assessment.protective_factors,
        // Substance Use (4 Likert items)
        data.substance_use.alcohol_use,
        data.substance_use.drug_use,
        data.substance_use.substance_impact,
        data.substance_use.withdrawal_risk,
        data.substance_use.readiness_to_change,
        // Social & Functional (3 Likert items)
        data.social_functional.social_support,
        data.social_functional.daily_functioning,
        data.social_functional.relationship_quality,
        // Family History (2 Likert items)
        data.family_history.adverse_childhood_experiences,
        data.family_history.family_support_level,
        // Current Treatment (4 Likert items)
        data.current_treatment.medication_adherence,
        data.current_treatment.side_effects_severity,
        data.current_treatment.therapy_engagement,
        data.current_treatment.treatment_satisfaction,
        // Clinical Review (3 Likert items)
        data.clinical_review.overall_severity,
        data.clinical_review.treatment_urgency,
        data.clinical_review.prognosis_outlook,
    ]
}

/// Calculate the composite severity score (0-100) from all answered Likert items.
/// Higher scores indicate greater severity/concern.
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

/// Get the risk assessment dimension score.
pub fn risk_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.risk_assessment.suicidal_ideation,
        data.risk_assessment.self_harm_risk,
        data.risk_assessment.harm_to_others,
        data.risk_assessment.safeguarding_concerns,
        data.risk_assessment.risk_plan_specificity,
        data.risk_assessment.protective_factors,
    ])
}

/// Get the mental state examination dimension score.
pub fn mse_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.mental_state_examination.appearance_behaviour,
        data.mental_state_examination.speech_assessment,
        data.mental_state_examination.mood_rating,
        data.mental_state_examination.affect_congruence,
        data.mental_state_examination.thought_form,
        data.mental_state_examination.thought_content,
        data.mental_state_examination.perception,
        data.mental_state_examination.cognition,
        data.mental_state_examination.insight_judgement,
    ])
}

/// Urgency category from treatment_urgency (1-5).
pub fn urgency_category(score: Option<u8>) -> &'static str {
    match score {
        Some(5) => "emergency",
        Some(4) => "urgent",
        Some(3) => "soon",
        Some(1..=2) => "routine",
        _ => "unknown",
    }
}
