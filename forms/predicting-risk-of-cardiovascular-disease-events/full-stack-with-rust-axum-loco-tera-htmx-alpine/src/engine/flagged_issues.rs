use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{hba1c_to_percent, is_smoker};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the risk score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // FLAG-CVD-001: Known CVD (calculator not intended for secondary prevention)
    if data.medical_history.has_known_cvd == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CVD-001".to_string(),
            category: "Eligibility".to_string(),
            message: "Patient has known CVD - PREVENT is for primary prevention only".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-AGE-001: Age outside 30-79 range
    if let Some(age) = data.demographics.age {
        if age < 30 || age > 79 {
            flags.push(AdditionalFlag {
                id: "FLAG-AGE-001".to_string(),
                category: "Eligibility".to_string(),
                message: "Age outside validated range (30-79 years)".to_string(),
                priority: "high".to_string(),
            });
        }
    }

    // FLAG-BP-001: Systolic >= 180 (urgent)
    if data.blood_pressure.systolic_bp.is_some_and(|s| s >= 180.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Systolic BP >= 180 mmHg - urgent evaluation needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-BP-002: Diastolic >= 120 (emergency)
    if data.blood_pressure.diastolic_bp.is_some_and(|d| d >= 120.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-002".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Diastolic BP >= 120 mmHg - hypertensive emergency".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-CHOL-001: TC >= 300 (severe)
    if data
        .cholesterol_lipids
        .total_cholesterol
        .is_some_and(|t| t >= 300.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CHOL-001".to_string(),
            category: "Cholesterol".to_string(),
            message: "Total cholesterol >= 300 mg/dL - severe hypercholesterolemia".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-CHOL-002: HDL < 30 (critically low)
    if data
        .cholesterol_lipids
        .hdl_cholesterol
        .is_some_and(|h| h < 30.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CHOL-002".to_string(),
            category: "Cholesterol".to_string(),
            message: "HDL cholesterol < 30 mg/dL - critically low".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-DM-001: Uncontrolled diabetes (HbA1c >= 9%)
    let hba1c =
        hba1c_to_percent(data.metabolic_health.hba1c_value, &data.metabolic_health.hba1c_unit);
    if hba1c.is_some_and(|h| h >= 9.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-DM-001".to_string(),
            category: "Diabetes".to_string(),
            message: "HbA1c >= 9% - uncontrolled diabetes, review management".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-RENAL-001: eGFR < 15 (kidney failure)
    if data.renal_function.egfr.is_some_and(|e| e < 15.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-001".to_string(),
            category: "Renal Function".to_string(),
            message: "eGFR < 15 mL/min - kidney failure, nephrology referral needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-RENAL-002: Severe albuminuria (uACR > 300)
    if data.renal_function.urine_acr.is_some_and(|u| u > 300.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-002".to_string(),
            category: "Renal Function".to_string(),
            message: "uACR > 300 mg/g - severe albuminuria".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-SMOKE-001: Heavy smoker (>= 20/day)
    if data.smoking_history.cigarettes_per_day.is_some_and(|c| c >= 20) {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Smoking".to_string(),
            message: "Heavy smoker (>= 20 cigarettes/day) - intensive cessation support recommended"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-BMI-001: BMI >= 40 (morbid obesity)
    if data.metabolic_health.bmi.is_some_and(|b| b >= 40.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BMI-001".to_string(),
            category: "BMI".to_string(),
            message: "BMI >= 40 - morbid obesity, weight management referral recommended"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-MED-001: High risk but no statin
    {
        let ten_year = super::utils::estimate_ten_year_risk(data);
        if ten_year >= 7.5 && data.cholesterol_lipids.on_statin != "yes" {
            flags.push(AdditionalFlag {
                id: "FLAG-MED-001".to_string(),
                category: "Medications".to_string(),
                message: "Intermediate/high CVD risk but not on statin therapy".to_string(),
                priority: "medium".to_string(),
            });
        }
    }

    // FLAG-MED-002: Diabetes but no diabetes medication
    if data.metabolic_health.has_diabetes == "yes"
        && data.current_medications.on_diabetes_medication != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medications".to_string(),
            message: "Diabetes present but no diabetes medication reported".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-COMBO-001: Smoking + diabetes + hypertension combination
    if is_smoker(&data.smoking_history.smoking_status)
        && data.metabolic_health.has_diabetes == "yes"
        && data.blood_pressure.systolic_bp.is_some_and(|s| s >= 140.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-COMBO-001".to_string(),
            category: "Combination Risk".to_string(),
            message: "Smoking + diabetes + hypertension - very high-risk combination".to_string(),
            priority: "high".to_string(),
        });
    }

    // Sort: high > medium > low
    flags.sort_by_key(|f| match f.priority.as_str() {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });

    flags
}
