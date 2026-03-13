use super::types::AssessmentData;

/// Returns a human-readable label for a risk level.
pub fn risk_level_label(level: &str) -> &str {
    match level {
        "low" => "Low Risk",
        "intermediate" => "Intermediate Risk",
        "high" => "High Risk",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Convert mmol/L to mg/dL (multiply by 38.67).
pub fn convert_mmol_to_mg(mmol: f64) -> f64 {
    mmol * 38.67
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

/// Returns true if smoking_status indicates current smoker.
pub fn is_smoker(status: &str) -> bool {
    status == "current"
}

/// Returns true if the assessment data is likely a draft (missing age and sex).
pub fn is_likely_draft(data: &AssessmentData) -> bool {
    data.demographics.age.is_none() && data.demographics.sex.is_empty()
}

/// Calculate the Framingham 10-year risk of hard CHD using the Wilson/D'Agostino
/// 1998 Cox regression model with sex-specific coefficients.
///
/// Returns the 10-year risk as a percentage (0.0 to 100.0).
pub fn calculate_framingham_risk(data: &AssessmentData) -> f64 {
    let age = match data.demographics.age {
        Some(a) => a as f64,
        None => return 0.0,
    };

    let sex = &data.demographics.sex;
    if sex.is_empty() {
        return 0.0;
    }

    // Get cholesterol values, converting from mmol/L if needed
    let mut total_chol = data.cholesterol.total_cholesterol.unwrap_or(200.0);
    let mut hdl_chol = data.cholesterol.hdl_cholesterol.unwrap_or(50.0);

    if data.cholesterol.cholesterol_unit == "mmolL" {
        total_chol = convert_mmol_to_mg(total_chol);
        hdl_chol = convert_mmol_to_mg(hdl_chol);
    }

    let sbp = data.blood_pressure.systolic_bp.unwrap_or(120.0);
    let treated = data.blood_pressure.on_bp_treatment == "yes";
    let smoker = is_smoker(&data.smoking_history.smoking_status);

    let ln_age = age.ln();
    let ln_tc = total_chol.ln();
    let ln_hdl = hdl_chol.ln();
    let ln_sbp = sbp.ln();

    if sex == "male" {
        // Male coefficients
        let ln_sbp_coeff = if treated { 1.305784 + 0.241549 } else { 1.305784 };

        // Age cap for smoker interaction: cap at 70 for males
        let age_for_smoke_interaction = if age > 70.0 { 70.0 } else { age };
        let ln_age_smoke = age_for_smoke_interaction.ln();

        let l = 52.00961 * ln_age
            + 20.014077 * ln_tc
            + (-0.905964) * ln_hdl
            + ln_sbp_coeff * ln_sbp
            + if smoker { 12.096316 } else { 0.0 }
            + (-4.605038) * ln_age * ln_tc
            + if smoker { -2.84367 * ln_age_smoke } else { 0.0 }
            + (-2.93323) * ln_age * ln_age
            + (-172.300168);

        let risk = 1.0 - 0.9402_f64.powf(l.exp());
        // Clamp to [0, 100]
        (risk * 100.0).clamp(0.0, 100.0)
    } else {
        // Female coefficients
        let ln_sbp_coeff = if treated { 2.552905 + 0.420251 } else { 2.552905 };

        // Age cap for smoker interaction: cap at 78 for females
        let age_for_smoke_interaction = if age > 78.0 { 78.0 } else { age };
        let ln_age_smoke = age_for_smoke_interaction.ln();

        let l = 31.764001 * ln_age
            + 22.465206 * ln_tc
            + (-1.187731) * ln_hdl
            + ln_sbp_coeff * ln_sbp
            + if smoker { 13.07543 } else { 0.0 }
            + (-5.060998) * ln_age * ln_tc
            + if smoker { -2.996945 * ln_age_smoke } else { 0.0 }
            + (-146.5933061);

        let risk = 1.0 - 0.98767_f64.powf(l.exp());
        // Clamp to [0, 100]
        (risk * 100.0).clamp(0.0, 100.0)
    }
}
