use urology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use urology_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "John Smith".to_string();
    data.patient_information.referral_date = "2026-03-01".to_string();
    data.patient_information.referring_provider = "Dr Jones".to_string();

    data.urinary_symptoms.incomplete_emptying = Some(1);
    data.urinary_symptoms.frequency = Some(1);
    data.urinary_symptoms.intermittency = Some(1);
    data.urinary_symptoms.urgency = Some(1);
    data.urinary_symptoms.weak_stream = Some(1);
    data.urinary_symptoms.straining = Some(1);
    data.urinary_symptoms.nocturia = Some(1);
    data.urinary_symptoms.quality_of_life = Some(2);

    data.lower_urinary_tract.dysuria = "no".to_string();
    data.lower_urinary_tract.haematuria = "none".to_string();
    data.lower_urinary_tract.incontinence_type = "none".to_string();
    data.lower_urinary_tract.urinary_retention = "none".to_string();
    data.lower_urinary_tract.recurrent_uti = "no".to_string();

    data.renal_function.egfr = Some(90);
    data.renal_function.hydronephrosis = "no".to_string();
    data.renal_function.dialysis = "no".to_string();

    data.prostate_assessment.psa_level = Some(2.0);
    data.prostate_assessment.dre_findings = "normal".to_string();
    data.prostate_assessment.family_history_prostate_cancer = "no".to_string();

    data.stone_disease.stone_history = "no".to_string();
    data.stone_disease.recurrent_stones = "no".to_string();

    data.urological_cancers.cancer_type = "none".to_string();
    data.urological_cancers.unexplained_weight_loss = "no".to_string();
    data.urological_cancers.bone_pain = "no".to_string();

    data.clinical_review.anticoagulant_use = "no".to_string();

    data
}

#[test]
fn no_flags_for_normal_patient() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_acute_retention() {
    let mut data = create_normal_assessment();
    data.lower_urinary_tract.urinary_retention = "acute".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RET-001"));
}

#[test]
fn flags_visible_haematuria() {
    let mut data = create_normal_assessment();
    data.lower_urinary_tract.haematuria = "visible".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HAEM-001"));
}

#[test]
fn flags_critical_psa() {
    let mut data = create_normal_assessment();
    data.prostate_assessment.psa_level = Some(25.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PSA-001"));
}

#[test]
fn flags_elevated_psa_with_abnormal_dre() {
    let mut data = create_normal_assessment();
    data.prostate_assessment.psa_level = Some(6.0);
    data.prostate_assessment.dre_findings = "abnormal".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PSA-002"));
}

#[test]
fn flags_renal_failure() {
    let mut data = create_normal_assessment();
    data.renal_function.egfr = Some(10);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RENAL-001"));
}

#[test]
fn flags_large_stone() {
    let mut data = create_normal_assessment();
    data.stone_disease.stone_size_mm = Some(15);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-STONE-001"));
}

#[test]
fn flags_anticoagulant_use() {
    let mut data = create_normal_assessment();
    data.clinical_review.anticoagulant_use = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MED-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.lower_urinary_tract.urinary_retention = "acute".to_string(); // high
    data.renal_function.hydronephrosis = "yes".to_string(); // medium
    data.prostate_assessment.family_history_prostate_cancer = "yes".to_string(); // low
    data.clinical_review.anticoagulant_use = "yes".to_string(); // medium

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
