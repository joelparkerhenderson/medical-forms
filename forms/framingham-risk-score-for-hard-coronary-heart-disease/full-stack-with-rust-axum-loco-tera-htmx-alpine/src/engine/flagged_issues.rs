use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{calculate_bmi, calculate_framingham_risk, convert_mmol_to_mg, is_smoker};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the risk score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // Helper: get TC in mg/dL
    let tc_mg = data.cholesterol.total_cholesterol.map(|tc| {
        if data.cholesterol.cholesterol_unit == "mmolL" {
            convert_mmol_to_mg(tc)
        } else {
            tc
        }
    });

    // Helper: get HDL in mg/dL
    let hdl_mg = data.cholesterol.hdl_cholesterol.map(|hdl| {
        if data.cholesterol.cholesterol_unit == "mmolL" {
            convert_mmol_to_mg(hdl)
        } else {
            hdl
        }
    });

    // Helper: get effective BMI
    let bmi = data.lifestyle_factors.bmi.or_else(|| {
        calculate_bmi(data.demographics.height_cm, data.demographics.weight_kg)
    });

    // ─── FLAG-ELIG-001: Age outside 30-79 range ───────────
    if let Some(age) = data.demographics.age {
        if age < 30 || age > 79 {
            flags.push(AdditionalFlag {
                id: "FLAG-ELIG-001".to_string(),
                category: "Eligibility".to_string(),
                message: "Age outside valid range (30-79) - calculator may not be applicable".to_string(),
                priority: "high".to_string(),
            });
        }
    }

    // ─── FLAG-ELIG-002: Has prior CHD ─────────────────────
    if data.medical_history.has_prior_chd == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ELIG-002".to_string(),
            category: "Eligibility".to_string(),
            message: "Patient has prior CHD - Framingham calculator not applicable for secondary prevention".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-ELIG-003: Has diabetes ──────────────────────
    if data.medical_history.has_diabetes == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ELIG-003".to_string(),
            category: "Eligibility".to_string(),
            message: "Patient has diabetes - use diabetes-specific risk calculator instead".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-BP-001: Systolic >= 180 ─────────────────────
    if data.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 180.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Systolic BP >= 180 mmHg - urgent evaluation needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-BP-002: Diastolic >= 120 ────────────────────
    if data.blood_pressure.diastolic_bp.is_some_and(|dbp| dbp >= 120.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-002".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Diastolic BP >= 120 mmHg - hypertensive emergency".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CHOL-001: Total cholesterol >= 300 ──────────
    if tc_mg.is_some_and(|tc| tc >= 300.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-CHOL-001".to_string(),
            category: "Cholesterol".to_string(),
            message: "Total cholesterol >= 300 mg/dL - severe hypercholesterolemia".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CHOL-002: HDL < 30 ──────────────────────────
    if hdl_mg.is_some_and(|hdl| hdl < 30.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-CHOL-002".to_string(),
            category: "Cholesterol".to_string(),
            message: "HDL < 30 mg/dL - critically low protective cholesterol".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SMOKE-001: Current smoker ───────────────────
    if is_smoker(&data.smoking_history.smoking_status) {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Smoking".to_string(),
            message: "Current smoker - smoking cessation counselling recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BMI-001: BMI >= 40 ──────────────────────────
    if bmi.is_some_and(|b| b >= 40.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BMI-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "BMI >= 40 (morbid obesity) - weight management referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FAM-001: Premature family CHD history ───────
    if data.family_history.family_chd_history == "yes"
        && data.family_history.family_chd_age_onset == "under55"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FAM-001".to_string(),
            category: "Family History".to_string(),
            message: "Premature family CHD history - consider enhanced screening".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-MED-001: High risk but not on statin ────────
    let risk_pct = calculate_framingham_risk(data);
    if risk_pct >= 20.0 && data.current_medications.on_statin != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medications".to_string(),
            message: "High 10-year risk but not on statin therapy - consider initiating".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MED-002: Hypertension but not on treatment ──
    if data.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 140.0)
        && data.blood_pressure.on_bp_treatment != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medications".to_string(),
            message: "Hypertension detected but not on antihypertensive treatment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-LIFE-001: Sedentary + obese ─────────────────
    if data.lifestyle_factors.physical_activity == "sedentary"
        && bmi.is_some_and(|b| b >= 30.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LIFE-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Sedentary lifestyle combined with obesity - lifestyle intervention needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-AGE-001: Age >= 75 ──────────────────────────
    if data.demographics.age.is_some_and(|a| a >= 75) {
        flags.push(AdditionalFlag {
            id: "FLAG-AGE-001".to_string(),
            category: "Demographics".to_string(),
            message: "Age >= 75 - limited evidence for Framingham risk prediction in this age group".to_string(),
            priority: "medium".to_string(),
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
