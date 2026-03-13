use diabetes_assessment_tera_crate::engine::diabetes_grader::calculate_control;
use diabetes_assessment_tera_crate::engine::diabetes_rules::all_rules;
use diabetes_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_well_controlled_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1980-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Jones".to_string();
    data.patient_information.gp_practice = "Riverside Surgery".to_string();

    // Diabetes History
    data.diabetes_history.diabetes_type = "type2".to_string();
    data.diabetes_history.age_at_diagnosis = Some(45);
    data.diabetes_history.years_duration = Some(5);
    data.diabetes_history.family_history = "yes".to_string();

    // Glycaemic Control - well controlled
    data.glycaemic_control.hba1c_value = Some(48.0);
    data.glycaemic_control.hba1c_unit = "mmolMol".to_string();
    data.glycaemic_control.hba1c_target = Some(53.0);
    data.glycaemic_control.fasting_glucose = Some(5.5);
    data.glycaemic_control.glucose_monitoring_type = "smbg".to_string();
    data.glycaemic_control.hypoglycaemia_frequency = "never".to_string();
    data.glycaemic_control.severe_hypoglycaemia = "no".to_string();
    data.glycaemic_control.time_in_range = Some(75);

    // Medications
    data.medications.metformin = "yes".to_string();
    data.medications.insulin = "no".to_string();
    data.medications.medication_adherence = Some(4);

    // Complications - none
    data.complications_screening.retinopathy_status = "none".to_string();
    data.complications_screening.nephropathy_status = "normal".to_string();
    data.complications_screening.egfr = Some(90.0);
    data.complications_screening.urine_acr = Some(1.5);
    data.complications_screening.neuropathy_symptoms = "no".to_string();
    data.complications_screening.last_eye_screening = "2026-01-15".to_string();

    // Cardiovascular
    data.cardiovascular_risk.systolic_bp = Some(125.0);
    data.cardiovascular_risk.diastolic_bp = Some(78.0);
    data.cardiovascular_risk.on_statin = "yes".to_string();
    data.cardiovascular_risk.on_antihypertensive = "no".to_string();
    data.cardiovascular_risk.smoking_status = "never".to_string();
    data.cardiovascular_risk.previous_cvd_event = "no".to_string();

    // Self-Care - good
    data.self_care_lifestyle.diet_adherence = Some(4);
    data.self_care_lifestyle.physical_activity = "regular".to_string();
    data.self_care_lifestyle.bmi = Some(26.5);

    // Psychological - good
    data.psychological_wellbeing.diabetes_distress = Some(2);
    data.psychological_wellbeing.depression_screening = Some(1);
    data.psychological_wellbeing.anxiety_screening = Some(0);
    data.psychological_wellbeing.coping_ability = Some(4);
    data.psychological_wellbeing.fear_of_hypoglycaemia = Some(1);
    data.psychological_wellbeing.eating_disorder = "no".to_string();
    data.psychological_wellbeing.needs_support = "no".to_string();

    // Foot - low risk
    data.foot_assessment.foot_pulses = "present".to_string();
    data.foot_assessment.monofilament_test = "normal".to_string();
    data.foot_assessment.vibration_sense = "normal".to_string();
    data.foot_assessment.foot_deformity = "no".to_string();
    data.foot_assessment.callus_present = "no".to_string();
    data.foot_assessment.ulcer_present = "no".to_string();
    data.foot_assessment.previous_amputation = "no".to_string();
    data.foot_assessment.foot_risk_category = "low".to_string();

    // Review
    data.review_care_plan.clinician_name = "Dr Johnson".to_string();
    data.review_care_plan.review_date = "2026-03-01".to_string();
    data.review_care_plan.care_plan_updated = "yes".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_control(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_well_controlled_for_good_hba1c() {
    let data = create_well_controlled_assessment();
    let (level, _score, _fired_rules) = calculate_control(&data);
    assert_eq!(level, "wellControlled");
}

#[test]
fn returns_very_poor_for_critically_high_hba1c() {
    let mut data = create_well_controlled_assessment();
    data.glycaemic_control.hba1c_value = Some(97.0);
    data.glycaemic_control.hba1c_unit = "mmolMol".to_string();
    // Add complications to push score down
    data.complications_screening.retinopathy_status = "proliferative".to_string();
    data.complications_screening.egfr = Some(25.0);
    data.foot_assessment.ulcer_present = "yes".to_string();
    data.medications.medication_adherence = Some(1);
    data.self_care_lifestyle.diet_adherence = Some(1);

    let (level, _score, fired_rules) = calculate_control(&data);
    assert_eq!(level, "veryPoor");
    assert!(fired_rules.iter().any(|r| r.id == "DM-001")); // HbA1c >= 86
}

#[test]
fn fires_severe_hypoglycaemia_rule() {
    let mut data = create_well_controlled_assessment();
    data.glycaemic_control.severe_hypoglycaemia = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-002"));
}

#[test]
fn fires_active_foot_ulcer_rule() {
    let mut data = create_well_controlled_assessment();
    data.foot_assessment.ulcer_present = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-003"));
}

#[test]
fn fires_proliferative_retinopathy_rule() {
    let mut data = create_well_controlled_assessment();
    data.complications_screening.retinopathy_status = "proliferative".to_string();

    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-004"));
}

#[test]
fn fires_severe_renal_impairment_rule() {
    let mut data = create_well_controlled_assessment();
    data.complications_screening.egfr = Some(25.0);

    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-005"));
}

#[test]
fn fires_hba1c_at_target_positive_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-016"));
}

#[test]
fn fires_no_complications_positive_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-017"));
}

#[test]
fn fires_good_self_care_positive_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-018"));
}

#[test]
fn fires_physically_active_positive_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-019"));
}

#[test]
fn fires_good_psychological_wellbeing_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-020"));
}

#[test]
fn fires_poor_medication_adherence_rule() {
    let mut data = create_well_controlled_assessment();
    data.medications.medication_adherence = Some(1);

    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-012"));
}

#[test]
fn fires_high_bmi_rule() {
    let mut data = create_well_controlled_assessment();
    data.self_care_lifestyle.bmi = Some(38.0);

    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-013"));
}

#[test]
fn fires_high_diabetes_distress_rule() {
    let mut data = create_well_controlled_assessment();
    data.psychological_wellbeing.diabetes_distress = Some(5);

    let (_level, _score, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DM-015"));
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
fn returns_suboptimal_for_moderate_hba1c() {
    let mut data = AssessmentData::default();
    data.glycaemic_control.hba1c_value = Some(58.0); // 58 mmol/mol ~ 7.5%
    data.glycaemic_control.hba1c_unit = "mmolMol".to_string();
    data.medications.medication_adherence = Some(3);
    data.self_care_lifestyle.diet_adherence = Some(3);

    let (level, _score, _fired_rules) = calculate_control(&data);
    assert_eq!(level, "suboptimal");
}
