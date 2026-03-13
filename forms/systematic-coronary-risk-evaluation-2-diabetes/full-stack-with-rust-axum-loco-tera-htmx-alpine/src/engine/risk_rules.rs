use super::types::AssessmentData;
use super::utils::{has_established_cvd, hba1c_mmol_mol, calculate_bmi};

pub struct RiskRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub risk_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

pub fn all_rules() -> Vec<RiskRule> {
    vec![
        // HIGH RISK rules
        RiskRule {
            id: "CVR-001",
            category: "Cardiovascular History",
            description: "Established cardiovascular disease (prior MI, stroke, TIA, PAD, or HF)",
            risk_level: "high",
            evaluate: |d| has_established_cvd(d),
        },
        RiskRule {
            id: "CVR-002",
            category: "Blood Pressure",
            description: "Severely elevated blood pressure (systolic ≥180 mmHg)",
            risk_level: "high",
            evaluate: |d| d.blood_pressure.systolic_bp.is_some_and(|v| v >= 180.0),
        },
        RiskRule {
            id: "CVR-003",
            category: "Glycaemic Control",
            description: "Very poor glycaemic control (HbA1c ≥75 mmol/mol / 9%)",
            risk_level: "high",
            evaluate: |d| hba1c_mmol_mol(d).is_some_and(|v| v >= 75.0),
        },
        RiskRule {
            id: "CVR-004",
            category: "Renal Function",
            description: "Severe renal impairment (eGFR <30 mL/min/1.73m²)",
            risk_level: "high",
            evaluate: |d| d.renal_function.egfr.is_some_and(|v| v < 30.0),
        },
        RiskRule {
            id: "CVR-005",
            category: "Lipid Profile",
            description: "Severely elevated total cholesterol (≥8.0 mmol/L)",
            risk_level: "high",
            evaluate: |d| d.lipid_profile.total_cholesterol.is_some_and(|v| v >= 8.0),
        },
        RiskRule {
            id: "CVR-006",
            category: "Complications",
            description: "Proliferative or maculopathy retinopathy",
            risk_level: "high",
            evaluate: |d| {
                d.complications_screening.retinopathy_status == "proliferative"
                    || d.complications_screening.retinopathy_status == "maculopathy"
            },
        },
        RiskRule {
            id: "CVR-007",
            category: "Diabetes Duration",
            description: "Long diabetes duration (≥20 years)",
            risk_level: "high",
            evaluate: |d| d.diabetes_history.diabetes_duration_years.is_some_and(|v| v >= 20.0),
        },
        // MEDIUM RISK rules
        RiskRule {
            id: "CVR-008",
            category: "Blood Pressure",
            description: "Elevated blood pressure (systolic ≥140 mmHg)",
            risk_level: "medium",
            evaluate: |d| {
                d.blood_pressure.systolic_bp.is_some_and(|v| v >= 140.0 && v < 180.0)
            },
        },
        RiskRule {
            id: "CVR-009",
            category: "Glycaemic Control",
            description: "Above-target HbA1c (≥53 mmol/mol / 7%)",
            risk_level: "medium",
            evaluate: |d| {
                hba1c_mmol_mol(d).is_some_and(|v| v >= 53.0 && v < 75.0)
            },
        },
        RiskRule {
            id: "CVR-010",
            category: "Lipid Profile",
            description: "Elevated LDL cholesterol (≥2.6 mmol/L)",
            risk_level: "medium",
            evaluate: |d| d.lipid_profile.ldl_cholesterol.is_some_and(|v| v >= 2.6),
        },
        RiskRule {
            id: "CVR-011",
            category: "Lifestyle",
            description: "Current smoker",
            risk_level: "medium",
            evaluate: |d| d.lifestyle_factors.smoking_status == "current",
        },
        RiskRule {
            id: "CVR-012",
            category: "Renal Function",
            description: "Moderate renal impairment (eGFR 30-59 mL/min/1.73m²)",
            risk_level: "medium",
            evaluate: |d| d.renal_function.egfr.is_some_and(|v| v >= 30.0 && v < 60.0),
        },
        RiskRule {
            id: "CVR-013",
            category: "Renal Function",
            description: "Albuminuria present (urine ACR ≥3 mg/mmol)",
            risk_level: "medium",
            evaluate: |d| d.renal_function.urine_acr.is_some_and(|v| v >= 3.0),
        },
        RiskRule {
            id: "CVR-014",
            category: "Lifestyle",
            description: "Obesity (BMI ≥30)",
            risk_level: "medium",
            evaluate: |d| {
                let bmi = d.lifestyle_factors.bmi
                    .or_else(|| calculate_bmi(d.patient_demographics.height_cm, d.patient_demographics.weight_kg));
                bmi.is_some_and(|v| v >= 30.0)
            },
        },
        RiskRule {
            id: "CVR-015",
            category: "Cardiovascular",
            description: "Atrial fibrillation",
            risk_level: "medium",
            evaluate: |d| d.cardiovascular_history.atrial_fibrillation == "yes",
        },
        RiskRule {
            id: "CVR-016",
            category: "Cardiovascular",
            description: "Family history of premature cardiovascular disease",
            risk_level: "medium",
            evaluate: |d| d.cardiovascular_history.family_cvd_history == "yes",
        },
        RiskRule {
            id: "CVR-017",
            category: "Lipid Profile",
            description: "Low HDL cholesterol (<1.0 mmol/L male, <1.2 mmol/L female)",
            risk_level: "medium",
            evaluate: |d| {
                let threshold = if d.patient_demographics.sex == "male" { 1.0 } else { 1.2 };
                d.lipid_profile.hdl_cholesterol.is_some_and(|v| v < threshold)
            },
        },
        // LOW RISK rules (positive indicators or minor concerns)
        RiskRule {
            id: "CVR-018",
            category: "Lifestyle",
            description: "Sedentary lifestyle reported",
            risk_level: "low",
            evaluate: |d| d.lifestyle_factors.physical_activity == "sedentary",
        },
        RiskRule {
            id: "CVR-019",
            category: "Complications",
            description: "Background retinopathy present",
            risk_level: "low",
            evaluate: |d| d.complications_screening.retinopathy_status == "background",
        },
        RiskRule {
            id: "CVR-020",
            category: "Lipid Profile",
            description: "Elevated triglycerides (≥2.3 mmol/L)",
            risk_level: "low",
            evaluate: |d| d.lipid_profile.triglycerides.is_some_and(|v| v >= 2.3),
        },
    ]
}
