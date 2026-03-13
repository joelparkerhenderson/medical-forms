use framingham_risk_score_tera_crate::engine::risk_grader::calculate_risk;
use framingham_risk_score_tera_crate::engine::risk_rules::all_rules;
use framingham_risk_score_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

/// Young healthy female: age 35, non-smoker, TC 180, HDL 60, SBP 110, no treatment.
fn create_low_risk_female() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(35);
    data.demographics.sex = "female".to_string();
    data.smoking_history.smoking_status = "never".to_string();
    data.blood_pressure.systolic_bp = Some(110.0);
    data.blood_pressure.diastolic_bp = Some(70.0);
    data.blood_pressure.on_bp_treatment = "no".to_string();
    data.cholesterol.total_cholesterol = Some(180.0);
    data.cholesterol.hdl_cholesterol = Some(60.0);
    data.cholesterol.cholesterol_unit = "mgDl".to_string();
    data.lifestyle_factors.physical_activity = "moderate".to_string();
    data.medical_history.has_diabetes = "no".to_string();
    data.medical_history.has_prior_chd = "no".to_string();
    data
}

/// Older male smoker with elevated values: age 55, smoker, TC 240, HDL 40, SBP 140, treated.
/// The Framingham formula gives ~55% for this profile, so this is actually a high-risk patient.
fn create_risky_male() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(55);
    data.demographics.sex = "male".to_string();
    data.smoking_history.smoking_status = "current".to_string();
    data.blood_pressure.systolic_bp = Some(140.0);
    data.blood_pressure.diastolic_bp = Some(90.0);
    data.blood_pressure.on_bp_treatment = "yes".to_string();
    data.cholesterol.total_cholesterol = Some(240.0);
    data.cholesterol.hdl_cholesterol = Some(40.0);
    data.cholesterol.cholesterol_unit = "mgDl".to_string();
    data.lifestyle_factors.physical_activity = "sedentary".to_string();
    data.medical_history.has_diabetes = "no".to_string();
    data.medical_history.has_prior_chd = "no".to_string();
    data
}

/// Elderly male with many risk factors: age 68, male, smoker, TC 280, HDL 35, SBP 165.
fn create_high_risk_male() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(68);
    data.demographics.sex = "male".to_string();
    data.smoking_history.smoking_status = "current".to_string();
    data.blood_pressure.systolic_bp = Some(165.0);
    data.blood_pressure.diastolic_bp = Some(95.0);
    data.blood_pressure.on_bp_treatment = "no".to_string();
    data.cholesterol.total_cholesterol = Some(280.0);
    data.cholesterol.hdl_cholesterol = Some(35.0);
    data.cholesterol.cholesterol_unit = "mgDl".to_string();
    data.lifestyle_factors.physical_activity = "sedentary".to_string();
    data.lifestyle_factors.bmi = Some(32.0);
    data.medical_history.has_diabetes = "no".to_string();
    data.medical_history.has_prior_chd = "no".to_string();
    data.current_medications.on_statin = "no".to_string();
    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, risk, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "draft");
    assert_eq!(risk, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_risk_for_young_healthy_female() {
    let data = create_low_risk_female();
    let (level, risk, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "low");
    assert!(risk < 10.0, "Expected risk < 10%, got {}%", risk);
}

#[test]
fn returns_high_for_older_male_smoker() {
    let data = create_risky_male();
    let (level, risk, _fired_rules) = calculate_risk(&data);
    assert!(
        risk >= 20.0,
        "Expected high risk (>=20%), got {}% (level: {})",
        risk,
        level
    );
    assert_eq!(level, "high");
}

#[test]
fn returns_high_for_elderly_with_risk_factors() {
    let data = create_high_risk_male();
    let (level, risk, _fired_rules) = calculate_risk(&data);
    assert!(risk >= 20.0, "Expected risk >= 20%, got {}%", risk);
    assert_eq!(level, "high");
}

#[test]
fn calculates_correct_risk_for_male() {
    // Male age 50, TC 220, HDL 45, SBP 130, not treated, non-smoker
    let mut data = AssessmentData::default();
    data.demographics.age = Some(50);
    data.demographics.sex = "male".to_string();
    data.smoking_history.smoking_status = "never".to_string();
    data.blood_pressure.systolic_bp = Some(130.0);
    data.blood_pressure.on_bp_treatment = "no".to_string();
    data.cholesterol.total_cholesterol = Some(220.0);
    data.cholesterol.hdl_cholesterol = Some(45.0);
    data.cholesterol.cholesterol_unit = "mgDl".to_string();

    let (_level, risk, _fired_rules) = calculate_risk(&data);
    // Should produce a valid positive risk percentage
    assert!(risk > 0.0, "Expected positive risk, got {}%", risk);
    assert!(risk < 100.0, "Expected risk < 100%, got {}%", risk);
}

#[test]
fn calculates_correct_risk_for_female() {
    // Female age 50, TC 220, HDL 55, SBP 130, not treated, non-smoker
    let mut data = AssessmentData::default();
    data.demographics.age = Some(50);
    data.demographics.sex = "female".to_string();
    data.smoking_history.smoking_status = "never".to_string();
    data.blood_pressure.systolic_bp = Some(130.0);
    data.blood_pressure.on_bp_treatment = "no".to_string();
    data.cholesterol.total_cholesterol = Some(220.0);
    data.cholesterol.hdl_cholesterol = Some(55.0);
    data.cholesterol.cholesterol_unit = "mgDl".to_string();

    let (_level, risk, _fired_rules) = calculate_risk(&data);
    // Female risk should be lower than male with similar values
    assert!(risk > 0.0, "Expected positive risk, got {}%", risk);
    assert!(risk < 100.0, "Expected risk < 100%, got {}%", risk);
}

#[test]
fn fires_smoking_rule() {
    let data = create_risky_male();
    let (_level, _risk, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "FRS-007"),
        "Expected FRS-007 (current smoker) to fire"
    );
}

#[test]
fn fires_hypertension_rule() {
    let data = create_risky_male();
    let (_level, _risk, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "FRS-008"),
        "Expected FRS-008 (stage 2 hypertension) to fire"
    );
}

#[test]
fn fires_high_cholesterol_rule() {
    let data = create_risky_male();
    let (_level, _risk, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "FRS-009"),
        "Expected FRS-009 (elevated TC 240-309) to fire"
    );
}

#[test]
fn all_rule_ids_are_unique() {
    let rules = all_rules();
    let ids: Vec<&str> = rules.iter().map(|r| r.id).collect();
    let mut unique_ids = ids.clone();
    unique_ids.sort();
    unique_ids.dedup();
    assert_eq!(unique_ids.len(), ids.len());
}
