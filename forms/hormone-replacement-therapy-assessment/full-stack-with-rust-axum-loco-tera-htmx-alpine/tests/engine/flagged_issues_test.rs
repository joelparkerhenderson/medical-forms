use hrt_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use hrt_assessment_tera_crate::engine::types::*;

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.patient_age = "50to54".to_string();

    data.menopausal_symptoms.hot_flushes_severity = Some(3);
    data.menopausal_symptoms.night_sweats_severity = Some(3);
    data.menopausal_symptoms.sleep_disturbance_severity = Some(2);
    data.menopausal_symptoms.mood_changes_severity = Some(2);
    data.menopausal_symptoms.vaginal_dryness_severity = Some(2);
    data.menopausal_symptoms.urinary_symptoms_severity = Some(1);
    data.menopausal_symptoms.joint_pain_severity = Some(2);
    data.menopausal_symptoms.cognitive_difficulty_severity = Some(2);
    data.menopausal_symptoms.symptom_impact_on_daily_life = Some(3);

    data.menstrual_history.menopausal_status = "postmenopausal".to_string();
    data.menstrual_history.age_at_menopause = "45to55".to_string();
    data.menstrual_history.menopause_type = "natural".to_string();
    data.menstrual_history.previous_hrt_use = "no".to_string();

    data.medical_history.history_of_vte = "no".to_string();
    data.medical_history.history_of_stroke = "no".to_string();
    data.medical_history.history_of_mi = "no".to_string();
    data.medical_history.liver_disease = "no".to_string();
    data.medical_history.undiagnosed_vaginal_bleeding = "no".to_string();

    data.cardiovascular_risk.smoking_status = "never".to_string();
    data.cardiovascular_risk.bmi_category = "normal".to_string();
    data.cardiovascular_risk.blood_pressure_status = "normal".to_string();
    data.cardiovascular_risk.cholesterol_status = "normal".to_string();
    data.cardiovascular_risk.family_history_cvd = "no".to_string();

    data.breast_health.personal_breast_cancer_history = "no".to_string();
    data.breast_health.family_breast_cancer_history = "none".to_string();
    data.breast_health.brca_gene_status = "notTested".to_string();
    data.breast_health.last_mammogram_date = "within1Year".to_string();

    data.bone_health.dexa_scan_result = "normal".to_string();
    data.bone_health.vitamin_d_status = "sufficient".to_string();
    data.bone_health.fall_risk_assessment = Some(1);

    data.current_medications.drug_allergies = "None".to_string();

    data.hrt_options_counselling.preferred_hrt_route = "transdermal".to_string();
    data.hrt_options_counselling.informed_consent_obtained = "yes".to_string();

    data
}

#[test]
fn no_flags_for_low_risk_patient() {
    let data = create_low_risk_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_vte_with_oral_preference() {
    let mut data = create_low_risk_assessment();
    data.medical_history.history_of_vte = "yes".to_string();
    data.hrt_options_counselling.preferred_hrt_route = "oral".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VTE-001"));
}

#[test]
fn flags_brca_positive() {
    let mut data = create_low_risk_assessment();
    data.breast_health.brca_gene_status = "positive".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BREAST-001"));
}

#[test]
fn flags_overdue_mammogram() {
    let mut data = create_low_risk_assessment();
    data.breast_health.last_mammogram_date = "moreThan2Years".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BREAST-002"));
}

#[test]
fn flags_undiagnosed_bleeding() {
    let mut data = create_low_risk_assessment();
    data.medical_history.undiagnosed_vaginal_bleeding = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BLEED-001"));
}

#[test]
fn flags_multiple_cv_risk_factors() {
    let mut data = create_low_risk_assessment();
    data.cardiovascular_risk.smoking_status = "current".to_string();
    data.cardiovascular_risk.bmi_category = "obese".to_string();
    data.cardiovascular_risk.blood_pressure_status = "uncontrolledHigh".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CV-001"));
}

#[test]
fn flags_vitamin_d_deficiency() {
    let mut data = create_low_risk_assessment();
    data.bone_health.vitamin_d_status = "deficient".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BONE-002"));
}

#[test]
fn flags_premature_menopause_without_hrt() {
    let mut data = create_low_risk_assessment();
    data.menstrual_history.age_at_menopause = "under40".to_string();
    data.menstrual_history.previous_hrt_use = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MENO-001"));
}

#[test]
fn flags_consent_not_obtained() {
    let mut data = create_low_risk_assessment();
    data.hrt_options_counselling.informed_consent_obtained = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CONSENT-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_low_risk_assessment();
    // Create flags of different priorities
    data.medical_history.undiagnosed_vaginal_bleeding = "yes".to_string(); // high
    data.bone_health.vitamin_d_status = "deficient".to_string(); // medium
    data.hrt_options_counselling.informed_consent_obtained = "no".to_string(); // medium
    data.current_medications.drug_allergies = "Penicillin".to_string(); // low

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
