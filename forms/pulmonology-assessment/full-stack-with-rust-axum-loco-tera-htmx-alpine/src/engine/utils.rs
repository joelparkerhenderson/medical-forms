use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "critical" => "Critical",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "normal" => "Normal",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Respiratory History (1 item)
        data.respiratory_history.previous_hospitalizations,
        // Symptom Assessment (6 items)
        data.symptom_assessment.dyspnea_severity,
        data.symptom_assessment.cough_severity,
        data.symptom_assessment.sputum_production,
        data.symptom_assessment.wheezing_frequency,
        data.symptom_assessment.chest_tightness,
        data.symptom_assessment.nocturnal_symptoms,
        // Pulmonary Function Tests (4 items)
        data.pulmonary_function_tests.fev1_percent_predicted,
        data.pulmonary_function_tests.fvc_percent_predicted,
        data.pulmonary_function_tests.fev1_fvc_ratio,
        data.pulmonary_function_tests.dlco_percent_predicted,
        data.pulmonary_function_tests.peak_flow_variability,
        // Chest Imaging (1 item)
        data.chest_imaging.imaging_urgency,
        // ABG (1 item)
        data.arterial_blood_gases.abg_interpretation,
        // Sleep & Breathing (3 items)
        data.sleep_breathing.snoring_severity,
        data.sleep_breathing.daytime_sleepiness,
        data.sleep_breathing.sleep_quality,
        // Current Treatment (3 items)
        data.current_treatment.inhaler_technique,
        data.current_treatment.treatment_adherence,
        data.current_treatment.treatment_effectiveness,
        // Clinical Review (4 items)
        data.clinical_review.overall_severity_impression,
        data.clinical_review.exercise_tolerance,
        data.clinical_review.quality_of_life_impact,
        data.clinical_review.follow_up_urgency,
    ]
}

/// Calculate the composite severity score (0-100) from all answered Likert items.
/// Higher score = greater severity / worse condition.
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

/// Get the symptom severity dimension score.
pub fn symptom_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.symptom_assessment.dyspnea_severity,
        data.symptom_assessment.cough_severity,
        data.symptom_assessment.sputum_production,
        data.symptom_assessment.wheezing_frequency,
        data.symptom_assessment.chest_tightness,
        data.symptom_assessment.nocturnal_symptoms,
    ])
}

/// Get the pulmonary function test dimension score.
pub fn pft_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.pulmonary_function_tests.fev1_percent_predicted,
        data.pulmonary_function_tests.fvc_percent_predicted,
        data.pulmonary_function_tests.fev1_fvc_ratio,
        data.pulmonary_function_tests.dlco_percent_predicted,
        data.pulmonary_function_tests.peak_flow_variability,
    ])
}

/// Get the clinical review dimension score.
pub fn clinical_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.clinical_review.overall_severity_impression,
        data.clinical_review.exercise_tolerance,
        data.clinical_review.quality_of_life_impact,
        data.clinical_review.follow_up_urgency,
    ])
}

/// COPD GOLD stage classification based on FEV1 percent predicted.
pub fn copd_gold_stage(fev1_percent: Option<u8>) -> &'static str {
    match fev1_percent {
        Some(1) => "GOLD 4 (Very Severe)",
        Some(2) => "GOLD 3 (Severe)",
        Some(3) => "GOLD 2 (Moderate)",
        Some(4) => "GOLD 1 (Mild)",
        Some(5) => "Normal",
        _ => "unknown",
    }
}
