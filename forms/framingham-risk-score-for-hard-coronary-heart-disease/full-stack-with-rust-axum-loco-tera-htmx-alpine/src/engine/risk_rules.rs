use super::types::AssessmentData;
use super::utils::{calculate_bmi, convert_mmol_to_mg, is_smoker};

/// A declarative risk rule.
pub struct RiskRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub risk_level: &'static str,
    pub evaluate: fn(&AssessmentData, f64) -> bool,
}

/// Helper: get total cholesterol in mg/dL.
fn get_tc_mg(data: &AssessmentData) -> Option<f64> {
    data.cholesterol.total_cholesterol.map(|tc| {
        if data.cholesterol.cholesterol_unit == "mmolL" {
            convert_mmol_to_mg(tc)
        } else {
            tc
        }
    })
}

/// Helper: get HDL cholesterol in mg/dL.
fn get_hdl_mg(data: &AssessmentData) -> Option<f64> {
    data.cholesterol.hdl_cholesterol.map(|hdl| {
        if data.cholesterol.cholesterol_unit == "mmolL" {
            convert_mmol_to_mg(hdl)
        } else {
            hdl
        }
    })
}

/// Helper: get effective BMI (from lifestyle_factors or calculated).
fn get_bmi(data: &AssessmentData) -> Option<f64> {
    data.lifestyle_factors.bmi.or_else(|| {
        calculate_bmi(data.demographics.height_cm, data.demographics.weight_kg)
    })
}

/// All risk rules, ordered by risk level (high -> medium -> low).
pub fn all_rules() -> Vec<RiskRule> {
    vec![
        // ─── HIGH ─────────────────────────────────────────────
        RiskRule {
            id: "FRS-001",
            category: "Overall Risk",
            description: "10-year CHD risk >= 20% (high risk)",
            risk_level: "high",
            evaluate: |_d, risk_pct| risk_pct >= 20.0,
        },
        RiskRule {
            id: "FRS-002",
            category: "Blood Pressure",
            description: "Systolic BP >= 180 mmHg (hypertensive crisis)",
            risk_level: "high",
            evaluate: |d, _| d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 180.0),
        },
        RiskRule {
            id: "FRS-003",
            category: "Cholesterol",
            description: "Total cholesterol >= 310 mg/dL (severe hypercholesterolemia)",
            risk_level: "high",
            evaluate: |d, _| get_tc_mg(d).is_some_and(|tc| tc >= 310.0),
        },
        RiskRule {
            id: "FRS-004",
            category: "Cholesterol",
            description: "HDL < 30 mg/dL (critically low HDL)",
            risk_level: "high",
            evaluate: |d, _| get_hdl_mg(d).is_some_and(|hdl| hdl < 30.0),
        },
        RiskRule {
            id: "FRS-005",
            category: "Combined Risk",
            description: "Multiple risk factors: age >= 60, smoker, BP >= 140, TC >= 240",
            risk_level: "high",
            evaluate: |d, _| {
                let age_ok = d.demographics.age.is_some_and(|a| a >= 60);
                let smoker = is_smoker(&d.smoking_history.smoking_status);
                let bp_ok = d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 140.0);
                let tc_ok = get_tc_mg(d).is_some_and(|tc| tc >= 240.0);
                age_ok && smoker && bp_ok && tc_ok
            },
        },
        // ─── MEDIUM ───────────────────────────────────────────
        RiskRule {
            id: "FRS-006",
            category: "Overall Risk",
            description: "10-year CHD risk 10-19.9% (intermediate risk)",
            risk_level: "medium",
            evaluate: |_d, risk_pct| risk_pct >= 10.0 && risk_pct < 20.0,
        },
        RiskRule {
            id: "FRS-007",
            category: "Smoking",
            description: "Current smoker",
            risk_level: "medium",
            evaluate: |d, _| is_smoker(&d.smoking_history.smoking_status),
        },
        RiskRule {
            id: "FRS-008",
            category: "Blood Pressure",
            description: "Systolic BP 140-179 mmHg (stage 2 hypertension)",
            risk_level: "medium",
            evaluate: |d, _| d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 140.0 && sbp < 180.0),
        },
        RiskRule {
            id: "FRS-009",
            category: "Cholesterol",
            description: "Total cholesterol 240-309 mg/dL (elevated)",
            risk_level: "medium",
            evaluate: |d, _| get_tc_mg(d).is_some_and(|tc| tc >= 240.0 && tc < 310.0),
        },
        RiskRule {
            id: "FRS-010",
            category: "Cholesterol",
            description: "HDL 30-39 mg/dL (low)",
            risk_level: "medium",
            evaluate: |d, _| get_hdl_mg(d).is_some_and(|hdl| hdl >= 30.0 && hdl < 40.0),
        },
        RiskRule {
            id: "FRS-011",
            category: "Blood Pressure",
            description: "On BP treatment (indicating known hypertension)",
            risk_level: "medium",
            evaluate: |d, _| d.blood_pressure.on_bp_treatment == "yes",
        },
        RiskRule {
            id: "FRS-012",
            category: "Family History",
            description: "Family history of premature CHD (onset < 55 male, < 65 female)",
            risk_level: "medium",
            evaluate: |d, _| {
                d.family_history.family_chd_history == "yes"
                    && d.family_history.family_chd_age_onset == "under55"
            },
        },
        RiskRule {
            id: "FRS-013",
            category: "Lifestyle",
            description: "BMI >= 30 (obese)",
            risk_level: "medium",
            evaluate: |d, _| get_bmi(d).is_some_and(|bmi| bmi >= 30.0),
        },
        RiskRule {
            id: "FRS-014",
            category: "Lifestyle",
            description: "Sedentary lifestyle",
            risk_level: "medium",
            evaluate: |d, _| d.lifestyle_factors.physical_activity == "sedentary",
        },
        RiskRule {
            id: "FRS-015",
            category: "Demographics",
            description: "Age >= 65",
            risk_level: "medium",
            evaluate: |d, _| d.demographics.age.is_some_and(|a| a >= 65),
        },
        // ─── LOW (protective indicators) ──────────────────────
        RiskRule {
            id: "FRS-016",
            category: "Cholesterol",
            description: "HDL >= 60 mg/dL (protective factor)",
            risk_level: "low",
            evaluate: |d, _| get_hdl_mg(d).is_some_and(|hdl| hdl >= 60.0),
        },
        RiskRule {
            id: "FRS-017",
            category: "Smoking",
            description: "Non-smoker",
            risk_level: "low",
            evaluate: |d, _| !is_smoker(&d.smoking_history.smoking_status) && !d.smoking_history.smoking_status.is_empty(),
        },
        RiskRule {
            id: "FRS-018",
            category: "Blood Pressure",
            description: "Normal BP (< 120/80) without treatment",
            risk_level: "low",
            evaluate: |d, _| {
                d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp < 120.0)
                    && d.blood_pressure.diastolic_bp.is_some_and(|dbp| dbp < 80.0)
                    && d.blood_pressure.on_bp_treatment != "yes"
            },
        },
        RiskRule {
            id: "FRS-019",
            category: "Cholesterol",
            description: "Total cholesterol < 200 mg/dL (optimal)",
            risk_level: "low",
            evaluate: |d, _| get_tc_mg(d).is_some_and(|tc| tc < 200.0),
        },
        RiskRule {
            id: "FRS-020",
            category: "Lifestyle",
            description: "Physically active (moderate or vigorous exercise)",
            risk_level: "low",
            evaluate: |d, _| {
                d.lifestyle_factors.physical_activity == "moderate"
                    || d.lifestyle_factors.physical_activity == "vigorous"
            },
        },
    ]
}
