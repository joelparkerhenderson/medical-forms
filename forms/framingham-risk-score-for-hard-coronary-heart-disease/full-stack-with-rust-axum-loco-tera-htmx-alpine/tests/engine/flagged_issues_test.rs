use framingham_risk_score_tera_crate::engine::flagged_issues::detect_additional_flags;
use framingham_risk_score_tera_crate::engine::types::*;

/// Create a healthy eligible patient (age 45, female, no issues).
fn create_healthy_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();
    data.demographics.age = Some(45);
    data.demographics.sex = "female".to_string();
    data.smoking_history.smoking_status = "never".to_string();
    data.blood_pressure.systolic_bp = Some(115.0);
    data.blood_pressure.diastolic_bp = Some(75.0);
    data.blood_pressure.on_bp_treatment = "no".to_string();
    data.cholesterol.total_cholesterol = Some(190.0);
    data.cholesterol.hdl_cholesterol = Some(55.0);
    data.cholesterol.cholesterol_unit = "mgDl".to_string();
    data.medical_history.has_diabetes = "no".to_string();
    data.medical_history.has_prior_chd = "no".to_string();
    data.lifestyle_factors.physical_activity = "moderate".to_string();
    data.lifestyle_factors.bmi = Some(24.0);
    data.current_medications.on_statin = "no".to_string();
    data
}

#[test]
fn no_flags_for_eligible_healthy_patient() {
    let data = create_healthy_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0, "Expected no flags, got: {:?}", flags);
}

#[test]
fn flags_age_outside_range() {
    let mut data = create_healthy_assessment();
    data.demographics.age = Some(25); // Below 30
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ELIG-001"));
}

#[test]
fn flags_prior_chd() {
    let mut data = create_healthy_assessment();
    data.medical_history.has_prior_chd = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ELIG-002"));
}

#[test]
fn flags_diabetes_exclusion() {
    let mut data = create_healthy_assessment();
    data.medical_history.has_diabetes = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ELIG-003"));
}

#[test]
fn flags_severe_hypertension() {
    let mut data = create_healthy_assessment();
    data.blood_pressure.systolic_bp = Some(185.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BP-001"));
}

#[test]
fn flags_critically_low_hdl() {
    let mut data = create_healthy_assessment();
    data.cholesterol.hdl_cholesterol = Some(25.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CHOL-002"));
}

#[test]
fn flags_high_risk_not_on_statin() {
    // Create a high-risk patient not on statin
    let mut data = create_healthy_assessment();
    data.demographics.age = Some(68);
    data.demographics.sex = "male".to_string();
    data.smoking_history.smoking_status = "current".to_string();
    data.blood_pressure.systolic_bp = Some(165.0);
    data.blood_pressure.diastolic_bp = Some(95.0);
    data.cholesterol.total_cholesterol = Some(280.0);
    data.cholesterol.hdl_cholesterol = Some(35.0);
    data.current_medications.on_statin = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-MED-001"),
        "Expected FLAG-MED-001 (high risk not on statin), got: {:?}",
        flags.iter().map(|f| &f.id).collect::<Vec<_>>()
    );
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_healthy_assessment();
    // Create flags of different priorities
    data.blood_pressure.systolic_bp = Some(185.0); // high: FLAG-BP-001
    data.smoking_history.smoking_status = "current".to_string(); // medium: FLAG-SMOKE-001
    data.demographics.age = Some(25); // high: FLAG-ELIG-001

    let flags = detect_additional_flags(&data);
    let priorities: Vec<&str> = flags.iter().map(|f| f.priority.as_str()).collect();
    let mut sorted = priorities.clone();
    sorted.sort_by_key(|p| match *p {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });
    assert_eq!(priorities, sorted);
}
