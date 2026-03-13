use hrt_assessment_tera_crate::engine::risk_grader::calculate_risk;
use hrt_assessment_tera_crate::engine::risk_rules::all_rules;
use hrt_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1975-06-15".to_string();
    data.patient_information.patient_age = "50to54".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.ethnicity = "white".to_string();
    data.patient_information.referral_date = "2026-03-01".to_string();
    data.patient_information.referring_clinician = "Dr Brown".to_string();
    data.patient_information.reason_for_referral = "menopausalSymptoms".to_string();

    // Menopausal Symptoms — moderate severity
    data.menopausal_symptoms.hot_flushes_severity = Some(3);
    data.menopausal_symptoms.night_sweats_severity = Some(3);
    data.menopausal_symptoms.sleep_disturbance_severity = Some(2);
    data.menopausal_symptoms.mood_changes_severity = Some(2);
    data.menopausal_symptoms.vaginal_dryness_severity = Some(2);
    data.menopausal_symptoms.urinary_symptoms_severity = Some(1);
    data.menopausal_symptoms.joint_pain_severity = Some(2);
    data.menopausal_symptoms.cognitive_difficulty_severity = Some(2);
    data.menopausal_symptoms.symptom_duration_months = "6to12".to_string();
    data.menopausal_symptoms.symptom_impact_on_daily_life = Some(3);

    // Menstrual History
    data.menstrual_history.menopausal_status = "postmenopausal".to_string();
    data.menstrual_history.last_menstrual_period = "2025-01-15".to_string();
    data.menstrual_history.age_at_menopause = "45to55".to_string();
    data.menstrual_history.menopause_type = "natural".to_string();
    data.menstrual_history.previous_hrt_use = "no".to_string();
    data.menstrual_history.contraception_status = "notRequired".to_string();

    // Medical History — all clear
    data.medical_history.history_of_vte = "no".to_string();
    data.medical_history.history_of_stroke = "no".to_string();
    data.medical_history.history_of_mi = "no".to_string();
    data.medical_history.liver_disease = "no".to_string();
    data.medical_history.undiagnosed_vaginal_bleeding = "no".to_string();
    data.medical_history.endometriosis = "no".to_string();
    data.medical_history.fibroids = "no".to_string();
    data.medical_history.migraine_with_aura = "no".to_string();
    data.medical_history.diabetes = "no".to_string();
    data.medical_history.hypertension = "no".to_string();

    // Cardiovascular Risk — all low
    data.cardiovascular_risk.smoking_status = "never".to_string();
    data.cardiovascular_risk.bmi_category = "normal".to_string();
    data.cardiovascular_risk.blood_pressure_status = "normal".to_string();
    data.cardiovascular_risk.cholesterol_status = "normal".to_string();
    data.cardiovascular_risk.family_history_cvd = "no".to_string();
    data.cardiovascular_risk.physical_activity_level = "moderatelyActive".to_string();
    data.cardiovascular_risk.alcohol_consumption = "withinLimits".to_string();

    // Breast Health — all clear
    data.breast_health.personal_breast_cancer_history = "no".to_string();
    data.breast_health.family_breast_cancer_history = "none".to_string();
    data.breast_health.brca_gene_status = "notTested".to_string();
    data.breast_health.last_mammogram_date = "within1Year".to_string();
    data.breast_health.mammogram_result = "normal".to_string();
    data.breast_health.breast_density = "scattered".to_string();

    // Bone Health
    data.bone_health.dexa_scan_result = "normal".to_string();
    data.bone_health.previous_fractures = "no".to_string();
    data.bone_health.family_history_osteoporosis = "no".to_string();
    data.bone_health.calcium_intake = "adequate".to_string();
    data.bone_health.vitamin_d_status = "sufficient".to_string();
    data.bone_health.fall_risk_assessment = Some(1);

    // Current Medications
    data.current_medications.current_medications_list = "None".to_string();
    data.current_medications.drug_allergies = "None".to_string();

    // HRT Options & Counselling
    data.hrt_options_counselling.preferred_hrt_route = "transdermal".to_string();
    data.hrt_options_counselling.combined_vs_estrogen_only = "combined".to_string();
    data.hrt_options_counselling.risks_discussed = "yes".to_string();
    data.hrt_options_counselling.benefits_discussed = "yes".to_string();
    data.hrt_options_counselling.alternatives_discussed = "yes".to_string();
    data.hrt_options_counselling.informed_consent_obtained = "yes".to_string();
    data.hrt_options_counselling.patient_preference_noted = "yes".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr Jones".to_string();
    data.clinical_review.review_date = "2026-03-01".to_string();
    data.clinical_review.overall_risk_assessment = Some(1);
    data.clinical_review.recommended_action = "initiateHrt".to_string();
    data.clinical_review.follow_up_interval = "3months".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_risk_for_healthy_patient() {
    let data = create_low_risk_assessment();
    let (level, _score, _fired_rules) = calculate_risk(&data);
    assert_eq!(level, "lowRisk");
}

#[test]
fn returns_contraindicated_for_breast_cancer() {
    let mut data = create_low_risk_assessment();
    data.breast_health.personal_breast_cancer_history = "yes".to_string();

    let (level, _score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "contraindicated");
    assert!(fired_rules.iter().any(|r| r.id == "HRT-001"));
}

#[test]
fn returns_contraindicated_for_undiagnosed_bleeding() {
    let mut data = create_low_risk_assessment();
    data.medical_history.undiagnosed_vaginal_bleeding = "yes".to_string();

    let (level, _score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "contraindicated");
    assert!(fired_rules.iter().any(|r| r.id == "HRT-004"));
}

#[test]
fn returns_contraindicated_for_liver_disease() {
    let mut data = create_low_risk_assessment();
    data.medical_history.liver_disease = "yes".to_string();

    let (level, _score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "contraindicated");
    assert!(fired_rules.iter().any(|r| r.id == "HRT-005"));
}

#[test]
fn returns_high_risk_for_vte_history() {
    let mut data = create_low_risk_assessment();
    data.medical_history.history_of_vte = "yes".to_string();

    let (level, _score, fired_rules) = calculate_risk(&data);
    assert_eq!(level, "highRisk");
    assert!(fired_rules.iter().any(|r| r.id == "HRT-002"));
}

#[test]
fn fires_smoking_rule_for_current_smoker() {
    let mut data = create_low_risk_assessment();
    data.cardiovascular_risk.smoking_status = "current".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HRT-006"));
}

#[test]
fn fires_premature_menopause_rule() {
    let mut data = create_low_risk_assessment();
    data.menstrual_history.age_at_menopause = "under40".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HRT-018"));
}

#[test]
fn fires_consent_rule_when_obtained() {
    let data = create_low_risk_assessment();
    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HRT-020"));
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

#[test]
fn fires_severe_symptom_rule() {
    let mut data = create_low_risk_assessment();
    // Set all symptoms to 5 (very severe)
    data.menopausal_symptoms.hot_flushes_severity = Some(5);
    data.menopausal_symptoms.night_sweats_severity = Some(5);
    data.menopausal_symptoms.sleep_disturbance_severity = Some(5);
    data.menopausal_symptoms.mood_changes_severity = Some(5);
    data.menopausal_symptoms.vaginal_dryness_severity = Some(5);
    data.menopausal_symptoms.urinary_symptoms_severity = Some(5);
    data.menopausal_symptoms.joint_pain_severity = Some(5);
    data.menopausal_symptoms.cognitive_difficulty_severity = Some(5);
    data.menopausal_symptoms.symptom_impact_on_daily_life = Some(5);

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HRT-016")); // Severe symptom burden
}

#[test]
fn fires_osteoporosis_rule() {
    let mut data = create_low_risk_assessment();
    data.bone_health.dexa_scan_result = "osteoporosis".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HRT-017"));
}

#[test]
fn fires_brca_positive_rule() {
    let mut data = create_low_risk_assessment();
    data.breast_health.brca_gene_status = "positive".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HRT-010"));
}

#[test]
fn fires_migraine_with_aura_rule() {
    let mut data = create_low_risk_assessment();
    data.medical_history.migraine_with_aura = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_risk(&data);
    assert!(fired_rules.iter().any(|r| r.id == "HRT-012"));
}
