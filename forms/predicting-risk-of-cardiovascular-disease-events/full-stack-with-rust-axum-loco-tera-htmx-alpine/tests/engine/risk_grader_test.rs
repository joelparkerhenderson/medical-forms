use prevent_cvd_tera_crate::engine::risk_grader::calculate_risk;
use prevent_cvd_tera_crate::engine::risk_rules::all_rules;
use prevent_cvd_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

/// Young healthy female: age 35, female, normal BP, normal cholesterol, no smoking, no diabetes
fn create_young_healthy_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(35);
    data.demographics.sex = "female".to_string();
    data.blood_pressure.systolic_bp = Some(115.0);
    data.blood_pressure.diastolic_bp = Some(72.0);
    data.blood_pressure.on_antihypertensive = "no".to_string();
    data.cholesterol_lipids.total_cholesterol = Some(180.0);
    data.cholesterol_lipids.hdl_cholesterol = Some(65.0);
    data.cholesterol_lipids.on_statin = "no".to_string();
    data.metabolic_health.has_diabetes = "no".to_string();
    data.metabolic_health.bmi = Some(22.0);
    data.smoking_history.smoking_status = "never".to_string();
    data.renal_function.egfr = Some(95.0);
    data.medical_history.has_known_cvd = "no".to_string();
    data
}

/// Moderate risk male: age 58, male, borderline high BP, elevated cholesterol
fn create_moderate_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(58);
    data.demographics.sex = "male".to_string();
    data.blood_pressure.systolic_bp = Some(145.0);
    data.blood_pressure.diastolic_bp = Some(88.0);
    data.blood_pressure.on_antihypertensive = "yes".to_string();
    data.cholesterol_lipids.total_cholesterol = Some(230.0);
    data.cholesterol_lipids.hdl_cholesterol = Some(42.0);
    data.cholesterol_lipids.on_statin = "no".to_string();
    data.metabolic_health.has_diabetes = "no".to_string();
    data.metabolic_health.bmi = Some(28.0);
    data.smoking_history.smoking_status = "never".to_string();
    data.renal_function.egfr = Some(72.0);
    data.medical_history.has_known_cvd = "no".to_string();
    data
}

/// High risk: older male with diabetes, smoking, elevated BP, low HDL
fn create_high_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(68);
    data.demographics.sex = "male".to_string();
    data.blood_pressure.systolic_bp = Some(165.0);
    data.blood_pressure.diastolic_bp = Some(95.0);
    data.blood_pressure.on_antihypertensive = "yes".to_string();
    data.cholesterol_lipids.total_cholesterol = Some(285.0);
    data.cholesterol_lipids.hdl_cholesterol = Some(35.0);
    data.cholesterol_lipids.on_statin = "no".to_string();
    data.metabolic_health.has_diabetes = "yes".to_string();
    data.metabolic_health.bmi = Some(32.0);
    data.smoking_history.smoking_status = "current".to_string();
    data.renal_function.egfr = Some(40.0);
    data.medical_history.has_known_cvd = "no".to_string();
    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, ten_year, thirty_year, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "draft");
    assert_eq!(ten_year, 0.0);
    assert_eq!(thirty_year, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_risk_for_young_healthy() {
    let data = create_young_healthy_assessment();
    let (level, ten_year, _thirty_year, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "low");
    assert!(ten_year < 5.0, "10-year risk should be < 5% for young healthy, got {ten_year}");
}

#[test]
fn returns_intermediate_for_moderate_risk() {
    let data = create_moderate_risk_assessment();
    let (level, ten_year, _thirty_year, _fired_rules) = calculate_risk(&data);
    assert!(
        level == "intermediate" || level == "borderline",
        "Expected intermediate or borderline for moderate risk, got {level} ({ten_year}%)"
    );
    assert!(ten_year >= 5.0, "10-year risk should be >= 5% for moderate risk, got {ten_year}");
}

#[test]
fn returns_high_for_multiple_risk_factors() {
    let data = create_high_risk_assessment();
    let (level, ten_year, _thirty_year, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "high", "Expected high for multiple risk factors, got {level} ({ten_year}%)");
    assert!(ten_year >= 20.0, "10-year risk should be >= 20% for high risk, got {ten_year}");
}

#[test]
fn fires_smoking_rule() {
    let mut data = create_young_healthy_assessment();
    data.smoking_history.smoking_status = "current".to_string();
    let (_level, _ten_year, _thirty_year, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PVT-007"), "Should fire PVT-007 (current smoker)");
}

#[test]
fn fires_diabetes_rule() {
    let mut data = create_young_healthy_assessment();
    data.metabolic_health.has_diabetes = "yes".to_string();
    let (_level, _ten_year, _thirty_year, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PVT-008"), "Should fire PVT-008 (diabetes present)");
}

#[test]
fn fires_renal_rule() {
    let mut data = create_young_healthy_assessment();
    data.renal_function.egfr = Some(35.0);
    let (_level, _ten_year, _thirty_year, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PVT-009"), "Should fire PVT-009 (CKD stage 3b-4)");
}

#[test]
fn fires_hypertension_rule() {
    let mut data = create_young_healthy_assessment();
    data.blood_pressure.systolic_bp = Some(155.0);
    let (_level, _ten_year, _thirty_year, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PVT-010"), "Should fire PVT-010 (hypertension)");
}

#[test]
fn returns_higher_30yr_than_10yr_risk() {
    let data = create_moderate_risk_assessment();
    let (_level, ten_year, thirty_year, _fired_rules) = calculate_risk(&data);
    assert!(
        thirty_year > ten_year,
        "30-year risk ({thirty_year}) should be greater than 10-year risk ({ten_year})"
    );
}

#[test]
fn all_rule_ids_are_unique() {
    let rules = all_rules();
    let ids: Vec<&str> = rules.iter().map(|r| r.id).collect();
    let mut unique_ids = ids.clone();
    unique_ids.sort();
    unique_ids.dedup();
    assert_eq!(unique_ids.len(), ids.len(), "All rule IDs should be unique");
}
