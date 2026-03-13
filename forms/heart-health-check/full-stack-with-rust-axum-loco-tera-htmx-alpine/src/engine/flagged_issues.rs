use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{calculate_bmi, calculate_tc_hdl_ratio, estimate_ten_year_risk, calculate_heart_age};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the risk category. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // FLAG-AGE-001: Age outside 25-84 range
    if let Some(age) = data.demographics_ethnicity.age {
        if age < 25 || age > 84 {
            flags.push(AdditionalFlag {
                id: "FLAG-AGE-001".to_string(),
                category: "Eligibility".to_string(),
                message: "Age outside validated range (25-84) - QRISK3 may not be applicable".to_string(),
                priority: "high".to_string(),
            });
        }
    }

    // FLAG-CVD-001: Not directly captured but flagged if clinical notes mention CVD
    // (placeholder - in practice would check for existing CVD diagnosis)

    // FLAG-BP-001: Systolic >= 180 (urgent)
    if data.blood_pressure.systolic_bp.is_some_and(|sbp| sbp >= 180.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-001".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Systolic BP 180+ mmHg - urgent hypertension management required".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-BP-002: Diastolic >= 120 (emergency)
    if data.blood_pressure.diastolic_bp.is_some_and(|dbp| dbp >= 120.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BP-002".to_string(),
            category: "Blood Pressure".to_string(),
            message: "Diastolic BP 120+ mmHg - hypertensive emergency".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-CHOL-001: TC/HDL ratio >= 8 (severe)
    let ratio = data.cholesterol.total_hdl_ratio
        .or_else(|| calculate_tc_hdl_ratio(data.cholesterol.total_cholesterol, data.cholesterol.hdl_cholesterol));
    if ratio.is_some_and(|r| r >= 8.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-CHOL-001".to_string(),
            category: "Cholesterol".to_string(),
            message: "TC/HDL ratio 8+ - severe dyslipidaemia requiring urgent review".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-DM-001: Diabetes without statin (proxy for uncontrolled)
    if (data.medical_conditions.has_diabetes == "type1"
        || data.medical_conditions.has_diabetes == "type2")
        && data.cholesterol.on_statin != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DM-001".to_string(),
            category: "Diabetes".to_string(),
            message: "Diabetes present without statin therapy - review lipid management".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-CKD-001: CKD with diabetes
    if data.medical_conditions.has_chronic_kidney_disease == "yes"
        && (data.medical_conditions.has_diabetes == "type1"
            || data.medical_conditions.has_diabetes == "type2")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CKD-001".to_string(),
            category: "Renal".to_string(),
            message: "CKD combined with diabetes - high cardiovascular risk, specialist review".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-SMOKE-001: Heavy smoker (>= 20/day)
    if data.smoking_alcohol.cigarettes_per_day.is_some_and(|c| c >= 20) {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Smoking".to_string(),
            message: "Heavy smoker (20+ cigarettes/day) - intensive cessation support recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-AF-001: AF without anticoagulant (proxy: AF present, no specific anticoagulant field)
    if data.medical_conditions.has_atrial_fibrillation == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AF-001".to_string(),
            category: "Cardiac".to_string(),
            message: "Atrial fibrillation present - ensure anticoagulation status is reviewed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-BMI-001: BMI >= 40 (morbid obesity)
    let bmi = data.body_measurements.bmi
        .or_else(|| calculate_bmi(data.body_measurements.height_cm, data.body_measurements.weight_kg));
    if bmi.is_some_and(|b| b >= 40.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-BMI-001".to_string(),
            category: "Body Composition".to_string(),
            message: "BMI 40+ (morbid obesity) - weight management and bariatric referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-AUDIT-001: High AUDIT score (>= 16)
    if data.review_calculate.audit_score.is_some_and(|s| s >= 16) {
        flags.push(AdditionalFlag {
            id: "FLAG-AUDIT-001".to_string(),
            category: "Alcohol".to_string(),
            message: "AUDIT score 16+ - harmful/dependent drinking, specialist referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-HEART-001: Heart age >= 15 years above chronological
    let ten_year_risk = estimate_ten_year_risk(data);
    let heart_age = calculate_heart_age(data, ten_year_risk);
    if let (Some(ha), Some(age)) = (heart_age, data.demographics_ethnicity.age) {
        if ha >= age + 15 {
            flags.push(AdditionalFlag {
                id: "FLAG-HEART-001".to_string(),
                category: "Heart Age".to_string(),
                message: "Heart age 15+ years above chronological age - significant excess risk".to_string(),
                priority: "high".to_string(),
            });
        }
    }

    // FLAG-MED-001: High risk but no statin
    if ten_year_risk >= 10.0 && data.cholesterol.on_statin != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "10-year risk 10%+ without statin therapy - consider statin initiation per NICE".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-INACT-001: Completely sedentary (< 30 min/week)
    if data.physical_activity_diet.physical_activity_minutes_per_week.is_some_and(|m| m < 30) {
        flags.push(AdditionalFlag {
            id: "FLAG-INACT-001".to_string(),
            category: "Physical Activity".to_string(),
            message: "Sedentary lifestyle (under 30 min/week) - physical activity counselling".to_string(),
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
