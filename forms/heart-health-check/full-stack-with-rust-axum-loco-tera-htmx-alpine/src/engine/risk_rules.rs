use super::types::AssessmentData;
use super::utils::{calculate_bmi, calculate_tc_hdl_ratio, is_smoker};

/// A declarative cardiovascular risk rule.
pub struct RiskRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub risk_level: &'static str,
    pub evaluate: fn(&AssessmentData, f64, Option<u8>) -> bool,
}

/// All risk rules, ordered by risk level (high -> medium -> low).
pub fn all_rules() -> Vec<RiskRule> {
    vec![
        // ─── HIGH RISK ─────────────────────────────────────────
        RiskRule {
            id: "HHC-001",
            category: "Overall Risk",
            description: "10-year CVD risk 20% or higher",
            risk_level: "high",
            evaluate: |_d, risk, _ha| risk >= 20.0,
        },
        RiskRule {
            id: "HHC-002",
            category: "Diabetes",
            description: "Type 1 diabetes with age 40 or over",
            risk_level: "high",
            evaluate: |d, _risk, _ha| {
                d.medical_conditions.has_diabetes == "type1"
                    && d.demographics_ethnicity.age.is_some_and(|a| a >= 40)
            },
        },
        RiskRule {
            id: "HHC-003",
            category: "Blood Pressure",
            description: "Systolic BP 180 or higher (hypertensive crisis)",
            risk_level: "high",
            evaluate: |d, _risk, _ha| {
                d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 180.0)
            },
        },
        RiskRule {
            id: "HHC-004",
            category: "Renal",
            description: "CKD stage 3+ combined with diabetes",
            risk_level: "high",
            evaluate: |d, _risk, _ha| {
                d.medical_conditions.has_chronic_kidney_disease == "yes"
                    && (d.medical_conditions.has_diabetes == "type1"
                        || d.medical_conditions.has_diabetes == "type2")
            },
        },
        RiskRule {
            id: "HHC-005",
            category: "Multiple Factors",
            description: "Three or more major risk factors present",
            risk_level: "high",
            evaluate: |d, _risk, _ha| {
                let mut count = 0u8;
                if d.medical_conditions.has_diabetes == "type1"
                    || d.medical_conditions.has_diabetes == "type2"
                {
                    count += 1;
                }
                if is_smoker(&d.smoking_alcohol.smoking_status) {
                    count += 1;
                }
                if d.medical_conditions.has_atrial_fibrillation == "yes" {
                    count += 1;
                }
                if d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 160.0) {
                    count += 1;
                }
                let ratio = d.cholesterol.total_hdl_ratio
                    .or_else(|| calculate_tc_hdl_ratio(
                        d.cholesterol.total_cholesterol,
                        d.cholesterol.hdl_cholesterol,
                    ));
                if ratio.is_some_and(|r| r >= 6.0) {
                    count += 1;
                }
                count >= 3
            },
        },
        // ─── MEDIUM RISK ───────────────────────────────────────
        RiskRule {
            id: "HHC-006",
            category: "Overall Risk",
            description: "10-year CVD risk between 10% and 19.9%",
            risk_level: "medium",
            evaluate: |_d, risk, _ha| risk >= 10.0 && risk < 20.0,
        },
        RiskRule {
            id: "HHC-007",
            category: "Smoking",
            description: "Current smoker (any level)",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| is_smoker(&d.smoking_alcohol.smoking_status),
        },
        RiskRule {
            id: "HHC-008",
            category: "Diabetes",
            description: "Type 2 diabetes",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| d.medical_conditions.has_diabetes == "type2",
        },
        RiskRule {
            id: "HHC-009",
            category: "Cardiac",
            description: "Atrial fibrillation",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| d.medical_conditions.has_atrial_fibrillation == "yes",
        },
        RiskRule {
            id: "HHC-010",
            category: "Blood Pressure",
            description: "Systolic BP between 140 and 179",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| {
                d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 140.0 && sbp < 180.0)
            },
        },
        RiskRule {
            id: "HHC-011",
            category: "Cholesterol",
            description: "TC/HDL ratio 6 or higher",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| {
                let ratio = d.cholesterol.total_hdl_ratio
                    .or_else(|| calculate_tc_hdl_ratio(
                        d.cholesterol.total_cholesterol,
                        d.cholesterol.hdl_cholesterol,
                    ));
                ratio.is_some_and(|r| r >= 6.0)
            },
        },
        RiskRule {
            id: "HHC-012",
            category: "Renal",
            description: "CKD stage 3 or higher",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| d.medical_conditions.has_chronic_kidney_disease == "yes",
        },
        RiskRule {
            id: "HHC-013",
            category: "Body Composition",
            description: "BMI 30 or higher (obese)",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| {
                let bmi = d.body_measurements.bmi
                    .or_else(|| calculate_bmi(d.body_measurements.height_cm, d.body_measurements.weight_kg));
                bmi.is_some_and(|b| b >= 30.0)
            },
        },
        RiskRule {
            id: "HHC-014",
            category: "Family History",
            description: "First-degree relative with CVD under 60",
            risk_level: "medium",
            evaluate: |d, _risk, _ha| d.family_history.family_cvd_under_60 == "yes",
        },
        RiskRule {
            id: "HHC-015",
            category: "Heart Age",
            description: "Heart age 10 or more years above chronological age",
            risk_level: "medium",
            evaluate: |d, _risk, ha| {
                if let (Some(heart_age), Some(actual_age)) = (ha, d.demographics_ethnicity.age) {
                    heart_age >= actual_age + 10
                } else {
                    false
                }
            },
        },
        // ─── LOW RISK (positive indicators) ────────────────────
        RiskRule {
            id: "HHC-016",
            category: "Smoking",
            description: "Non-smoker",
            risk_level: "low",
            evaluate: |d, _risk, _ha| d.smoking_alcohol.smoking_status == "nonSmoker",
        },
        RiskRule {
            id: "HHC-017",
            category: "Blood Pressure",
            description: "Normal blood pressure (below 120/80) without treatment",
            risk_level: "low",
            evaluate: |d, _risk, _ha| {
                d.blood_pressure.systolic_bp.is_some_and(|sbp| sbp < 120.0)
                    && d.blood_pressure.diastolic_bp.is_some_and(|dbp| dbp < 80.0)
                    && d.blood_pressure.on_bp_treatment != "yes"
            },
        },
        RiskRule {
            id: "HHC-018",
            category: "Cholesterol",
            description: "Optimal TC/HDL ratio (below 4)",
            risk_level: "low",
            evaluate: |d, _risk, _ha| {
                let ratio = d.cholesterol.total_hdl_ratio
                    .or_else(|| calculate_tc_hdl_ratio(
                        d.cholesterol.total_cholesterol,
                        d.cholesterol.hdl_cholesterol,
                    ));
                ratio.is_some_and(|r| r < 4.0)
            },
        },
        RiskRule {
            id: "HHC-019",
            category: "Physical Activity",
            description: "Physically active (150+ minutes per week moderate intensity)",
            risk_level: "low",
            evaluate: |d, _risk, _ha| {
                d.physical_activity_diet.physical_activity_minutes_per_week
                    .is_some_and(|m| m >= 150)
            },
        },
        RiskRule {
            id: "HHC-020",
            category: "Body Composition",
            description: "Normal BMI (18.5 to 24.9)",
            risk_level: "low",
            evaluate: |d, _risk, _ha| {
                let bmi = d.body_measurements.bmi
                    .or_else(|| calculate_bmi(d.body_measurements.height_cm, d.body_measurements.weight_kg));
                bmi.is_some_and(|b| b >= 18.5 && b < 25.0)
            },
        },
    ]
}
