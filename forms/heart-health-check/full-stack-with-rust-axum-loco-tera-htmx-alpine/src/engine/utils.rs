use super::types::AssessmentData;

/// Returns a human-readable label for a risk category.
pub fn risk_category_label(level: &str) -> &str {
    match level {
        "low" => "Low Risk",
        "moderate" => "Moderate Risk",
        "high" => "High Risk",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate BMI from height (cm) and weight (kg).
pub fn calculate_bmi(height_cm: Option<f64>, weight_kg: Option<f64>) -> Option<f64> {
    match (height_cm, weight_kg) {
        (Some(h), Some(w)) if h > 0.0 => {
            let height_m = h / 100.0;
            Some((w / (height_m * height_m) * 10.0).round() / 10.0)
        }
        _ => None,
    }
}

/// Calculate total cholesterol / HDL cholesterol ratio.
pub fn calculate_tc_hdl_ratio(tc: Option<f64>, hdl: Option<f64>) -> Option<f64> {
    match (tc, hdl) {
        (Some(t), Some(h)) if h > 0.0 => Some((t / h * 10.0).round() / 10.0),
        _ => None,
    }
}

/// Returns true if the smoking status indicates an active smoker.
pub fn is_smoker(status: &str) -> bool {
    matches!(status, "lightSmoker" | "moderateSmoker" | "heavySmoker")
}

/// Returns true if the assessment is likely a draft (age and sex both missing).
pub fn is_likely_draft(data: &AssessmentData) -> bool {
    data.demographics_ethnicity.age.is_none() && data.demographics_ethnicity.sex.is_empty()
}

/// Returns points for smoking status.
pub fn smoking_points(status: &str) -> f64 {
    match status {
        "heavySmoker" => 15.0,
        "moderateSmoker" => 10.0,
        "lightSmoker" => 5.0,
        "exSmoker" => 2.0,
        _ => 0.0,
    }
}

/// Estimate 10-year CVD risk using a simplified point-based scoring system.
/// Total points are mapped to a percentage via a sigmoid function.
pub fn estimate_ten_year_risk(data: &AssessmentData) -> f64 {
    let mut points = 0.0_f64;

    // Age contribution
    if let Some(age) = data.demographics_ethnicity.age {
        let age_f = age as f64;
        if data.demographics_ethnicity.sex == "male" {
            points += (age_f - 25.0).max(0.0) * 0.8;
        } else {
            points += (age_f - 25.0).max(0.0) * 0.6;
        }
    }

    // Smoking
    points += smoking_points(&data.smoking_alcohol.smoking_status);

    // Systolic BP
    if let Some(sbp) = data.blood_pressure.systolic_bp {
        points += ((sbp - 100.0) * 0.15).max(0.0);
        // BP variability
        if let Some(sd) = data.blood_pressure.systolic_bp_sd {
            if sd > 10.0 {
                points += 5.0;
            }
        }
    }

    // Cholesterol ratio
    let tc_hdl = data.cholesterol.total_hdl_ratio
        .or_else(|| calculate_tc_hdl_ratio(data.cholesterol.total_cholesterol, data.cholesterol.hdl_cholesterol));
    if let Some(ratio) = tc_hdl {
        points += ((ratio - 3.0) * 3.0).max(0.0);
    }

    // Diabetes
    match data.medical_conditions.has_diabetes.as_str() {
        "type1" => points += 20.0,
        "type2" => points += 15.0,
        _ => {}
    }

    // Atrial fibrillation
    if data.medical_conditions.has_atrial_fibrillation == "yes" {
        points += 10.0;
    }

    // CKD
    if data.medical_conditions.has_chronic_kidney_disease == "yes" {
        points += 10.0;
    }

    // Rheumatoid arthritis
    if data.medical_conditions.has_rheumatoid_arthritis == "yes" {
        points += 5.0;
    }

    // Family CVD under 60
    if data.family_history.family_cvd_under_60 == "yes" {
        points += 10.0;
    }

    // Townsend deprivation
    if let Some(townsend) = data.demographics_ethnicity.townsend_deprivation {
        if townsend > 0.0 {
            points += townsend * 1.5;
        }
    }

    // BMI
    let bmi = data.body_measurements.bmi
        .or_else(|| calculate_bmi(data.body_measurements.height_cm, data.body_measurements.weight_kg));
    if let Some(bmi_val) = bmi {
        if bmi_val > 25.0 {
            points += (bmi_val - 25.0) * 0.5;
        }
    }

    // BP treatment (indicates known hypertension)
    if data.blood_pressure.on_bp_treatment == "yes" {
        points += 3.0;
    }

    // Atypical antipsychotic
    if data.medical_conditions.on_atypical_antipsychotic == "yes" {
        points += 3.0;
    }

    // Corticosteroids
    if data.medical_conditions.on_corticosteroids == "yes" {
        points += 5.0;
    }

    // Migraine
    if data.medical_conditions.has_migraine == "yes" {
        points += 3.0;
    }

    // Severe mental illness
    if data.medical_conditions.has_severe_mental_illness == "yes" {
        points += 3.0;
    }

    // Erectile dysfunction (male only)
    if data.demographics_ethnicity.sex == "male"
        && data.medical_conditions.has_erectile_dysfunction == "yes"
    {
        points += 5.0;
    }

    // Exponential mapping calibrated so that:
    // ~8 points -> ~3%, ~15 points -> ~6%, ~25 points -> ~12%, ~35+ points -> ~25%+
    let risk = 0.8 * (0.1 * points).exp();
    let risk = (risk * 10.0).round() / 10.0;
    risk.clamp(0.1, 95.0)
}

/// Calculate heart age: find age where expected risk for an otherwise-average
/// person equals the patient's actual risk.
pub fn calculate_heart_age(data: &AssessmentData, actual_risk: f64) -> Option<u8> {
    let _age = data.demographics_ethnicity.age?;

    // Create a baseline "average" person of same sex with no risk factors
    let sex = &data.demographics_ethnicity.sex;
    if sex.is_empty() {
        return None;
    }

    // Search for the age where an average person has the same risk
    for test_age in 25..=100u8 {
        let mut baseline = AssessmentData::default();
        baseline.demographics_ethnicity.age = Some(test_age);
        baseline.demographics_ethnicity.sex = sex.clone();
        // Average systolic BP
        baseline.blood_pressure.systolic_bp = Some(120.0);
        // Average cholesterol ratio
        baseline.cholesterol.total_hdl_ratio = Some(4.0);
        baseline.smoking_alcohol.smoking_status = "nonSmoker".to_string();

        let baseline_risk = estimate_ten_year_risk(&baseline);
        if baseline_risk >= actual_risk {
            return Some(test_age.min(100));
        }
    }

    // If risk is very high, heart age exceeds 100
    Some(100)
}
