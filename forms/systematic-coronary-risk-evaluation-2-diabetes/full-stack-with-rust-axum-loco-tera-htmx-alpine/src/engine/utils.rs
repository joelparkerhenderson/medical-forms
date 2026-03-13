use super::types::AssessmentData;

/// Returns a human-readable label for a risk category.
pub fn risk_category_label(category: &str) -> &str {
    match category {
        "veryHigh" => "Very High Risk",
        "high" => "High Risk",
        "moderate" => "Moderate Risk",
        "low" => "Low Risk",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate BMI from height (cm) and weight (kg).
pub fn calculate_bmi(height_cm: Option<f64>, weight_kg: Option<f64>) -> Option<f64> {
    match (height_cm, weight_kg) {
        (Some(h), Some(w)) if h > 0.0 => {
            let h_m = h / 100.0;
            Some((w / (h_m * h_m) * 10.0).round() / 10.0)
        }
        _ => None,
    }
}

/// Calculate age from date of birth (YYYY-MM-DD format).
pub fn calculate_age(dob: &str) -> Option<u32> {
    let parts: Vec<&str> = dob.split('-').collect();
    if parts.len() != 3 { return None; }
    let year: u32 = parts[0].parse().ok()?;
    let month: u32 = parts[1].parse().ok()?;
    let day: u32 = parts[2].parse().ok()?;
    let now = chrono::Utc::now();
    let now_year = now.format("%Y").to_string().parse::<u32>().ok()?;
    let now_month = now.format("%m").to_string().parse::<u32>().ok()?;
    let now_day = now.format("%d").to_string().parse::<u32>().ok()?;
    let mut age = now_year.checked_sub(year)?;
    if now_month < month || (now_month == month && now_day < day) {
        age = age.checked_sub(1)?;
    }
    Some(age)
}

/// Calculate diabetes duration from age at diagnosis.
pub fn diabetes_duration(data: &AssessmentData) -> Option<f64> {
    if let Some(dur) = data.diabetes_history.diabetes_duration_years {
        return Some(dur);
    }
    let age = calculate_age(&data.patient_demographics.date_of_birth)? as f64;
    let age_at_dx = data.diabetes_history.age_at_diagnosis?;
    Some(age - age_at_dx)
}

/// Check if patient has established cardiovascular disease.
pub fn has_established_cvd(data: &AssessmentData) -> bool {
    let cv = &data.cardiovascular_history;
    cv.previous_mi == "yes"
        || cv.previous_stroke == "yes"
        || cv.previous_tia == "yes"
        || cv.peripheral_arterial_disease == "yes"
        || cv.heart_failure == "yes"
}

/// Convert HbA1c percent to mmol/mol if needed.
pub fn hba1c_mmol_mol(data: &AssessmentData) -> Option<f64> {
    let val = data.diabetes_history.hba1c_value?;
    if data.diabetes_history.hba1c_unit == "percent" {
        // IFCC formula: mmol/mol = (% - 2.15) * 10.929
        Some(((val - 2.15) * 10.929 * 10.0).round() / 10.0)
    } else {
        Some(val)
    }
}

/// Determine CKD stage from eGFR.
pub fn ckd_stage_from_egfr(egfr: Option<f64>) -> &'static str {
    match egfr {
        Some(g) if g >= 90.0 => "G1",
        Some(g) if g >= 60.0 => "G2",
        Some(g) if g >= 45.0 => "G3a",
        Some(g) if g >= 30.0 => "G3b",
        Some(g) if g >= 15.0 => "G4",
        Some(_) => "G5",
        None => "",
    }
}

/// Check if the assessment is likely still a draft.
pub fn is_likely_draft(data: &AssessmentData) -> bool {
    data.patient_demographics.full_name.trim().is_empty()
        && data.patient_demographics.date_of_birth.is_empty()
        && data.diabetes_history.hba1c_value.is_none()
        && data.blood_pressure.systolic_bp.is_none()
}
