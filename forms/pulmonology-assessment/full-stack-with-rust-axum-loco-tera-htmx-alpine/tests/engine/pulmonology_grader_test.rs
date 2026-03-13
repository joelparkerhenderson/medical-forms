use pulmonology_assessment_tera_crate::engine::pulmonology_grader::calculate_severity;
use pulmonology_assessment_tera_crate::engine::pulmonology_rules::all_rules;
use pulmonology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1960-05-15".to_string();
    data.patient_information.patient_age = "65to79".to_string();
    data.patient_information.patient_sex = "male".to_string();
    data.patient_information.referring_physician = "Dr Jones".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.primary_complaint = "Chronic cough".to_string();
    data.patient_information.insurance_status = "insured".to_string();

    // Respiratory History
    data.respiratory_history.asthma_history = "no".to_string();
    data.respiratory_history.copd_history = "yes".to_string();
    data.respiratory_history.pneumonia_history = "yes".to_string();
    data.respiratory_history.tuberculosis_history = "no".to_string();
    data.respiratory_history.lung_cancer_history = "no".to_string();
    data.respiratory_history.interstitial_lung_disease = "no".to_string();
    data.respiratory_history.family_respiratory_history = "copd".to_string();
    data.respiratory_history.previous_hospitalizations = Some(3);

    // Symptom Assessment — moderate (3s)
    data.symptom_assessment.dyspnea_severity = Some(3);
    data.symptom_assessment.cough_severity = Some(3);
    data.symptom_assessment.sputum_production = Some(3);
    data.symptom_assessment.wheezing_frequency = Some(3);
    data.symptom_assessment.chest_tightness = Some(3);
    data.symptom_assessment.hemoptysis_present = "no".to_string();
    data.symptom_assessment.symptom_duration = "moreThan1Year".to_string();
    data.symptom_assessment.nocturnal_symptoms = Some(3);

    // Smoking & Exposure
    data.smoking_exposure.smoking_status = "former".to_string();
    data.smoking_exposure.pack_years = "20to40".to_string();
    data.smoking_exposure.secondhand_smoke = "no".to_string();
    data.smoking_exposure.occupational_exposure = "none".to_string();
    data.smoking_exposure.environmental_allergens = "no".to_string();
    data.smoking_exposure.dust_exposure = "no".to_string();
    data.smoking_exposure.chemical_exposure = "no".to_string();
    data.smoking_exposure.asbestos_exposure = "no".to_string();

    // PFT — moderate (3s)
    data.pulmonary_function_tests.fev1_percent_predicted = Some(3);
    data.pulmonary_function_tests.fvc_percent_predicted = Some(3);
    data.pulmonary_function_tests.fev1_fvc_ratio = Some(3);
    data.pulmonary_function_tests.dlco_percent_predicted = Some(3);
    data.pulmonary_function_tests.bronchodilator_response = "positive".to_string();
    data.pulmonary_function_tests.peak_flow_variability = Some(3);
    data.pulmonary_function_tests.lung_volumes_normal = "no".to_string();
    data.pulmonary_function_tests.flow_volume_loop_pattern = "obstructive".to_string();

    // Chest Imaging
    data.chest_imaging.chest_xray_findings = "hyperinflation".to_string();
    data.chest_imaging.ct_scan_findings = "emphysema".to_string();
    data.chest_imaging.nodule_detected = "no".to_string();
    data.chest_imaging.nodule_size_mm = "notApplicable".to_string();
    data.chest_imaging.pleural_effusion = "no".to_string();
    data.chest_imaging.consolidation_present = "no".to_string();
    data.chest_imaging.fibrosis_pattern = "none".to_string();
    data.chest_imaging.imaging_urgency = Some(3);

    // ABG — moderate (3)
    data.arterial_blood_gases.pao2_mmhg = "60to79".to_string();
    data.arterial_blood_gases.paco2_mmhg = "35to45".to_string();
    data.arterial_blood_gases.ph_level = "7.35to7.45".to_string();
    data.arterial_blood_gases.sao2_percent = "93to95".to_string();
    data.arterial_blood_gases.bicarbonate_level = "normal".to_string();
    data.arterial_blood_gases.supplemental_oxygen = "no".to_string();
    data.arterial_blood_gases.oxygen_flow_rate = "notApplicable".to_string();
    data.arterial_blood_gases.abg_interpretation = Some(3);

    // Sleep & Breathing — moderate (3s)
    data.sleep_breathing.snoring_severity = Some(3);
    data.sleep_breathing.apnea_witnessed = "no".to_string();
    data.sleep_breathing.daytime_sleepiness = Some(3);
    data.sleep_breathing.sleep_study_done = "no".to_string();
    data.sleep_breathing.ahi_score = "notAvailable".to_string();
    data.sleep_breathing.cpap_compliance = "notApplicable".to_string();
    data.sleep_breathing.sleep_quality = Some(3);
    data.sleep_breathing.morning_headaches = "no".to_string();

    // Current Treatment — moderate (3s)
    data.current_treatment.inhaler_use = "combination".to_string();
    data.current_treatment.inhaler_technique = Some(3);
    data.current_treatment.oral_medications = "none".to_string();
    data.current_treatment.oxygen_therapy = "no".to_string();
    data.current_treatment.pulmonary_rehab = "no".to_string();
    data.current_treatment.treatment_adherence = Some(3);
    data.current_treatment.side_effects_reported = "no".to_string();
    data.current_treatment.treatment_effectiveness = Some(3);

    // Clinical Review — moderate (3s)
    data.clinical_review.overall_severity_impression = Some(3);
    data.clinical_review.exacerbation_frequency = "one".to_string();
    data.clinical_review.exercise_tolerance = Some(3);
    data.clinical_review.quality_of_life_impact = Some(3);
    data.clinical_review.follow_up_urgency = Some(3);
    data.clinical_review.specialist_referral_needed = "no".to_string();
    data.clinical_review.additional_tests_needed = "none".to_string();
    data.clinical_review.clinical_notes = "Stable COPD, continue current therapy.".to_string();

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
fn returns_moderate_for_all_threes() {
    let data = create_moderate_assessment();
    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderate");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn returns_normal_for_all_ones() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 1 (minimal severity)
    data.respiratory_history.previous_hospitalizations = Some(1);
    data.symptom_assessment.dyspnea_severity = Some(1);
    data.symptom_assessment.cough_severity = Some(1);
    data.symptom_assessment.sputum_production = Some(1);
    data.symptom_assessment.wheezing_frequency = Some(1);
    data.symptom_assessment.chest_tightness = Some(1);
    data.symptom_assessment.nocturnal_symptoms = Some(1);
    data.pulmonary_function_tests.fev1_percent_predicted = Some(1);
    data.pulmonary_function_tests.fvc_percent_predicted = Some(1);
    data.pulmonary_function_tests.fev1_fvc_ratio = Some(1);
    data.pulmonary_function_tests.dlco_percent_predicted = Some(1);
    data.pulmonary_function_tests.peak_flow_variability = Some(1);
    data.chest_imaging.imaging_urgency = Some(1);
    data.arterial_blood_gases.abg_interpretation = Some(1);
    data.sleep_breathing.snoring_severity = Some(1);
    data.sleep_breathing.daytime_sleepiness = Some(1);
    data.sleep_breathing.sleep_quality = Some(1);
    data.current_treatment.inhaler_technique = Some(1);
    data.current_treatment.treatment_adherence = Some(1);
    data.current_treatment.treatment_effectiveness = Some(1);
    data.clinical_review.overall_severity_impression = Some(1);
    data.clinical_review.exercise_tolerance = Some(1);
    data.clinical_review.quality_of_life_impact = Some(1);
    data.clinical_review.follow_up_urgency = Some(1);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "normal");
    assert_eq!(score, 0.0);
}

#[test]
fn returns_critical_for_all_fives() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 5 (maximum severity)
    data.respiratory_history.previous_hospitalizations = Some(5);
    data.symptom_assessment.dyspnea_severity = Some(5);
    data.symptom_assessment.cough_severity = Some(5);
    data.symptom_assessment.sputum_production = Some(5);
    data.symptom_assessment.wheezing_frequency = Some(5);
    data.symptom_assessment.chest_tightness = Some(5);
    data.symptom_assessment.nocturnal_symptoms = Some(5);
    data.pulmonary_function_tests.fev1_percent_predicted = Some(5);
    data.pulmonary_function_tests.fvc_percent_predicted = Some(5);
    data.pulmonary_function_tests.fev1_fvc_ratio = Some(5);
    data.pulmonary_function_tests.dlco_percent_predicted = Some(5);
    data.pulmonary_function_tests.peak_flow_variability = Some(5);
    data.chest_imaging.imaging_urgency = Some(5);
    data.arterial_blood_gases.abg_interpretation = Some(5);
    data.sleep_breathing.snoring_severity = Some(5);
    data.sleep_breathing.daytime_sleepiness = Some(5);
    data.sleep_breathing.sleep_quality = Some(5);
    data.current_treatment.inhaler_technique = Some(5);
    data.current_treatment.treatment_adherence = Some(5);
    data.current_treatment.treatment_effectiveness = Some(5);
    data.clinical_review.overall_severity_impression = Some(5);
    data.clinical_review.exercise_tolerance = Some(5);
    data.clinical_review.quality_of_life_impact = Some(5);
    data.clinical_review.follow_up_urgency = Some(5);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "critical");
    assert_eq!(score, 100.0);
}

#[test]
fn fires_hemoptysis_rule() {
    let mut data = create_moderate_assessment();
    data.symptom_assessment.hemoptysis_present = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PULM-002"));
}

#[test]
fn fires_severe_fev1_rule() {
    let mut data = create_moderate_assessment();
    data.pulmonary_function_tests.fev1_percent_predicted = Some(1);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PULM-003"));
}

#[test]
fn fires_active_smoker_rule() {
    let mut data = create_moderate_assessment();
    data.smoking_exposure.smoking_status = "current".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PULM-008"));
}

#[test]
fn fires_normal_fev1_positive_rule() {
    let mut data = create_moderate_assessment();
    data.pulmonary_function_tests.fev1_percent_predicted = Some(5);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PULM-016"));
}

#[test]
fn fires_well_controlled_symptoms_rule() {
    let mut data = create_moderate_assessment();
    // Set all symptom items to 1
    data.symptom_assessment.dyspnea_severity = Some(1);
    data.symptom_assessment.cough_severity = Some(1);
    data.symptom_assessment.sputum_production = Some(1);
    data.symptom_assessment.wheezing_frequency = Some(1);
    data.symptom_assessment.chest_tightness = Some(1);
    data.symptom_assessment.nocturnal_symptoms = Some(1);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PULM-020"));
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
