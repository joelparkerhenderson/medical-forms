use oncology_assessment_tera_crate::engine::oncology_grader::calculate_oncology;
use oncology_assessment_tera_crate::engine::oncology_rules::all_rules;
use oncology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_stable_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.date_of_birth = "1975-06-15".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.medical_record_number = "MRN-12345".to_string();
    data.patient_information.referring_physician = "Dr Smith".to_string();
    data.patient_information.assessment_date = "2026-03-10".to_string();
    data.patient_information.primary_oncologist = "Dr Jones".to_string();
    data.patient_information.insurance_status = "insured".to_string();

    // Cancer Diagnosis (non-scored)
    data.cancer_diagnosis.cancer_type = "breast".to_string();
    data.cancer_diagnosis.cancer_site = "Left breast".to_string();
    data.cancer_diagnosis.histology = "invasive-ductal-carcinoma".to_string();
    data.cancer_diagnosis.histology_other = "".to_string();
    data.cancer_diagnosis.date_of_diagnosis = "2025-12-01".to_string();
    data.cancer_diagnosis.diagnosis_method = "biopsy".to_string();
    data.cancer_diagnosis.biomarkers_tested = "ER, PR, HER2".to_string();
    data.cancer_diagnosis.genetic_testing_done = "yes".to_string();
    data.cancer_diagnosis.family_cancer_history = "no".to_string();

    // Staging & Grading (non-scored)
    data.staging_grading.tnm_t_stage = "T1".to_string();
    data.staging_grading.tnm_n_stage = "N0".to_string();
    data.staging_grading.tnm_m_stage = "M0".to_string();
    data.staging_grading.overall_stage = "I".to_string();
    data.staging_grading.tumor_grade = "G1".to_string();
    data.staging_grading.staging_date = "2025-12-15".to_string();
    data.staging_grading.staging_method = "pathological".to_string();

    // Treatment History (non-scored)
    data.treatment_history.prior_surgery = "yes".to_string();
    data.treatment_history.surgery_date = "2026-01-10".to_string();
    data.treatment_history.prior_radiation = "no".to_string();
    data.treatment_history.prior_chemotherapy = "no".to_string();
    data.treatment_history.prior_immunotherapy = "no".to_string();
    data.treatment_history.treatment_response = "completeResponse".to_string();

    // Current Treatment (non-scored)
    data.current_treatment.current_treatment_type = "hormoneTherapy".to_string();
    data.current_treatment.current_regimen = "Tamoxifen".to_string();
    data.current_treatment.treatment_cycle = "Ongoing".to_string();
    data.current_treatment.treatment_start_date = "2026-02-01".to_string();
    data.current_treatment.treatment_intent = "adjuvant".to_string();
    data.current_treatment.clinical_trial_enrollment = "no".to_string();
    data.current_treatment.treatment_modifications = "none".to_string();

    // Side Effects & Toxicity — all 1s (minimal)
    data.side_effects_toxicity.nausea_severity = Some(1);
    data.side_effects_toxicity.fatigue_severity = Some(1);
    data.side_effects_toxicity.pain_severity = Some(1);
    data.side_effects_toxicity.neuropathy_severity = Some(1);
    data.side_effects_toxicity.mucositis_severity = Some(1);
    data.side_effects_toxicity.skin_toxicity_severity = Some(1);
    data.side_effects_toxicity.hematologic_toxicity = "none".to_string();
    data.side_effects_toxicity.weight_change = "stable".to_string();

    // Performance Status — ECOG 0, all 1s
    data.performance_status.ecog_score = Some(0);
    data.performance_status.karnofsky_score = Some(100);
    data.performance_status.mobility_level = "fullyMobile".to_string();
    data.performance_status.self_care_ability = Some(1);
    data.performance_status.daily_activity_level = Some(1);
    data.performance_status.nutritional_status = Some(1);
    data.performance_status.cognitive_function = Some(1);
    data.performance_status.sleep_quality = Some(1);

    // Psychosocial Assessment — all 1s (good)
    data.psychosocial_assessment.anxiety_level = Some(1);
    data.psychosocial_assessment.depression_screening = Some(1);
    data.psychosocial_assessment.distress_thermometer = Some(1);
    data.psychosocial_assessment.social_support = Some(1);
    data.psychosocial_assessment.financial_toxicity = Some(1);
    data.psychosocial_assessment.coping_ability = Some(1);
    data.psychosocial_assessment.spiritual_needs = "no".to_string();
    data.psychosocial_assessment.caregiver_burden = "none".to_string();

    // Palliative Care Needs — all 1s (good)
    data.palliative_care_needs.symptom_burden = Some(1);
    data.palliative_care_needs.pain_management_adequacy = Some(1);
    data.palliative_care_needs.advance_directive_status = "completed".to_string();
    data.palliative_care_needs.goals_of_care_discussed = "yes".to_string();
    data.palliative_care_needs.hospice_referral_indicated = "no".to_string();
    data.palliative_care_needs.quality_of_life_score = Some(1);
    data.palliative_care_needs.end_of_life_planning = "notApplicable".to_string();
    data.palliative_care_needs.palliative_care_referral = "no".to_string();

    // Clinical Review (non-scored)
    data.clinical_review.tumor_board_reviewed = "yes".to_string();
    data.clinical_review.follow_up_interval = "3months".to_string();
    data.clinical_review.survivorship_plan = "inDevelopment".to_string();
    data.clinical_review.patient_education_provided = "yes".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_oncology(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_stable_for_all_ones() {
    let data = create_stable_assessment();
    let (level, score, _fired_rules) = calculate_oncology(&data);
    assert_eq!(level, "stable");
    assert_eq!(score, 0.0); // (1-1)/4 * 100 = 0
}

#[test]
fn returns_monitoring_for_all_twos() {
    let mut data = create_stable_assessment();
    // Set all scored items to 2
    data.side_effects_toxicity.nausea_severity = Some(2);
    data.side_effects_toxicity.fatigue_severity = Some(2);
    data.side_effects_toxicity.pain_severity = Some(2);
    data.side_effects_toxicity.neuropathy_severity = Some(2);
    data.side_effects_toxicity.mucositis_severity = Some(2);
    data.side_effects_toxicity.skin_toxicity_severity = Some(2);
    data.performance_status.self_care_ability = Some(2);
    data.performance_status.daily_activity_level = Some(2);
    data.performance_status.nutritional_status = Some(2);
    data.performance_status.cognitive_function = Some(2);
    data.performance_status.sleep_quality = Some(2);
    data.psychosocial_assessment.anxiety_level = Some(2);
    data.psychosocial_assessment.depression_screening = Some(2);
    data.psychosocial_assessment.distress_thermometer = Some(2);
    data.psychosocial_assessment.social_support = Some(2);
    data.psychosocial_assessment.financial_toxicity = Some(2);
    data.psychosocial_assessment.coping_ability = Some(2);
    data.palliative_care_needs.symptom_burden = Some(2);
    data.palliative_care_needs.pain_management_adequacy = Some(2);
    data.palliative_care_needs.quality_of_life_score = Some(2);

    let (level, score, _fired_rules) = calculate_oncology(&data);
    assert_eq!(level, "monitoring");
    assert_eq!(score, 25.0); // (2-1)/4 * 100 = 25
}

#[test]
fn returns_active_issue_for_all_threes() {
    let mut data = create_stable_assessment();
    data.side_effects_toxicity.nausea_severity = Some(3);
    data.side_effects_toxicity.fatigue_severity = Some(3);
    data.side_effects_toxicity.pain_severity = Some(3);
    data.side_effects_toxicity.neuropathy_severity = Some(3);
    data.side_effects_toxicity.mucositis_severity = Some(3);
    data.side_effects_toxicity.skin_toxicity_severity = Some(3);
    data.performance_status.self_care_ability = Some(3);
    data.performance_status.daily_activity_level = Some(3);
    data.performance_status.nutritional_status = Some(3);
    data.performance_status.cognitive_function = Some(3);
    data.performance_status.sleep_quality = Some(3);
    data.psychosocial_assessment.anxiety_level = Some(3);
    data.psychosocial_assessment.depression_screening = Some(3);
    data.psychosocial_assessment.distress_thermometer = Some(3);
    data.psychosocial_assessment.social_support = Some(3);
    data.psychosocial_assessment.financial_toxicity = Some(3);
    data.psychosocial_assessment.coping_ability = Some(3);
    data.palliative_care_needs.symptom_burden = Some(3);
    data.palliative_care_needs.pain_management_adequacy = Some(3);
    data.palliative_care_needs.quality_of_life_score = Some(3);

    let (level, score, _fired_rules) = calculate_oncology(&data);
    assert_eq!(level, "activeIssue");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn returns_palliative_for_all_fives() {
    let mut data = create_stable_assessment();
    data.side_effects_toxicity.nausea_severity = Some(5);
    data.side_effects_toxicity.fatigue_severity = Some(5);
    data.side_effects_toxicity.pain_severity = Some(5);
    data.side_effects_toxicity.neuropathy_severity = Some(5);
    data.side_effects_toxicity.mucositis_severity = Some(5);
    data.side_effects_toxicity.skin_toxicity_severity = Some(5);
    data.performance_status.self_care_ability = Some(5);
    data.performance_status.daily_activity_level = Some(5);
    data.performance_status.nutritional_status = Some(5);
    data.performance_status.cognitive_function = Some(5);
    data.performance_status.sleep_quality = Some(5);
    data.psychosocial_assessment.anxiety_level = Some(5);
    data.psychosocial_assessment.depression_screening = Some(5);
    data.psychosocial_assessment.distress_thermometer = Some(5);
    data.psychosocial_assessment.social_support = Some(5);
    data.psychosocial_assessment.financial_toxicity = Some(5);
    data.psychosocial_assessment.coping_ability = Some(5);
    data.palliative_care_needs.symptom_burden = Some(5);
    data.palliative_care_needs.pain_management_adequacy = Some(5);
    data.palliative_care_needs.quality_of_life_score = Some(5);

    let (level, score, fired_rules) = calculate_oncology(&data);
    assert_eq!(level, "palliative");
    assert_eq!(score, 100.0); // (5-1)/4 * 100 = 100
    assert!(fired_rules.len() >= 5); // Multiple high/medium concern rules should fire
}

#[test]
fn fires_ecog_4_rule() {
    let mut data = create_stable_assessment();
    data.performance_status.ecog_score = Some(4);

    let (_level, _score, fired_rules) = calculate_oncology(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ONC-001"));
}

#[test]
fn fires_stage_iv_rule() {
    let mut data = create_stable_assessment();
    data.staging_grading.overall_stage = "IV".to_string();

    let (_level, _score, fired_rules) = calculate_oncology(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ONC-002"));
}

#[test]
fn fires_hospice_referral_rule() {
    let mut data = create_stable_assessment();
    data.palliative_care_needs.hospice_referral_indicated = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_oncology(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ONC-005"));
}

#[test]
fn fires_positive_rules_for_stable_patient() {
    let data = create_stable_assessment();
    let (_level, _score, fired_rules) = calculate_oncology(&data);
    // Should fire: ECOG 0 (ONC-016), complete response (ONC-017), early stage (ONC-018),
    // good psychosocial (ONC-019), goals discussed (ONC-020)
    assert!(fired_rules.iter().any(|r| r.id == "ONC-016")); // ECOG 0
    assert!(fired_rules.iter().any(|r| r.id == "ONC-017")); // Complete response
    assert!(fired_rules.iter().any(|r| r.id == "ONC-018")); // Early stage
    assert!(fired_rules.iter().any(|r| r.id == "ONC-019")); // Good psychosocial
    assert!(fired_rules.iter().any(|r| r.id == "ONC-020")); // Goals discussed
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
