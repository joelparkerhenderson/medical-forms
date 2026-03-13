use prevent_cvd_tera_crate::engine::flagged_issues::detect_additional_flags;
use prevent_cvd_tera_crate::engine::types::*;

/// Create a healthy eligible patient (age 45, female, no CVD, normal values)
fn create_healthy_eligible() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(45);
    data.demographics.sex = "female".to_string();
    data.blood_pressure.systolic_bp = Some(118.0);
    data.blood_pressure.diastolic_bp = Some(75.0);
    data.blood_pressure.on_antihypertensive = "no".to_string();
    data.cholesterol_lipids.total_cholesterol = Some(190.0);
    data.cholesterol_lipids.hdl_cholesterol = Some(55.0);
    data.cholesterol_lipids.on_statin = "no".to_string();
    data.metabolic_health.has_diabetes = "no".to_string();
    data.metabolic_health.bmi = Some(23.0);
    data.smoking_history.smoking_status = "never".to_string();
    data.renal_function.egfr = Some(95.0);
    data.medical_history.has_known_cvd = "no".to_string();
    data.current_medications.on_diabetes_medication = "no".to_string();
    data
}

#[test]
fn no_flags_for_eligible_healthy() {
    let data = create_healthy_eligible();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0, "No flags expected for healthy eligible patient, got: {:?}", flags);
}

#[test]
fn flags_known_cvd_exclusion() {
    let mut data = create_healthy_eligible();
    data.medical_history.has_known_cvd = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CVD-001"), "Should flag known CVD");
}

#[test]
fn flags_age_outside_range() {
    let mut data = create_healthy_eligible();
    data.demographics.age = Some(25);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AGE-001"), "Should flag age < 30");

    let mut data2 = create_healthy_eligible();
    data2.demographics.age = Some(85);
    let flags2 = detect_additional_flags(&data2);
    assert!(flags2.iter().any(|f| f.id == "FLAG-AGE-001"), "Should flag age > 79");
}

#[test]
fn flags_severe_hypertension() {
    let mut data = create_healthy_eligible();
    data.blood_pressure.systolic_bp = Some(185.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BP-001"), "Should flag systolic >= 180");

    let mut data2 = create_healthy_eligible();
    data2.blood_pressure.diastolic_bp = Some(125.0);
    let flags2 = detect_additional_flags(&data2);
    assert!(flags2.iter().any(|f| f.id == "FLAG-BP-002"), "Should flag diastolic >= 120");
}

#[test]
fn flags_uncontrolled_diabetes() {
    let mut data = create_healthy_eligible();
    data.metabolic_health.has_diabetes = "yes".to_string();
    data.metabolic_health.hba1c_value = Some(9.5);
    data.metabolic_health.hba1c_unit = "percent".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DM-001"), "Should flag HbA1c >= 9%");
}

#[test]
fn flags_kidney_failure() {
    let mut data = create_healthy_eligible();
    data.renal_function.egfr = Some(12.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RENAL-001"), "Should flag eGFR < 15");
}

#[test]
fn flags_high_risk_no_statin() {
    let mut data = create_healthy_eligible();
    // Make the patient intermediate/high risk by setting high age + risk factors
    data.demographics.age = Some(65);
    data.demographics.sex = "male".to_string();
    data.blood_pressure.systolic_bp = Some(150.0);
    data.cholesterol_lipids.total_cholesterol = Some(250.0);
    data.cholesterol_lipids.hdl_cholesterol = Some(38.0);
    data.metabolic_health.bmi = Some(31.0);
    data.cholesterol_lipids.on_statin = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-MED-001"),
        "Should flag intermediate/high risk without statin"
    );
}

#[test]
fn sorts_flags_by_priority() {
    let mut data = create_healthy_eligible();
    // Create flags of different priorities
    data.medical_history.has_known_cvd = "yes".to_string(); // high
    data.smoking_history.cigarettes_per_day = Some(25); // medium
    data.metabolic_health.bmi = Some(42.0); // medium

    let flags = detect_additional_flags(&data);
    let priorities: Vec<&str> = flags.iter().map(|f| f.priority.as_str()).collect();
    let mut sorted = priorities.clone();
    sorted.sort_by_key(|p| match *p {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });
    assert_eq!(priorities, sorted, "Flags should be sorted by priority (high first)");
}
