use super::types::AssessmentData;

/// Returns a human-readable label for a risk category.
pub fn risk_category_label(level: &str) -> &str {
    match level {
        "low" => "Low Risk",
        "borderline" => "Borderline Risk",
        "intermediate" => "Intermediate Risk",
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

/// Determine if the patient is a current smoker based on smoking status string.
pub fn is_smoker(status: &str) -> bool {
    let lower = status.to_lowercase();
    matches!(lower.as_str(), "current" | "yes" | "currentsmoker")
}

/// Check if the assessment is likely a draft (missing key required fields).
pub fn is_likely_draft(data: &AssessmentData) -> bool {
    data.demographics.age.is_none() && data.demographics.sex.is_empty()
}

/// Convert HbA1c from mmol/mol to percent if needed.
/// If unit is "mmolMol", converts using IFCC formula: % = (mmol/mol / 10.929) + 2.15
/// Otherwise returns value as-is (assumed to be in %).
pub fn hba1c_to_percent(value: Option<f64>, unit: &str) -> Option<f64> {
    value.map(|v| {
        if unit == "mmolMol" || unit == "mmol/mol" {
            (v / 10.929) + 2.15
        } else {
            v
        }
    })
}

/// Estimate 10-year CVD risk using a point-based scoring system
/// that approximates the PREVENT Base model outcomes.
pub fn estimate_ten_year_risk(data: &AssessmentData) -> f64 {
    let age = match data.demographics.age {
        Some(a) => a as f64,
        None => return 0.0,
    };

    let is_male = data.demographics.sex.to_lowercase() == "male";

    // Base points by age and sex
    let mut points: f64 = if is_male {
        match age as u8 {
            30..=39 => 0.0,
            40..=44 => 2.0,
            45..=49 => 4.0,
            50..=54 => 6.0,
            55..=59 => 8.0,
            60..=64 => 10.0,
            65..=69 => 12.0,
            70..=74 => 14.0,
            75..=79 => 16.0,
            _ => 0.0,
        }
    } else {
        match age as u8 {
            30..=39 => 0.0,
            40..=44 => 1.0,
            45..=49 => 2.0,
            50..=54 => 4.0,
            55..=59 => 5.0,
            60..=64 => 7.0,
            65..=69 => 9.0,
            70..=74 => 11.0,
            75..=79 => 13.0,
            _ => 0.0,
        }
    };

    // Total cholesterol points
    if let Some(tc) = data.cholesterol_lipids.total_cholesterol {
        if tc >= 280.0 {
            points += 3.0;
        } else if tc >= 240.0 {
            points += 2.0;
        } else if tc >= 200.0 {
            points += 1.0;
        }
    }

    // HDL cholesterol (inverse relationship)
    if let Some(hdl) = data.cholesterol_lipids.hdl_cholesterol {
        if hdl < 35.0 {
            points += 3.0;
        } else if hdl < 40.0 {
            points += 2.0;
        } else if hdl < 50.0 {
            points += 1.0;
        } else if hdl >= 60.0 {
            points -= 1.0;
        }
    }

    // Systolic BP points
    if let Some(sbp) = data.blood_pressure.systolic_bp {
        if sbp >= 180.0 {
            points += 5.0;
        } else if sbp >= 160.0 {
            points += 4.0;
        } else if sbp >= 140.0 {
            points += 3.0;
        } else if sbp >= 130.0 {
            points += 2.0;
        } else if sbp >= 120.0 {
            points += 1.0;
        }
    }

    // Diabetes
    if data.metabolic_health.has_diabetes == "yes" {
        points += 3.0;
    }

    // Current smoking
    if is_smoker(&data.smoking_history.smoking_status) {
        points += 3.0;
    }

    // eGFR (renal function)
    if let Some(egfr) = data.renal_function.egfr {
        if egfr < 30.0 {
            points += 4.0;
        } else if egfr < 45.0 {
            points += 3.0;
        } else if egfr < 60.0 {
            points += 2.0;
        } else if egfr < 90.0 {
            points += 1.0;
        }
    }

    // BMI (use provided BMI or calculate from height/weight)
    let bmi = data
        .metabolic_health
        .bmi
        .or_else(|| calculate_bmi(data.demographics.height_cm, data.demographics.weight_kg));
    if let Some(bmi_val) = bmi {
        if bmi_val >= 35.0 {
            points += 3.0;
        } else if bmi_val >= 30.0 {
            points += 2.0;
        } else if bmi_val >= 25.0 {
            points += 1.0;
        }
    }

    // Antihypertensive use
    if data.blood_pressure.on_antihypertensive == "yes" {
        points += 1.0;
    }

    // Statin use (treated indicates known risk, but also mitigates)
    if data.cholesterol_lipids.on_statin == "yes" {
        points += 0.5;
    }

    // Convert points to approximate 10-year risk percentage
    // Using a scaled exponential mapping that better approximates PREVENT outcomes:
    // ~0 points -> ~1%, ~8 points -> ~3%, ~12 points -> ~5%, ~16 points -> ~10%,
    // ~20 points -> ~20%, ~25+ points -> ~40%+
    let risk = 0.5 * (0.18 * points).exp();

    // Round to 1 decimal place and clamp
    let risk = (risk * 10.0).round() / 10.0;
    risk.clamp(0.1, 95.0)
}

/// Estimate 30-year risk from 10-year risk.
/// Approximation: 30-year risk = 10-year risk * 2.5, capped at 95%.
pub fn estimate_thirty_year_risk(ten_year: f64) -> f64 {
    let thirty = ten_year * 2.5;
    let thirty = (thirty * 10.0).round() / 10.0;
    thirty.min(95.0)
}
