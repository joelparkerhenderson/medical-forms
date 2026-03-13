use super::types::AssessmentData;

/// Returns a human-readable label for a satisfaction level.
pub fn satisfaction_level_label(level: &str) -> &str {
    match level {
        "verySatisfied" => "Very Satisfied",
        "satisfied" => "Satisfied",
        "neutral" => "Neutral",
        "dissatisfied" => "Dissatisfied",
        "veryDissatisfied" => "Very Dissatisfied",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Wait Time & Access (4 Likert items)
        data.wait_time_access.ease_of_scheduling,
        data.wait_time_access.wait_time_acceptability,
        data.wait_time_access.location_accessibility,
        data.wait_time_access.signage_wayfinding,
        // Communication (7 Likert items)
        data.communication.provider_listening,
        data.communication.provider_explaining,
        data.communication.provider_respect,
        data.communication.provider_time_adequacy,
        data.communication.questions_encouraged,
        data.communication.information_clarity,
        data.communication.shared_decision_making,
        // Care Quality (6 Likert items)
        data.care_quality.thoroughness_of_examination,
        data.care_quality.diagnosis_explanation,
        data.care_quality.treatment_plan_clarity,
        data.care_quality.confidence_in_provider,
        data.care_quality.coordination_of_care,
        data.care_quality.involvement_in_decisions,
        // Staff Interaction (6 Likert items)
        data.staff_interaction.reception_courtesy,
        data.staff_interaction.nursing_responsiveness,
        data.staff_interaction.staff_professionalism,
        data.staff_interaction.staff_helpfulness,
        data.staff_interaction.privacy_respected,
        data.staff_interaction.team_coordination,
        // Environment (6 Likert items)
        data.environment.facility_cleanliness,
        data.environment.facility_comfort,
        data.environment.noise_level,
        data.environment.privacy_adequacy,
        data.environment.equipment_condition,
        data.environment.overall_ambience,
        // Medication & Treatment (5 Likert items)
        data.medication_treatment.medication_explanation,
        data.medication_treatment.side_effects_explained,
        data.medication_treatment.pain_management,
        data.medication_treatment.treatment_effectiveness,
        data.medication_treatment.alternatives_discussed,
        // Discharge & Follow-up (5 Likert items)
        data.discharge_follow_up.discharge_instruction_clarity,
        data.discharge_follow_up.follow_up_plan_explained,
        data.discharge_follow_up.self_care_instructions,
        data.discharge_follow_up.warning_signs_explained,
        data.discharge_follow_up.contact_information_provided,
        // Overall Experience (4 Likert items; NPS excluded as 0-10)
        data.overall_experience.overall_satisfaction,
        data.overall_experience.met_expectations,
        data.overall_experience.would_return_for_care,
    ]
}

/// Calculate the composite satisfaction score (0-100) from all answered Likert items.
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

/// Get the communication dimension score.
pub fn communication_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.communication.provider_listening,
        data.communication.provider_explaining,
        data.communication.provider_respect,
        data.communication.provider_time_adequacy,
        data.communication.questions_encouraged,
        data.communication.information_clarity,
        data.communication.shared_decision_making,
    ])
}

/// Get the care quality dimension score.
pub fn care_quality_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.care_quality.thoroughness_of_examination,
        data.care_quality.diagnosis_explanation,
        data.care_quality.treatment_plan_clarity,
        data.care_quality.confidence_in_provider,
        data.care_quality.coordination_of_care,
        data.care_quality.involvement_in_decisions,
    ])
}

/// NPS category from likelihood_to_recommend (0-10).
pub fn nps_category(score: Option<u8>) -> &'static str {
    match score {
        Some(0..=6) => "detractor",
        Some(7..=8) => "passive",
        Some(9..=10) => "promoter",
        _ => "unknown",
    }
}
