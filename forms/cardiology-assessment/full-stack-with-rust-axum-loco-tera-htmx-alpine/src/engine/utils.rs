use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "critical" => "Critical",
        "high" => "High",
        "moderate" => "Moderate",
        "low" => "Low",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Count the number of cardiac risk factors present.
pub fn count_risk_factors(data: &AssessmentData) -> u8 {
    let mut count: u8 = 0;
    if data.risk_factors.hypertension == "yes" { count += 1; }
    if data.risk_factors.diabetes == "yes" { count += 1; }
    if data.risk_factors.dyslipidaemia == "yes" { count += 1; }
    if data.risk_factors.smoking_status == "current" { count += 1; }
    if data.risk_factors.family_cad_history == "yes" { count += 1; }
    if data.risk_factors.obstructive_sleep_apnoea == "yes" { count += 1; }
    if let Some(bmi) = data.risk_factors.bmi {
        if bmi >= 30.0 { count += 1; }
    }
    count
}

/// Count the number of significant symptoms present.
pub fn count_symptoms(data: &AssessmentData) -> u8 {
    let mut count: u8 = 0;
    if data.symptoms_assessment.chest_pain == "yes" { count += 1; }
    if data.symptoms_assessment.orthopnoea == "yes" { count += 1; }
    if data.symptoms_assessment.pnd == "yes" { count += 1; }
    if data.symptoms_assessment.palpitations == "yes" { count += 1; }
    if data.symptoms_assessment.syncope == "yes" { count += 1; }
    if data.symptoms_assessment.peripheral_oedema == "yes" { count += 1; }
    if let Some(d) = data.symptoms_assessment.dyspnoea {
        if d >= 3 { count += 1; }
    }
    count
}

/// Determine whether enough clinical data has been provided for grading.
/// Requires at least one of: NYHA class, LVEF, or significant symptoms.
pub fn has_sufficient_data(data: &AssessmentData) -> bool {
    let has_nyha = !data.symptoms_assessment.nyha_class.is_empty();
    let has_lvef = data.echocardiography.lvef.is_some();
    let has_symptoms = count_symptoms(data) >= 2;
    let has_ecg = !data.ecg_findings.ecg_rhythm.is_empty();
    let has_diagnosis = !data.clinical_review.primary_diagnosis.is_empty();

    // Need at least 2 of these clinical data points
    let count = [has_nyha, has_lvef, has_symptoms, has_ecg, has_diagnosis]
        .iter()
        .filter(|&&x| x)
        .count();

    count >= 2
}

/// Calculate a severity score (0-100) based on clinical indicators.
/// Higher score = more severe cardiac condition.
pub fn calculate_severity_score(data: &AssessmentData) -> f64 {
    let mut score: f64 = 0.0;
    let mut factors: f64 = 0.0;

    // NYHA class contribution (0-100 scale, weight: 30%)
    let nyha_score = match data.symptoms_assessment.nyha_class.as_str() {
        "I" => 10.0,
        "II" => 40.0,
        "III" => 70.0,
        "IV" => 100.0,
        _ => return 0.0, // Can't score without NYHA or other data
    };
    score += nyha_score * 0.30;
    factors += 0.30;

    // LVEF contribution (0-100 scale, weight: 30%)
    if let Some(lvef) = data.echocardiography.lvef {
        let lvef_score = if lvef >= 50 {
            10.0
        } else if lvef >= 40 {
            40.0
        } else if lvef >= 35 {
            60.0
        } else if lvef >= 25 {
            80.0
        } else {
            100.0
        };
        score += lvef_score * 0.30;
        factors += 0.30;
    }

    // Symptom burden contribution (weight: 20%)
    let symptom_count = count_symptoms(data);
    let symptom_score = (symptom_count as f64 / 7.0) * 100.0;
    score += symptom_score * 0.20;
    factors += 0.20;

    // Risk factor contribution (weight: 20%)
    let risk_count = count_risk_factors(data);
    let risk_score = (risk_count as f64 / 7.0) * 100.0;
    score += risk_score * 0.20;
    factors += 0.20;

    // Normalize to account for available factors
    if factors > 0.0 {
        (score / factors).round()
    } else {
        0.0
    }
}

/// Map a severity score to a severity level.
pub fn score_to_severity(score: f64) -> &'static str {
    if score >= 80.0 {
        "critical"
    } else if score >= 60.0 {
        "high"
    } else if score >= 40.0 {
        "moderate"
    } else {
        "low"
    }
}
