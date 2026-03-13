use cardiology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use cardiology_assessment_tera_crate::engine::types::*;

fn create_stable_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Doe".to_string();

    data.cardiac_history.heart_failure = "no".to_string();
    data.cardiac_history.atrial_fibrillation = "no".to_string();
    data.cardiac_history.pacemaker = "no".to_string();

    data.symptoms_assessment.chest_pain = "no".to_string();
    data.symptoms_assessment.orthopnoea = "no".to_string();
    data.symptoms_assessment.pnd = "no".to_string();
    data.symptoms_assessment.syncope = "no".to_string();
    data.symptoms_assessment.nyha_class = "I".to_string();

    data.physical_examination.heart_rate = Some(68);
    data.physical_examination.blood_pressure_systolic = Some(125.0);
    data.physical_examination.blood_pressure_diastolic = Some(78.0);
    data.physical_examination.heart_rhythm = "regular".to_string();
    data.physical_examination.lung_creps = "no".to_string();

    data.ecg_findings.st_changes = "no".to_string();

    data.echocardiography.lvef = Some(60);
    data.echocardiography.valvular_abnormality = "no".to_string();

    data.investigations.troponin = Some(3.0);
    data.investigations.bnp = Some(40.0);
    data.investigations.coronary_angiogram_done = "no".to_string();
    data.investigations.stress_test_done = "yes".to_string();

    data.current_treatment.anticoagulant = "none".to_string();
    data.current_treatment.beta_blocker = "no".to_string();
    data.current_treatment.ace_inhibitor = "no".to_string();

    data
}

#[test]
fn no_flags_for_stable_patient() {
    let data = create_stable_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_acute_chest_pain() {
    let mut data = create_stable_assessment();
    data.symptoms_assessment.chest_pain = "yes".to_string();
    data.symptoms_assessment.chest_pain_type = "typical".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ACS-001"));
}

#[test]
fn flags_severe_heart_failure() {
    let mut data = create_stable_assessment();
    data.echocardiography.lvef = Some(25);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HF-001"));
}

#[test]
fn flags_decompensated_hf() {
    let mut data = create_stable_assessment();
    data.symptoms_assessment.orthopnoea = "yes".to_string();
    data.symptoms_assessment.pnd = "yes".to_string();
    data.physical_examination.lung_creps = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HF-002"));
}

#[test]
fn flags_syncope() {
    let mut data = create_stable_assessment();
    data.symptoms_assessment.syncope = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SYNC-001"));
}

#[test]
fn flags_hypertensive_crisis() {
    let mut data = create_stable_assessment();
    data.physical_examination.blood_pressure_systolic = Some(190.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-BP-001"));
}

#[test]
fn flags_elevated_troponin() {
    let mut data = create_stable_assessment();
    data.investigations.troponin = Some(50.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TROP-001"));
}

#[test]
fn flags_af_without_anticoagulation() {
    let mut data = create_stable_assessment();
    data.cardiac_history.atrial_fibrillation = "yes".to_string();
    data.current_treatment.anticoagulant = "none".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANTI-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_stable_assessment();
    // Create flags of different priorities
    data.symptoms_assessment.syncope = "yes".to_string(); // high
    data.cardiac_history.atrial_fibrillation = "yes".to_string(); // medium (AF without anticoag)
    data.current_treatment.anticoagulant = "none".to_string();
    data.investigations.bnp = Some(500.0); // medium

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
