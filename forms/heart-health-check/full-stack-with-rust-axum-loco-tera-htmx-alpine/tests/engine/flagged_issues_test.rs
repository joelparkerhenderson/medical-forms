use heart_health_check_tera_crate::engine::flagged_issues::detect_additional_flags;
use heart_health_check_tera_crate::engine::types::*;

fn create_eligible_healthy_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.demographics_ethnicity.age = Some(50);
    data.demographics_ethnicity.sex = "male".to_string();

    data.blood_pressure.systolic_bp = Some(120.0);
    data.blood_pressure.diastolic_bp = Some(78.0);
    data.blood_pressure.on_bp_treatment = "no".to_string();

    data.cholesterol.total_cholesterol = Some(4.5);
    data.cholesterol.hdl_cholesterol = Some(1.4);
    data.cholesterol.total_hdl_ratio = Some(3.2);
    data.cholesterol.on_statin = "no".to_string();

    data.medical_conditions.has_diabetes = "no".to_string();
    data.medical_conditions.has_atrial_fibrillation = "no".to_string();
    data.medical_conditions.has_chronic_kidney_disease = "no".to_string();

    data.smoking_alcohol.smoking_status = "nonSmoker".to_string();

    data.body_measurements.bmi = Some(24.0);
    data.body_measurements.height_cm = Some(175.0);
    data.body_measurements.weight_kg = Some(73.5);

    data.physical_activity_diet.physical_activity_minutes_per_week = Some(180);

    data
}

#[test]
fn no_flags_for_eligible_healthy() {
    let data = create_eligible_healthy_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0, "Healthy eligible person should have no flags. Got: {:?}",
        flags.iter().map(|f| &f.id).collect::<Vec<_>>());
}

#[test]
fn flags_age_outside_range() {
    let mut data = create_eligible_healthy_assessment();
    data.demographics_ethnicity.age = Some(90);
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-AGE-001"),
        "Should flag age outside 25-84 range"
    );
}

#[test]
fn flags_severe_hypertension() {
    let mut data = create_eligible_healthy_assessment();
    data.blood_pressure.systolic_bp = Some(190.0);
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-BP-001"),
        "Should flag systolic BP >= 180"
    );
}

#[test]
fn flags_morbid_obesity() {
    let mut data = create_eligible_healthy_assessment();
    data.body_measurements.bmi = Some(42.0);
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-BMI-001"),
        "Should flag BMI >= 40 (morbid obesity)"
    );
}

#[test]
fn flags_heavy_smoker() {
    let mut data = create_eligible_healthy_assessment();
    data.smoking_alcohol.smoking_status = "heavySmoker".to_string();
    data.smoking_alcohol.cigarettes_per_day = Some(25);
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-SMOKE-001"),
        "Should flag heavy smoker (20+ cigarettes/day)"
    );
}

#[test]
fn flags_af_without_anticoagulant() {
    let mut data = create_eligible_healthy_assessment();
    data.medical_conditions.has_atrial_fibrillation = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-AF-001"),
        "Should flag AF for anticoagulation review"
    );
}

#[test]
fn flags_high_audit_score() {
    let mut data = create_eligible_healthy_assessment();
    data.review_calculate.audit_score = Some(18);
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-AUDIT-001"),
        "Should flag AUDIT score >= 16"
    );
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_eligible_healthy_assessment();
    // Create flags of different priorities
    data.blood_pressure.systolic_bp = Some(185.0); // high - FLAG-BP-001
    data.medical_conditions.has_atrial_fibrillation = "yes".to_string(); // medium - FLAG-AF-001
    data.physical_activity_diet.physical_activity_minutes_per_week = Some(20); // medium - FLAG-INACT-001

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
