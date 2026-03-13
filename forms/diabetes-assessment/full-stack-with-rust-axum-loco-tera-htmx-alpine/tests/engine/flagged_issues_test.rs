use diabetes_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use diabetes_assessment_tera_crate::engine::types::*;

fn create_well_controlled_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();

    data.diabetes_history.diabetes_type = "type2".to_string();

    data.glycaemic_control.hba1c_value = Some(48.0);
    data.glycaemic_control.hba1c_unit = "mmolMol".to_string();
    data.glycaemic_control.hba1c_target = Some(53.0);
    data.glycaemic_control.hypoglycaemia_frequency = "never".to_string();
    data.glycaemic_control.severe_hypoglycaemia = "no".to_string();

    data.medications.metformin = "yes".to_string();
    data.medications.insulin = "no".to_string();
    data.medications.medication_adherence = Some(4);

    data.complications_screening.retinopathy_status = "none".to_string();
    data.complications_screening.egfr = Some(90.0);
    data.complications_screening.urine_acr = Some(1.5);
    data.complications_screening.neuropathy_symptoms = "no".to_string();
    data.complications_screening.last_eye_screening = "2026-01-15".to_string();

    data.cardiovascular_risk.previous_cvd_event = "no".to_string();
    data.cardiovascular_risk.on_statin = "yes".to_string();
    data.cardiovascular_risk.on_antihypertensive = "no".to_string();

    data.self_care_lifestyle.diet_adherence = Some(4);
    data.self_care_lifestyle.physical_activity = "regular".to_string();

    data.psychological_wellbeing.diabetes_distress = Some(2);
    data.psychological_wellbeing.depression_screening = Some(1);
    data.psychological_wellbeing.coping_ability = Some(4);
    data.psychological_wellbeing.eating_disorder = "no".to_string();

    data.foot_assessment.ulcer_present = "no".to_string();
    data.foot_assessment.foot_risk_category = "low".to_string();

    data
}

#[test]
fn no_flags_for_well_controlled_patient() {
    let data = create_well_controlled_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_critically_elevated_hba1c() {
    let mut data = create_well_controlled_assessment();
    data.glycaemic_control.hba1c_value = Some(100.0);
    data.glycaemic_control.hba1c_unit = "mmolMol".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HBA1C-001"));
}

#[test]
fn flags_severe_hypoglycaemia() {
    let mut data = create_well_controlled_assessment();
    data.glycaemic_control.severe_hypoglycaemia = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HYPO-001"));
}

#[test]
fn flags_active_foot_ulcer() {
    let mut data = create_well_controlled_assessment();
    data.foot_assessment.ulcer_present = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FOOT-001"));
}

#[test]
fn flags_proliferative_retinopathy() {
    let mut data = create_well_controlled_assessment();
    data.complications_screening.retinopathy_status = "proliferative".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-EYE-001"));
}

#[test]
fn flags_low_egfr() {
    let mut data = create_well_controlled_assessment();
    data.complications_screening.egfr = Some(25.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RENAL-001"));
}

#[test]
fn flags_macroalbuminuria() {
    let mut data = create_well_controlled_assessment();
    data.complications_screening.urine_acr = Some(35.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RENAL-002"));
}

#[test]
fn flags_cvd_without_secondary_prevention() {
    let mut data = create_well_controlled_assessment();
    data.cardiovascular_risk.previous_cvd_event = "yes".to_string();
    data.cardiovascular_risk.on_statin = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CVD-001"));
}

#[test]
fn flags_severe_diabetes_distress() {
    let mut data = create_well_controlled_assessment();
    data.psychological_wellbeing.diabetes_distress = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PSYCH-001"));
}

#[test]
fn flags_overdue_eye_screening() {
    let mut data = create_well_controlled_assessment();
    data.complications_screening.last_eye_screening = "".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-EYE-002"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_well_controlled_assessment();
    // Create flags of different priorities
    data.glycaemic_control.severe_hypoglycaemia = "yes".to_string(); // high
    data.foot_assessment.foot_risk_category = "high".to_string(); // medium
    data.complications_screening.last_eye_screening = "".to_string(); // medium

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
