use super::types::AssessmentData;

/// Returns a human-readable label for a risk level.
pub fn risk_level_label(level: &str) -> &str {
    match level {
        "veryHigh" => "Very High Risk",
        "high" => "High Risk",
        "moderate" => "Moderate Risk",
        "low" => "Low Risk",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 Likert-scale items from the assessment data.
/// Used primarily for counting answered items (draft threshold).
pub fn collect_likert_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Workstation Assessment (6 Likert items) — 1=Poor, 5=Excellent
        data.workstation_assessment.desk_height_appropriate,
        data.workstation_assessment.chair_adjustability,
        data.workstation_assessment.monitor_position,
        data.workstation_assessment.keyboard_mouse_placement,
        data.workstation_assessment.legroom_adequate,
        data.workstation_assessment.desk_surface_area,
        // Posture Assessment (6 Likert items) — 1=Severe deviation, 5=Neutral
        data.posture_assessment.neck_posture,
        data.posture_assessment.shoulder_posture,
        data.posture_assessment.upper_back_posture,
        data.posture_assessment.lower_back_posture,
        data.posture_assessment.wrist_posture,
        data.posture_assessment.leg_posture,
        // Musculoskeletal Symptoms (8 Likert items) — 1=None, 5=Severe
        data.musculoskeletal_symptoms.neck_pain,
        data.musculoskeletal_symptoms.shoulder_pain,
        data.musculoskeletal_symptoms.upper_back_pain,
        data.musculoskeletal_symptoms.lower_back_pain,
        data.musculoskeletal_symptoms.wrist_hand_pain,
        data.musculoskeletal_symptoms.elbow_pain,
        data.musculoskeletal_symptoms.hip_pain,
        data.musculoskeletal_symptoms.knee_pain,
        // Break Patterns (2 Likert items) — 1=Poor, 5=Excellent
        data.break_patterns.task_variety,
        data.break_patterns.autonomy_over_breaks,
        // Environmental Factors (6 Likert items) — 1=Poor, 5=Excellent
        data.environmental_factors.lighting_adequate,
        data.environmental_factors.temperature_comfortable,
        data.environmental_factors.noise_level_acceptable,
        data.environmental_factors.ventilation_adequate,
        data.environmental_factors.space_sufficient,
        data.environmental_factors.floor_surface_safe,
    ]
}

/// Collect "quality" items where 1=Poor (high risk) and 5=Excellent (low risk).
fn collect_quality_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.workstation_assessment.desk_height_appropriate,
        data.workstation_assessment.chair_adjustability,
        data.workstation_assessment.monitor_position,
        data.workstation_assessment.keyboard_mouse_placement,
        data.workstation_assessment.legroom_adequate,
        data.workstation_assessment.desk_surface_area,
        data.posture_assessment.neck_posture,
        data.posture_assessment.shoulder_posture,
        data.posture_assessment.upper_back_posture,
        data.posture_assessment.lower_back_posture,
        data.posture_assessment.wrist_posture,
        data.posture_assessment.leg_posture,
        data.break_patterns.task_variety,
        data.break_patterns.autonomy_over_breaks,
        data.environmental_factors.lighting_adequate,
        data.environmental_factors.temperature_comfortable,
        data.environmental_factors.noise_level_acceptable,
        data.environmental_factors.ventilation_adequate,
        data.environmental_factors.space_sufficient,
        data.environmental_factors.floor_surface_safe,
    ]
}

/// Collect "symptom" items where 1=None (low risk) and 5=Severe (high risk).
fn collect_symptom_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.musculoskeletal_symptoms.neck_pain,
        data.musculoskeletal_symptoms.shoulder_pain,
        data.musculoskeletal_symptoms.upper_back_pain,
        data.musculoskeletal_symptoms.lower_back_pain,
        data.musculoskeletal_symptoms.wrist_hand_pain,
        data.musculoskeletal_symptoms.elbow_pain,
        data.musculoskeletal_symptoms.hip_pain,
        data.musculoskeletal_symptoms.knee_pain,
    ]
}

/// Calculate the composite risk score (0-100) from all answered Likert items.
/// Quality items (workstation, posture, break, environment): 1=high risk, 5=low risk.
/// Symptom items: 1=low risk (no pain), 5=high risk (severe pain).
/// The composite normalises both to 0-100 risk and averages them.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let quality = collect_quality_items(data);
    let symptoms = collect_symptom_items(data);

    let quality_answered: Vec<u8> = quality.into_iter().flatten().collect();
    let symptom_answered: Vec<u8> = symptoms.into_iter().flatten().collect();

    let total = quality_answered.len() + symptom_answered.len();
    if total == 0 {
        return None;
    }

    // Quality items: risk = (5 - val) / 4 * 100
    let quality_risk: f64 = quality_answered
        .iter()
        .map(|&v| (5.0 - v as f64) / 4.0 * 100.0)
        .sum();

    // Symptom items: risk = (val - 1) / 4 * 100
    let symptom_risk: f64 = symptom_answered
        .iter()
        .map(|&v| (v as f64 - 1.0) / 4.0 * 100.0)
        .sum();

    let avg = (quality_risk + symptom_risk) / total as f64;
    Some(avg.round())
}

/// Calculate the dimension score (0-100 risk) for quality items (1=Poor, 5=Good).
/// Higher return values mean higher risk.
pub fn dimension_score_quality(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| (5.0 - v as f64) / 4.0 * 100.0).sum();
    Some(sum / answered.len() as f64)
}

/// Calculate the dimension score (0-100 risk) for symptom items (1=None, 5=Severe).
/// Higher return values mean higher risk.
pub fn dimension_score_symptom(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| (v as f64 - 1.0) / 4.0 * 100.0).sum();
    Some(sum / answered.len() as f64)
}

/// Get the posture dimension risk score.
pub fn posture_score(data: &AssessmentData) -> Option<f64> {
    dimension_score_quality(&[
        data.posture_assessment.neck_posture,
        data.posture_assessment.shoulder_posture,
        data.posture_assessment.upper_back_posture,
        data.posture_assessment.lower_back_posture,
        data.posture_assessment.wrist_posture,
        data.posture_assessment.leg_posture,
    ])
}

/// Get the musculoskeletal symptom severity score.
pub fn symptom_score(data: &AssessmentData) -> Option<f64> {
    dimension_score_symptom(&[
        data.musculoskeletal_symptoms.neck_pain,
        data.musculoskeletal_symptoms.shoulder_pain,
        data.musculoskeletal_symptoms.upper_back_pain,
        data.musculoskeletal_symptoms.lower_back_pain,
        data.musculoskeletal_symptoms.wrist_hand_pain,
        data.musculoskeletal_symptoms.elbow_pain,
        data.musculoskeletal_symptoms.hip_pain,
        data.musculoskeletal_symptoms.knee_pain,
    ])
}

/// Count the number of pain sites with severity >= 3 (moderate or worse).
pub fn count_pain_sites(data: &AssessmentData) -> usize {
    let items = [
        data.musculoskeletal_symptoms.neck_pain,
        data.musculoskeletal_symptoms.shoulder_pain,
        data.musculoskeletal_symptoms.upper_back_pain,
        data.musculoskeletal_symptoms.lower_back_pain,
        data.musculoskeletal_symptoms.wrist_hand_pain,
        data.musculoskeletal_symptoms.elbow_pain,
        data.musculoskeletal_symptoms.hip_pain,
        data.musculoskeletal_symptoms.knee_pain,
    ];
    items.iter().filter(|x| matches!(x, Some(3..=5))).count()
}

/// DSE compliance: count how many DSE items are "yes".
pub fn dse_compliance_count(data: &AssessmentData) -> usize {
    let items = [
        &data.dse_assessment.screen_flicker_free,
        &data.dse_assessment.screen_brightness_adjustable,
        &data.dse_assessment.screen_glare_free,
        &data.dse_assessment.keyboard_separate,
        &data.dse_assessment.keyboard_tiltable,
        &data.dse_assessment.mouse_comfortable,
        &data.dse_assessment.software_suitable,
        &data.dse_assessment.eye_test_offered,
        &data.dse_assessment.dse_training_completed,
    ];
    items.iter().filter(|x| x.as_str() == "yes").count()
}

/// DSE compliance as a percentage string.
pub fn dse_compliance_percentage(data: &AssessmentData) -> String {
    let count = dse_compliance_count(data);
    let total = 9;
    let pct = (count as f64 / total as f64 * 100.0).round() as u32;
    format!("{}%", pct)
}
