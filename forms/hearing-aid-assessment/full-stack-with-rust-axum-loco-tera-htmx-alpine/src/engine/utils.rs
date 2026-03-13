use super::types::AssessmentData;

/// Returns a human-readable label for a hearing aid assessment level.
pub fn hearing_aid_level_label(level: &str) -> &str {
    match level {
        "profound" => "Profound Need",
        "significant" => "Significant Need",
        "moderate" => "Moderate Need",
        "minimal" => "Minimal Need",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Communication Needs (6 Likert items)
        data.communication_needs.quiet_conversation,
        data.communication_needs.group_conversation,
        data.communication_needs.telephone_use,
        data.communication_needs.television_listening,
        data.communication_needs.public_settings,
        data.communication_needs.workplace_communication,
        // Lifestyle Assessment (6 Likert items)
        data.lifestyle_assessment.social_activity_level,
        data.lifestyle_assessment.outdoor_activity_level,
        data.lifestyle_assessment.technology_comfort,
        data.lifestyle_assessment.manual_dexterity,
        data.lifestyle_assessment.cosmetic_concern,
        data.lifestyle_assessment.motivation_level,
        // Current Hearing Aids (1 Likert item)
        data.current_hearing_aids.satisfaction_with_current,
        // Fitting Requirements (2 Likert items)
        data.fitting_requirements.ear_canal_suitability,
        data.fitting_requirements.connectivity_needs,
        // Expectations & Goals (4 Likert items)
        data.expectations_goals.realistic_expectations,
        data.expectations_goals.willingness_to_adapt,
        data.expectations_goals.support_system,
        data.expectations_goals.follow_up_commitment,
        data.expectations_goals.overall_readiness,
        // Trial Period (5 Likert items)
        data.trial_period.initial_comfort,
        data.trial_period.sound_quality,
        data.trial_period.feedback_management,
        data.trial_period.daily_wear_compliance,
        data.trial_period.reported_benefit,
        // Clinical Review (3 Likert items)
        data.clinical_review.aided_improvement,
        data.clinical_review.patient_satisfaction,
        data.clinical_review.recommendation_confidence,
    ]
}

/// Calculate the composite hearing aid assessment score (0-100) from all answered Likert items.
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

/// Get the communication needs dimension score.
pub fn communication_needs_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.communication_needs.quiet_conversation,
        data.communication_needs.group_conversation,
        data.communication_needs.telephone_use,
        data.communication_needs.television_listening,
        data.communication_needs.public_settings,
        data.communication_needs.workplace_communication,
    ])
}

/// Get the trial period dimension score.
pub fn trial_period_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.trial_period.initial_comfort,
        data.trial_period.sound_quality,
        data.trial_period.feedback_management,
        data.trial_period.daily_wear_compliance,
        data.trial_period.reported_benefit,
    ])
}

/// Hearing loss severity category based on PTA.
pub fn hearing_loss_category(pta: Option<u8>) -> &'static str {
    match pta {
        Some(0..=25) => "normal",
        Some(26..=40) => "mild",
        Some(41..=55) => "moderate",
        Some(56..=70) => "moderatelySevere",
        Some(71..=90) => "severe",
        Some(91..=u8::MAX) => "profound",
        None => "unknown",
    }
}
