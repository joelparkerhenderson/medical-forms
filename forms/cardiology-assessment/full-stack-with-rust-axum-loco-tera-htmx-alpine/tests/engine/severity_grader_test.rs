use cardiology_assessment_tera_crate::engine::severity_grader::calculate_severity;
use cardiology_assessment_tera_crate::engine::severity_rules::all_rules;
use cardiology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1960-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Jones".to_string();
    data.patient_information.gp_practice = "City Health Centre".to_string();

    // Cardiac History
    data.cardiac_history.previous_mi = "no".to_string();
    data.cardiac_history.previous_cabg = "no".to_string();
    data.cardiac_history.previous_pci = "no".to_string();
    data.cardiac_history.heart_failure = "no".to_string();
    data.cardiac_history.atrial_fibrillation = "no".to_string();
    data.cardiac_history.valvular_disease = "none".to_string();
    data.cardiac_history.pacemaker = "no".to_string();
    data.cardiac_history.sudden_cardiac_death = "no".to_string();

    // Symptoms - NYHA II, moderate symptoms
    data.symptoms_assessment.chest_pain = "no".to_string();
    data.symptoms_assessment.dyspnoea = Some(2);
    data.symptoms_assessment.orthopnoea = "no".to_string();
    data.symptoms_assessment.pnd = "no".to_string();
    data.symptoms_assessment.palpitations = "no".to_string();
    data.symptoms_assessment.syncope = "no".to_string();
    data.symptoms_assessment.peripheral_oedema = "no".to_string();
    data.symptoms_assessment.nyha_class = "II".to_string();

    // Risk Factors - 2 present
    data.risk_factors.hypertension = "yes".to_string();
    data.risk_factors.diabetes = "no".to_string();
    data.risk_factors.dyslipidaemia = "yes".to_string();
    data.risk_factors.smoking_status = "former".to_string();
    data.risk_factors.family_cad_history = "no".to_string();
    data.risk_factors.chronic_kidney_disease = "none".to_string();
    data.risk_factors.obstructive_sleep_apnoea = "no".to_string();

    // Physical Examination
    data.physical_examination.heart_rate = Some(72);
    data.physical_examination.blood_pressure_systolic = Some(135.0);
    data.physical_examination.blood_pressure_diastolic = Some(82.0);
    data.physical_examination.heart_rhythm = "regular".to_string();
    data.physical_examination.heart_sounds = "normal".to_string();
    data.physical_examination.murmur = "no".to_string();
    data.physical_examination.jvp_elevated = "no".to_string();
    data.physical_examination.lung_creps = "no".to_string();

    // ECG
    data.ecg_findings.ecg_rhythm = "sinusRhythm".to_string();
    data.ecg_findings.heart_rate_ecg = Some(72);
    data.ecg_findings.st_changes = "no".to_string();
    data.ecg_findings.lvh = "no".to_string();
    data.ecg_findings.bundle_branch_block = "none".to_string();

    // Echo - preserved LVEF
    data.echocardiography.lvef = Some(55);
    data.echocardiography.lvef_category = "normal".to_string();
    data.echocardiography.valvular_abnormality = "no".to_string();

    // Investigations
    data.investigations.troponin = Some(3.0);
    data.investigations.bnp = Some(50.0);

    // Treatment
    data.current_treatment.beta_blocker = "no".to_string();
    data.current_treatment.ace_inhibitor = "yes".to_string();
    data.current_treatment.statin = "yes".to_string();
    data.current_treatment.diuretic = "no".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr Patel".to_string();
    data.clinical_review.primary_diagnosis = "hypertensiveHeartDisease".to_string();
    data.clinical_review.urgency = "routine".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_for_preserved_ef_and_nyha_i() {
    let mut data = create_moderate_assessment();
    data.symptoms_assessment.nyha_class = "I".to_string();
    data.echocardiography.lvef = Some(60);
    data.risk_factors.hypertension = "no".to_string();
    data.risk_factors.dyslipidaemia = "no".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "low");
    // Should fire CARD-016 (LVEF >= 50%) and CARD-017 (NYHA I)
    assert!(fired_rules.iter().any(|r| r.id == "CARD-016"));
    assert!(fired_rules.iter().any(|r| r.id == "CARD-017"));
}

#[test]
fn returns_high_for_severe_hf() {
    let mut data = create_moderate_assessment();
    data.symptoms_assessment.nyha_class = "IV".to_string();
    data.echocardiography.lvef = Some(25);
    data.cardiac_history.heart_failure = "yes".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert!(level == "high" || level == "critical");
    // Should fire CARD-001 (LVEF <35%) and CARD-002 (NYHA IV)
    assert!(fired_rules.iter().any(|r| r.id == "CARD-001"));
    assert!(fired_rules.iter().any(|r| r.id == "CARD-002"));
}

#[test]
fn fires_acs_rule_for_typical_chest_pain() {
    let mut data = create_moderate_assessment();
    data.symptoms_assessment.chest_pain = "yes".to_string();
    data.symptoms_assessment.chest_pain_type = "typical".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CARD-003"));
}

#[test]
fn fires_ecg_st_changes_rule() {
    let mut data = create_moderate_assessment();
    data.ecg_findings.st_changes = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CARD-008"));
}

#[test]
fn fires_uncontrolled_hypertension_rule() {
    let mut data = create_moderate_assessment();
    data.physical_examination.blood_pressure_systolic = Some(165.0);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CARD-010"));
}

#[test]
fn fires_elevated_troponin_rule() {
    let mut data = create_moderate_assessment();
    data.investigations.troponin = Some(25.0);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CARD-011"));
}

#[test]
fn fires_normal_ecg_rule() {
    let data = create_moderate_assessment();
    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CARD-018"));
}

#[test]
fn fires_multiple_risk_factors_rule() {
    let mut data = create_moderate_assessment();
    data.risk_factors.hypertension = "yes".to_string();
    data.risk_factors.diabetes = "yes".to_string();
    data.risk_factors.dyslipidaemia = "yes".to_string();
    data.risk_factors.smoking_status = "current".to_string();
    data.risk_factors.family_cad_history = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CARD-014"));
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
