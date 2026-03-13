use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{has_established_cvd, hba1c_mmol_mol, calculate_bmi};

pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // Hypertensive crisis
    if data.blood_pressure.systolic_bp.is_some_and(|v| v >= 180.0)
        || data.blood_pressure.diastolic_bp.is_some_and(|v| v >= 120.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Hypertensive crisis - urgent assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // BP not at target despite treatment
    if data.blood_pressure.on_antihypertensive == "yes"
        && data.blood_pressure.systolic_bp.is_some_and(|v| v >= 140.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-002".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Blood pressure not at target despite antihypertensive therapy - review medication".to_string(),
            priority: "medium".to_string(),
        });
    }

    // Very high HbA1c
    if hba1c_mmol_mol(data).is_some_and(|v| v >= 86.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-HBA1C-001".to_string(),
            category: "Glycaemic Control".to_string(),
            message: "HbA1c ≥86 mmol/mol (10%) - urgent glycaemic management review".to_string(),
            priority: "high".to_string(),
        });
    }

    // SGLT2i/GLP1-RA not prescribed for CVD patient
    if has_established_cvd(data)
        && data.current_medications.sglt2_inhibitor != "yes"
        && data.current_medications.glp1_agonist != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medications".to_string(),
            message: "Established CVD without SGLT2 inhibitor or GLP-1 agonist - consider cardioprotective therapy".to_string(),
            priority: "high".to_string(),
        });
    }

    // No statin for high-risk patient
    if has_established_cvd(data) && data.lipid_profile.on_statin != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medications".to_string(),
            message: "Established CVD without statin therapy".to_string(),
            priority: "high".to_string(),
        });
    }

    // No ACEi/ARB with albuminuria
    if data.renal_function.urine_acr.is_some_and(|v| v >= 3.0)
        && data.current_medications.ace_inhibitor_or_arb != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-003".to_string(),
            category: "Medications".to_string(),
            message: "Albuminuria without ACE inhibitor or ARB - consider renoprotective therapy".to_string(),
            priority: "medium".to_string(),
        });
    }

    // Eye screening overdue
    if data.complications_screening.retinopathy_status == "notScreened" {
        flags.push(AdditionalFlag {
            id: "FLAG-SCREEN-001".to_string(),
            category: "Screening".to_string(),
            message: "Retinopathy screening not completed - arrange eye screening".to_string(),
            priority: "medium".to_string(),
        });
    }

    // Foot exam abnormal
    if data.complications_screening.monofilament_test == "abnormal"
        || data.complications_screening.foot_pulses == "absent"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SCREEN-002".to_string(),
            category: "Screening".to_string(),
            message: "Abnormal foot examination - refer to diabetic foot team".to_string(),
            priority: "high".to_string(),
        });
    }

    // Foot ulcer history
    if data.complications_screening.foot_ulcer_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SCREEN-003".to_string(),
            category: "Screening".to_string(),
            message: "History of foot ulceration - high-risk foot, ensure podiatry follow-up".to_string(),
            priority: "medium".to_string(),
        });
    }

    // Severe obesity
    let bmi = data.lifestyle_factors.bmi
        .or_else(|| calculate_bmi(data.patient_demographics.height_cm, data.patient_demographics.weight_kg));
    if bmi.is_some_and(|v| v >= 40.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BMI-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Severe obesity (BMI ≥40) - consider bariatric/metabolic surgery referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // Current smoker
    if data.lifestyle_factors.smoking_status == "current" {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Current smoker - offer smoking cessation support".to_string(),
            priority: "medium".to_string(),
        });
    }

    // eGFR declining rapidly (CKD stage 4-5)
    if data.renal_function.egfr.is_some_and(|v| v < 30.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-RENAL-001".to_string(),
            category: "Renal".to_string(),
            message: "eGFR <30 - consider nephrology referral and medication dose adjustment".to_string(),
            priority: "high".to_string(),
        });
    }

    // Symptomatic CVD
    if data.cardiovascular_history.current_chest_pain == "yes"
        || data.cardiovascular_history.current_dyspnoea == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CVD-001".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Active cardiovascular symptoms reported - consider urgent cardiology assessment".to_string(),
            priority: "high".to_string(),
        });
    }

    // No metformin as first-line
    if data.diabetes_history.diabetes_type == "type2"
        && data.current_medications.metformin != "yes"
        && data.renal_function.egfr.map_or(true, |v| v >= 30.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-004".to_string(),
            category: "Medications".to_string(),
            message: "Type 2 diabetes without metformin (eGFR adequate) - consider first-line therapy".to_string(),
            priority: "low".to_string(),
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
