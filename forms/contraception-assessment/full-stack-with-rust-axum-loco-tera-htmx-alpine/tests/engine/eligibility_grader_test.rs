use contraception_assessment_tera_crate::engine::eligibility_grader::calculate_eligibility;
use contraception_assessment_tera_crate::engine::eligibility_rules::all_rules;
use contraception_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_safe_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1995-06-15".to_string();
    data.patient_information.age = Some(30);
    data.patient_information.sex = "female".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.consultation_date = "2026-03-09".to_string();
    data.patient_information.clinician_name = "Dr Jones".to_string();

    // Reproductive History - no concerns
    data.reproductive_history.parity = Some(1);
    data.reproductive_history.pregnancy_possible = "no".to_string();
    data.reproductive_history.breastfeeding = "no".to_string();
    data.reproductive_history.ectopic_history = "no".to_string();
    data.reproductive_history.current_sti_risk = "no".to_string();

    // Medical History - all clear
    data.medical_history.vte_history = "no".to_string();
    data.medical_history.vte_family_history = "no".to_string();
    data.medical_history.stroke_history = "no".to_string();
    data.medical_history.ischaemic_heart_disease = "no".to_string();
    data.medical_history.breast_cancer_current = "no".to_string();
    data.medical_history.breast_cancer_history = "no".to_string();
    data.medical_history.sle_with_antiphospholipid = "no".to_string();
    data.medical_history.liver_disease = "none".to_string();
    data.medical_history.diabetes_complications = "no".to_string();

    // Cardiovascular Risk - normal
    data.cardiovascular_risk.systolic_bp = Some(120);
    data.cardiovascular_risk.diastolic_bp = Some(78);
    data.cardiovascular_risk.migraine_with_aura = "no".to_string();
    data.cardiovascular_risk.migraine_without_aura = "no".to_string();
    data.cardiovascular_risk.multiple_cv_risk_factors = "no".to_string();

    // Current Medications - none concerning
    data.current_medications.anticonvulsants = "no".to_string();
    data.current_medications.rifampicin_rifabutin = "no".to_string();

    // Smoking & BMI - healthy
    data.smoking_bmi.smoking_status = "never".to_string();
    data.smoking_bmi.age_over_35_smoking = "no".to_string();
    data.smoking_bmi.bmi = Some(24.0);
    data.smoking_bmi.bmi_over_35 = "no".to_string();

    // Contraceptive Preferences
    data.contraceptive_preferences.current_method = "coc".to_string();
    data.contraceptive_preferences.preferred_method = "implant".to_string();

    // UKMEC Eligibility - all category 1
    data.ukmec_eligibility.coc_category = Some(1);
    data.ukmec_eligibility.pop_category = Some(1);
    data.ukmec_eligibility.patch_ring_category = Some(1);
    data.ukmec_eligibility.dmpa_injectable_category = Some(1);
    data.ukmec_eligibility.implant_category = Some(1);
    data.ukmec_eligibility.lng_ius_category = Some(1);
    data.ukmec_eligibility.cu_iud_category = Some(1);
    data.ukmec_eligibility.barrier_category = Some(1);

    // Counselling - complete
    data.counselling.consent_obtained = "yes".to_string();
    data.counselling.risks_benefits_discussed = "yes".to_string();
    data.counselling.side_effects_discussed = "yes".to_string();

    // Clinical Review
    data.clinical_review.method_chosen = "implant".to_string();
    data.clinical_review.cervical_screening_status = "upToDate".to_string();
    data.clinical_review.follow_up_date = "2026-06-09".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "draft");
    assert_eq!(category, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_no_contraindication_for_healthy_patient() {
    let data = create_safe_assessment();
    let (level, category, _fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "noContraindication");
    assert_eq!(category, 1);
}

#[test]
fn returns_absolute_contraindication_for_migraine_with_aura() {
    let mut data = create_safe_assessment();
    data.cardiovascular_risk.migraine_with_aura = "yes".to_string();

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "absoluteContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-001"));
}

#[test]
fn returns_absolute_contraindication_for_vte_history() {
    let mut data = create_safe_assessment();
    data.medical_history.vte_history = "yes".to_string();

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "absoluteContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-002"));
}

#[test]
fn returns_absolute_contraindication_for_severe_hypertension() {
    let mut data = create_safe_assessment();
    data.cardiovascular_risk.systolic_bp = Some(170);
    data.cardiovascular_risk.diastolic_bp = Some(105);

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "absoluteContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-003"));
}

#[test]
fn returns_absolute_contraindication_for_current_breast_cancer() {
    let mut data = create_safe_assessment();
    data.medical_history.breast_cancer_current = "yes".to_string();

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "absoluteContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-004"));
}

#[test]
fn returns_absolute_contraindication_for_pregnancy_possible() {
    let mut data = create_safe_assessment();
    data.reproductive_history.pregnancy_possible = "yes".to_string();

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "absoluteContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-005"));
}

#[test]
fn returns_relative_contraindication_for_elevated_bp() {
    let mut data = create_safe_assessment();
    data.cardiovascular_risk.systolic_bp = Some(145);
    data.cardiovascular_risk.diastolic_bp = Some(92);

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "relativeContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-006"));
}

#[test]
fn returns_relative_contraindication_for_bmi_over_35() {
    let mut data = create_safe_assessment();
    data.smoking_bmi.bmi = Some(37.0);

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "relativeContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-007"));
}

#[test]
fn returns_relative_contraindication_for_smoker_over_35() {
    let mut data = create_safe_assessment();
    data.smoking_bmi.age_over_35_smoking = "yes".to_string();

    let (level, _category, fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "relativeContraindication");
    assert!(fired_rules.iter().any(|r| r.id == "CONT-008"));
}

#[test]
fn fires_breastfeeding_under_6_weeks_rule() {
    let mut data = create_safe_assessment();
    data.reproductive_history.breastfeeding = "yes".to_string();
    data.reproductive_history.breastfeeding_duration = "lessThan6Weeks".to_string();

    let (_level, _category, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CONT-009"));
}

#[test]
fn fires_enzyme_inducing_drugs_rule() {
    let mut data = create_safe_assessment();
    data.current_medications.rifampicin_rifabutin = "yes".to_string();

    let (_level, _category, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CONT-010"));
}

#[test]
fn fires_all_ukmec_1_positive_rule() {
    let data = create_safe_assessment();
    let (_level, _category, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CONT-016"));
}

#[test]
fn fires_larc_chosen_rule() {
    let data = create_safe_assessment();
    let (_level, _category, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CONT-018"));
}

#[test]
fn fires_counselling_complete_rule() {
    let data = create_safe_assessment();
    let (_level, _category, fired_rules) = calculate_eligibility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "CONT-017"));
}

#[test]
fn returns_absolute_for_ukmec_4_category() {
    let mut data = create_safe_assessment();
    // Set one method to UKMEC 4
    data.ukmec_eligibility.coc_category = Some(4);

    let (level, category, _fired_rules) = calculate_eligibility(&data);
    assert_eq!(level, "absoluteContraindication");
    assert_eq!(category, 4);
}

#[test]
fn returns_relative_for_ukmec_3_category() {
    let mut data = create_safe_assessment();
    data.ukmec_eligibility.coc_category = Some(3);

    let (level, category, _fired_rules) = calculate_eligibility(&data);
    // Should be relativeContraindication because UKMEC 3 present
    assert_eq!(level, "relativeContraindication");
    assert_eq!(category, 3);
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
