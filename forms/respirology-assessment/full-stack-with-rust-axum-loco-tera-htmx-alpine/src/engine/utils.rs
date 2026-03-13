use super::types::AssessmentData;

/// Returns a human-readable label for a respiratory level.
pub fn respiratory_level_label(level: &str) -> &str {
    match level {
        "respiratoryFailure" => "Respiratory Failure",
        "severeImpairment" => "Severe Impairment",
        "moderateImpairment" => "Moderate Impairment",
        "mildImpairment" => "Mild Impairment",
        "normal" => "Normal",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Respiratory Symptoms (5 Likert items)
        data.respiratory_symptoms.dyspnoea_severity,
        data.respiratory_symptoms.wheeze_frequency,
        data.respiratory_symptoms.chest_tightness,
        data.respiratory_symptoms.exercise_tolerance,
        data.respiratory_symptoms.nocturnal_symptoms,
        // Cough Assessment (4 Likert items)
        data.cough_assessment.cough_severity,
        data.cough_assessment.cough_frequency,
        data.cough_assessment.sputum_production,
        data.cough_assessment.haemoptysis,
        // Dyspnoea Assessment (5 Likert items)
        data.dyspnoea_assessment.mrc_dyspnoea_scale,
        data.dyspnoea_assessment.dyspnoea_at_rest,
        data.dyspnoea_assessment.dyspnoea_on_exertion,
        data.dyspnoea_assessment.orthopnoea,
        data.dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea,
        // Chest Examination (5 Likert items)
        data.chest_examination.breath_sounds,
        data.chest_examination.chest_expansion,
        data.chest_examination.percussion_note,
        data.chest_examination.vocal_resonance,
        data.chest_examination.accessory_muscle_use,
        // Spirometry Results (5 Likert items)
        data.spirometry_results.fev1_percent_predicted,
        data.spirometry_results.fvc_percent_predicted,
        data.spirometry_results.fev1_fvc_ratio,
        data.spirometry_results.peak_flow_percent_predicted,
        data.spirometry_results.bronchodilator_response,
        // Oxygen Assessment (4 Likert items)
        data.oxygen_assessment.resting_spo2,
        data.oxygen_assessment.exertional_spo2,
        data.oxygen_assessment.oxygen_requirement,
        data.oxygen_assessment.arterial_blood_gas,
        // Respiratory Infections (4 Likert items)
        data.respiratory_infections.exacerbation_frequency,
        data.respiratory_infections.antibiotic_courses,
        data.respiratory_infections.hospitalisation_frequency,
        data.respiratory_infections.vaccination_status,
        // Inhaler & Medications (4 Likert items)
        data.inhaler_medications.inhaler_technique,
        data.inhaler_medications.medication_adherence,
        data.inhaler_medications.inhaler_device_suitability,
        data.inhaler_medications.side_effects_severity,
        // Clinical Review (4 Likert items)
        data.clinical_review.overall_respiratory_status,
        data.clinical_review.quality_of_life_impact,
        data.clinical_review.treatment_response,
        data.clinical_review.follow_up_urgency,
    ]
}

/// Calculate the composite respiratory score (0-100) from all answered Likert items.
/// Returns None if no items are answered.
/// Note: Higher Likert values indicate WORSE respiratory status (more impairment),
/// so a higher composite score means MORE impairment.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_likert_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    // Convert 1-5 scale to 0-100 (higher = more impaired)
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

/// Get the spirometry dimension score.
pub fn spirometry_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.spirometry_results.fev1_percent_predicted,
        data.spirometry_results.fvc_percent_predicted,
        data.spirometry_results.fev1_fvc_ratio,
        data.spirometry_results.peak_flow_percent_predicted,
        data.spirometry_results.bronchodilator_response,
    ])
}

/// Get the oxygen dimension score.
pub fn oxygen_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.oxygen_assessment.resting_spo2,
        data.oxygen_assessment.exertional_spo2,
        data.oxygen_assessment.oxygen_requirement,
        data.oxygen_assessment.arterial_blood_gas,
    ])
}

/// Get the dyspnoea dimension score.
pub fn dyspnoea_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.dyspnoea_assessment.mrc_dyspnoea_scale,
        data.dyspnoea_assessment.dyspnoea_at_rest,
        data.dyspnoea_assessment.dyspnoea_on_exertion,
        data.dyspnoea_assessment.orthopnoea,
        data.dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea,
    ])
}

/// Smoking severity category from pack_years.
pub fn smoking_category(pack_years: &str) -> &'static str {
    match pack_years {
        "moreThan40" => "heavy",
        "20to40" => "moderate",
        "10to20" => "light",
        "lessThan10" => "minimal",
        "never" | "" => "none",
        _ => "unknown",
    }
}
