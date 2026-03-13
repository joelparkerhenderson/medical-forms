use heart_health_check_tera_crate::engine::risk_grader::calculate_risk;
use heart_health_check_tera_crate::engine::risk_rules::all_rules;
use heart_health_check_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_young_healthy_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();
    data.demographics_ethnicity.age = Some(35);
    data.demographics_ethnicity.sex = "female".to_string();
    data.demographics_ethnicity.ethnicity = "white".to_string();

    data.blood_pressure.systolic_bp = Some(115.0);
    data.blood_pressure.diastolic_bp = Some(75.0);
    data.blood_pressure.on_bp_treatment = "no".to_string();

    data.cholesterol.total_cholesterol = Some(4.5);
    data.cholesterol.hdl_cholesterol = Some(1.5);
    data.cholesterol.total_hdl_ratio = Some(3.0);
    data.cholesterol.on_statin = "no".to_string();

    data.medical_conditions.has_diabetes = "no".to_string();
    data.medical_conditions.has_atrial_fibrillation = "no".to_string();
    data.medical_conditions.has_rheumatoid_arthritis = "no".to_string();
    data.medical_conditions.has_chronic_kidney_disease = "no".to_string();
    data.medical_conditions.has_migraine = "no".to_string();
    data.medical_conditions.has_severe_mental_illness = "no".to_string();
    data.medical_conditions.on_atypical_antipsychotic = "no".to_string();
    data.medical_conditions.on_corticosteroids = "no".to_string();

    data.family_history.family_cvd_under_60 = "no".to_string();

    data.smoking_alcohol.smoking_status = "nonSmoker".to_string();

    data.physical_activity_diet.physical_activity_minutes_per_week = Some(200);
    data.physical_activity_diet.activity_intensity = "moderate".to_string();
    data.physical_activity_diet.fruit_veg_portions_per_day = Some(5);

    data.body_measurements.height_cm = Some(165.0);
    data.body_measurements.weight_kg = Some(60.0);
    data.body_measurements.bmi = Some(22.0);

    data
}

fn create_moderate_risk_assessment() -> AssessmentData {
    let mut data = create_young_healthy_assessment();

    data.demographics_ethnicity.age = Some(60);
    data.demographics_ethnicity.sex = "male".to_string();
    data.patient_information.full_name = "Robert Jones".to_string();

    data.blood_pressure.systolic_bp = Some(145.0);
    data.blood_pressure.diastolic_bp = Some(90.0);

    data.cholesterol.total_hdl_ratio = Some(5.0);

    data.smoking_alcohol.smoking_status = "exSmoker".to_string();
    data.smoking_alcohol.years_since_quit = Some(5);

    data.body_measurements.bmi = Some(28.0);

    data
}

fn create_high_risk_assessment() -> AssessmentData {
    let mut data = create_young_healthy_assessment();

    data.demographics_ethnicity.age = Some(65);
    data.demographics_ethnicity.sex = "male".to_string();
    data.patient_information.full_name = "Tom Brown".to_string();

    data.blood_pressure.systolic_bp = Some(165.0);
    data.blood_pressure.diastolic_bp = Some(95.0);
    data.blood_pressure.on_bp_treatment = "yes".to_string();

    data.cholesterol.total_hdl_ratio = Some(6.5);
    data.cholesterol.on_statin = "no".to_string();

    data.medical_conditions.has_diabetes = "type2".to_string();
    data.medical_conditions.has_atrial_fibrillation = "yes".to_string();

    data.smoking_alcohol.smoking_status = "moderateSmoker".to_string();
    data.smoking_alcohol.cigarettes_per_day = Some(15);

    data.family_history.family_cvd_under_60 = "yes".to_string();

    data.body_measurements.bmi = Some(32.0);

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (category, risk, heart_age, fired_rules) = calculate_risk(&data);
    assert_eq!(category, "draft");
    assert_eq!(risk, 0.0);
    assert!(heart_age.is_none());
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_risk_for_young_healthy() {
    let data = create_young_healthy_assessment();
    let (category, risk, _heart_age, _fired_rules) = calculate_risk(&data);
    assert_eq!(category, "low");
    assert!(risk < 10.0, "Expected risk < 10%, got {risk}%");
}

#[test]
fn returns_moderate_for_older_with_risk_factors() {
    let data = create_moderate_risk_assessment();
    let (category, risk, _heart_age, _fired_rules) = calculate_risk(&data);
    assert!(
        category == "moderate" || category == "high",
        "Expected moderate or high, got {category} with risk {risk}%"
    );
    assert!(risk >= 10.0, "Expected risk >= 10%, got {risk}%");
}

#[test]
fn returns_high_for_multiple_major_factors() {
    let data = create_high_risk_assessment();
    let (category, risk, _heart_age, _fired_rules) = calculate_risk(&data);
    assert_eq!(category, "high", "Expected high risk, got {category} with risk {risk}%");
    assert!(risk >= 20.0, "Expected risk >= 20%, got {risk}%");
}

#[test]
fn calculates_heart_age_older_than_chronological() {
    let data = create_high_risk_assessment();
    let (_category, _risk, heart_age, _fired_rules) = calculate_risk(&data);
    assert!(heart_age.is_some(), "Heart age should be calculated");
    let ha = heart_age.unwrap();
    let actual_age = data.demographics_ethnicity.age.unwrap();
    assert!(
        ha > actual_age,
        "Heart age ({ha}) should be older than chronological age ({actual_age})"
    );
}

#[test]
fn calculates_heart_age_younger_for_healthy() {
    let data = create_young_healthy_assessment();
    let (_category, _risk, heart_age, _fired_rules) = calculate_risk(&data);
    assert!(heart_age.is_some(), "Heart age should be calculated");
    let ha = heart_age.unwrap();
    let actual_age = data.demographics_ethnicity.age.unwrap();
    assert!(
        ha <= actual_age,
        "Heart age ({ha}) should be <= chronological age ({actual_age}) for healthy person"
    );
}

#[test]
fn fires_smoking_rule() {
    let mut data = create_young_healthy_assessment();
    data.smoking_alcohol.smoking_status = "moderateSmoker".to_string();

    let (_category, _risk, _heart_age, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "HHC-007"),
        "Should fire HHC-007 (current smoker). Fired: {:?}",
        fired_rules.iter().map(|r| &r.id).collect::<Vec<_>>()
    );
}

#[test]
fn fires_diabetes_rule() {
    let mut data = create_young_healthy_assessment();
    data.medical_conditions.has_diabetes = "type2".to_string();

    let (_category, _risk, _heart_age, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "HHC-008"),
        "Should fire HHC-008 (type 2 diabetes). Fired: {:?}",
        fired_rules.iter().map(|r| &r.id).collect::<Vec<_>>()
    );
}

#[test]
fn fires_af_rule() {
    let mut data = create_young_healthy_assessment();
    data.medical_conditions.has_atrial_fibrillation = "yes".to_string();

    let (_category, _risk, _heart_age, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "HHC-009"),
        "Should fire HHC-009 (atrial fibrillation). Fired: {:?}",
        fired_rules.iter().map(|r| &r.id).collect::<Vec<_>>()
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
