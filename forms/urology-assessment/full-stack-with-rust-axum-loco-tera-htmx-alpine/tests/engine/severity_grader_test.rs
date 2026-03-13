use urology_assessment_tera_crate::engine::severity_grader::calculate_severity;
use urology_assessment_tera_crate::engine::severity_rules::all_rules;
use urology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1960-05-15".to_string();
    data.patient_information.patient_sex = "male".to_string();
    data.patient_information.referral_date = "2026-03-01".to_string();
    data.patient_information.referring_provider = "Dr Jones".to_string();
    data.patient_information.reason_for_referral = "luts".to_string();

    // IPSS - moderate (total 12)
    data.urinary_symptoms.incomplete_emptying = Some(2);
    data.urinary_symptoms.frequency = Some(2);
    data.urinary_symptoms.intermittency = Some(1);
    data.urinary_symptoms.urgency = Some(2);
    data.urinary_symptoms.weak_stream = Some(2);
    data.urinary_symptoms.straining = Some(1);
    data.urinary_symptoms.nocturia = Some(2);
    data.urinary_symptoms.quality_of_life = Some(3);

    // Lower Urinary Tract - mild
    data.lower_urinary_tract.dysuria = "no".to_string();
    data.lower_urinary_tract.haematuria = "none".to_string();
    data.lower_urinary_tract.incontinence_type = "none".to_string();
    data.lower_urinary_tract.urinary_retention = "none".to_string();
    data.lower_urinary_tract.recurrent_uti = "no".to_string();
    data.lower_urinary_tract.uti_frequency_per_year = Some(0);

    // Renal Function - normal
    data.renal_function.egfr = Some(85);
    data.renal_function.creatinine = Some(90);
    data.renal_function.proteinuria = "no".to_string();
    data.renal_function.hydronephrosis = "no".to_string();
    data.renal_function.renal_impairment_known = "no".to_string();
    data.renal_function.dialysis = "no".to_string();

    // Prostate - normal PSA
    data.prostate_assessment.psa_level = Some(2.5);
    data.prostate_assessment.psa_velocity = "stable".to_string();
    data.prostate_assessment.dre_findings = "enlarged".to_string();
    data.prostate_assessment.prostate_volume = "30to60".to_string();
    data.prostate_assessment.bph_medication = "yes".to_string();
    data.prostate_assessment.family_history_prostate_cancer = "no".to_string();

    // Bladder - mild
    data.bladder_assessment.post_void_residual = "50to100".to_string();
    data.bladder_assessment.bladder_capacity = "normal".to_string();
    data.bladder_assessment.overactive_bladder = "no".to_string();
    data.bladder_assessment.bladder_diary_completed = "yes".to_string();
    data.bladder_assessment.fluid_intake_daily = "1to2L".to_string();
    data.bladder_assessment.caffeine_intake = "moderate".to_string();

    // Stone Disease - none
    data.stone_disease.stone_history = "no".to_string();
    data.stone_disease.stone_location = "none".to_string();
    data.stone_disease.recurrent_stones = "no".to_string();

    // Urological Cancers - none
    data.urological_cancers.cancer_type = "none".to_string();
    data.urological_cancers.surveillance_status = "none".to_string();
    data.urological_cancers.unexplained_weight_loss = "no".to_string();
    data.urological_cancers.bone_pain = "no".to_string();

    // Sexual Function - mild ED
    data.sexual_function.erectile_dysfunction = "yes".to_string();
    data.sexual_function.ed_severity = Some(2);
    data.sexual_function.ed_duration_months = "6to12".to_string();
    data.sexual_function.libido_change = "normal".to_string();
    data.sexual_function.ejaculatory_dysfunction = "none".to_string();
    data.sexual_function.fertility_concerns = "no".to_string();

    // Clinical Review
    data.clinical_review.comorbidities = "Hypertension".to_string();
    data.clinical_review.current_medications = "Tamsulosin 400mcg OD".to_string();
    data.clinical_review.anticoagulant_use = "no".to_string();
    data.clinical_review.smoking_status = "exSmoker".to_string();
    data.clinical_review.allergy_history = "NKDA".to_string();

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
fn returns_moderate_or_mild_for_moderate_assessment() {
    let data = create_moderate_assessment();
    let (level, score, _fired_rules) = calculate_severity(&data);
    // Moderate IPSS (12/35), normal eGFR, normal PSA → moderate or mild
    assert!(
        level == "moderate" || level == "mild",
        "Expected moderate or mild, got {level}"
    );
    assert!(score > 0.0);
}

#[test]
fn returns_urgent_for_very_high_psa() {
    let mut data = create_moderate_assessment();
    data.prostate_assessment.psa_level = Some(25.0);

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "URO-001"));
}

#[test]
fn returns_urgent_for_visible_haematuria() {
    let mut data = create_moderate_assessment();
    data.lower_urinary_tract.haematuria = "visible".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "URO-003"));
}

#[test]
fn returns_urgent_for_renal_failure() {
    let mut data = create_moderate_assessment();
    data.renal_function.egfr = Some(10);

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "URO-004"));
}

#[test]
fn returns_urgent_for_acute_retention() {
    let mut data = create_moderate_assessment();
    data.lower_urinary_tract.urinary_retention = "acute".to_string();

    let (level, _score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "urgent");
    assert!(fired_rules.iter().any(|r| r.id == "URO-005"));
}

#[test]
fn fires_severe_ipss_rule() {
    let mut data = create_moderate_assessment();
    // Set all IPSS items to 4 (total = 28, severe)
    data.urinary_symptoms.incomplete_emptying = Some(4);
    data.urinary_symptoms.frequency = Some(4);
    data.urinary_symptoms.intermittency = Some(4);
    data.urinary_symptoms.urgency = Some(4);
    data.urinary_symptoms.weak_stream = Some(4);
    data.urinary_symptoms.straining = Some(4);
    data.urinary_symptoms.nocturia = Some(4);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "URO-006"));
}

#[test]
fn fires_mild_ipss_rule_for_low_scores() {
    let mut data = create_moderate_assessment();
    // Set all IPSS items to 1 (total = 7, mild)
    data.urinary_symptoms.incomplete_emptying = Some(1);
    data.urinary_symptoms.frequency = Some(1);
    data.urinary_symptoms.intermittency = Some(1);
    data.urinary_symptoms.urgency = Some(1);
    data.urinary_symptoms.weak_stream = Some(1);
    data.urinary_symptoms.straining = Some(1);
    data.urinary_symptoms.nocturia = Some(1);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "URO-016"));
}

#[test]
fn fires_elevated_psa_rule() {
    let mut data = create_moderate_assessment();
    data.prostate_assessment.psa_level = Some(7.5);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "URO-007"));
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
