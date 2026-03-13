use super::types::AssessmentData;
use super::utils::{estimate_ten_year_risk, hba1c_to_percent, is_smoker};

/// A declarative risk rule for the PREVENT calculator.
pub struct RiskRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub risk_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All risk rules, ordered by risk level (high -> medium -> low).
pub fn all_rules() -> Vec<RiskRule> {
    vec![
        // ─── HIGH RISK ───────────────────────────────────────────
        RiskRule {
            id: "PVT-001",
            category: "Overall Risk",
            description: "Estimated 10-year CVD risk >= 20%",
            risk_level: "high",
            evaluate: |d| estimate_ten_year_risk(d) >= 20.0,
        },
        RiskRule {
            id: "PVT-002",
            category: "Renal / Diabetes",
            description: "Diabetes with eGFR < 30 (severe CKD with diabetes)",
            risk_level: "high",
            evaluate: |d| {
                d.metabolic_health.has_diabetes == "yes"
                    && d.renal_function.egfr.is_some_and(|e| e < 30.0)
            },
        },
        RiskRule {
            id: "PVT-003",
            category: "Blood Pressure",
            description: "Systolic BP >= 180 mmHg (hypertensive crisis)",
            risk_level: "high",
            evaluate: |d| d.blood_pressure.systolic_bp.is_some_and(|s| s >= 180.0),
        },
        RiskRule {
            id: "PVT-004",
            category: "Multiple Factors",
            description: "Multiple major risk factors (>= 3 of: diabetes, smoking, BP >= 160, TC >= 280, eGFR < 45)",
            risk_level: "high",
            evaluate: |d| {
                let mut count = 0u8;
                if d.metabolic_health.has_diabetes == "yes" {
                    count += 1;
                }
                if is_smoker(&d.smoking_history.smoking_status) {
                    count += 1;
                }
                if d.blood_pressure.systolic_bp.is_some_and(|s| s >= 160.0) {
                    count += 1;
                }
                if d.cholesterol_lipids.total_cholesterol.is_some_and(|t| t >= 280.0) {
                    count += 1;
                }
                if d.renal_function.egfr.is_some_and(|e| e < 45.0) {
                    count += 1;
                }
                count >= 3
            },
        },
        RiskRule {
            id: "PVT-005",
            category: "Diabetes / Smoking",
            description: "HbA1c >= 10% with current smoking",
            risk_level: "high",
            evaluate: |d| {
                let hba1c = hba1c_to_percent(
                    d.metabolic_health.hba1c_value,
                    &d.metabolic_health.hba1c_unit,
                );
                hba1c.is_some_and(|h| h >= 10.0) && is_smoker(&d.smoking_history.smoking_status)
            },
        },
        // ─── MEDIUM RISK ─────────────────────────────────────────
        RiskRule {
            id: "PVT-006",
            category: "Overall Risk",
            description: "10-year risk 7.5-19.9% (intermediate risk)",
            risk_level: "medium",
            evaluate: |d| {
                let risk = estimate_ten_year_risk(d);
                risk >= 7.5 && risk < 20.0
            },
        },
        RiskRule {
            id: "PVT-007",
            category: "Smoking",
            description: "Current smoker",
            risk_level: "medium",
            evaluate: |d| is_smoker(&d.smoking_history.smoking_status),
        },
        RiskRule {
            id: "PVT-008",
            category: "Diabetes",
            description: "Diabetes present",
            risk_level: "medium",
            evaluate: |d| d.metabolic_health.has_diabetes == "yes",
        },
        RiskRule {
            id: "PVT-009",
            category: "Renal Function",
            description: "eGFR 15-44 mL/min (CKD stage 3b-4)",
            risk_level: "medium",
            evaluate: |d| d.renal_function.egfr.is_some_and(|e| e >= 15.0 && e < 45.0),
        },
        RiskRule {
            id: "PVT-010",
            category: "Blood Pressure",
            description: "Systolic BP 140-179 mmHg (hypertension)",
            risk_level: "medium",
            evaluate: |d| d.blood_pressure.systolic_bp.is_some_and(|s| s >= 140.0 && s < 180.0),
        },
        RiskRule {
            id: "PVT-011",
            category: "Cholesterol",
            description: "Total cholesterol >= 240 mg/dL",
            risk_level: "medium",
            evaluate: |d| d.cholesterol_lipids.total_cholesterol.is_some_and(|t| t >= 240.0),
        },
        RiskRule {
            id: "PVT-012",
            category: "Cholesterol",
            description: "HDL cholesterol < 40 mg/dL (low)",
            risk_level: "medium",
            evaluate: |d| d.cholesterol_lipids.hdl_cholesterol.is_some_and(|h| h < 40.0),
        },
        RiskRule {
            id: "PVT-013",
            category: "BMI",
            description: "BMI >= 30 (obese)",
            risk_level: "medium",
            evaluate: |d| d.metabolic_health.bmi.is_some_and(|b| b >= 30.0),
        },
        RiskRule {
            id: "PVT-014",
            category: "Medications",
            description: "On antihypertensive medication (known hypertension)",
            risk_level: "medium",
            evaluate: |d| d.blood_pressure.on_antihypertensive == "yes",
        },
        RiskRule {
            id: "PVT-015",
            category: "Renal Function",
            description: "Albuminuria (uACR > 30 mg/g)",
            risk_level: "medium",
            evaluate: |d| d.renal_function.urine_acr.is_some_and(|u| u > 30.0),
        },
        // ─── LOW RISK (protective indicators) ────────────────────
        RiskRule {
            id: "PVT-016",
            category: "Cholesterol",
            description: "HDL cholesterol >= 60 mg/dL (protective)",
            risk_level: "low",
            evaluate: |d| d.cholesterol_lipids.hdl_cholesterol.is_some_and(|h| h >= 60.0),
        },
        RiskRule {
            id: "PVT-017",
            category: "Smoking",
            description: "Non-smoker",
            risk_level: "low",
            evaluate: |d| {
                !d.smoking_history.smoking_status.is_empty()
                    && !is_smoker(&d.smoking_history.smoking_status)
            },
        },
        RiskRule {
            id: "PVT-018",
            category: "Blood Pressure",
            description: "Normal BP (< 120/80 mmHg), no treatment",
            risk_level: "low",
            evaluate: |d| {
                d.blood_pressure.systolic_bp.is_some_and(|s| s < 120.0)
                    && d.blood_pressure.diastolic_bp.is_some_and(|dia| dia < 80.0)
                    && d.blood_pressure.on_antihypertensive != "yes"
            },
        },
        RiskRule {
            id: "PVT-019",
            category: "Renal Function",
            description: "eGFR >= 90 mL/min (normal renal function)",
            risk_level: "low",
            evaluate: |d| d.renal_function.egfr.is_some_and(|e| e >= 90.0),
        },
        RiskRule {
            id: "PVT-020",
            category: "BMI",
            description: "BMI 18.5-24.9 (normal weight)",
            risk_level: "low",
            evaluate: |d| d.metabolic_health.bmi.is_some_and(|b| b >= 18.5 && b <= 24.9),
        },
    ]
}
