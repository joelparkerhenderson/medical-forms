use pulmonology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use pulmonology_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.primary_complaint = "Annual checkup".to_string();

    data.respiratory_history.copd_history = "no".to_string();
    data.respiratory_history.lung_cancer_history = "no".to_string();
    data.respiratory_history.previous_hospitalizations = Some(1);

    data.symptom_assessment.dyspnea_severity = Some(1);
    data.symptom_assessment.cough_severity = Some(1);
    data.symptom_assessment.sputum_production = Some(1);
    data.symptom_assessment.wheezing_frequency = Some(1);
    data.symptom_assessment.chest_tightness = Some(1);
    data.symptom_assessment.hemoptysis_present = "no".to_string();
    data.symptom_assessment.nocturnal_symptoms = Some(1);

    data.smoking_exposure.smoking_status = "never".to_string();
    data.smoking_exposure.asbestos_exposure = "no".to_string();

    data.pulmonary_function_tests.fev1_percent_predicted = Some(5);
    data.pulmonary_function_tests.fvc_percent_predicted = Some(5);
    data.pulmonary_function_tests.fev1_fvc_ratio = Some(5);
    data.pulmonary_function_tests.dlco_percent_predicted = Some(5);
    data.pulmonary_function_tests.peak_flow_variability = Some(5);

    data.chest_imaging.nodule_detected = "no".to_string();
    data.chest_imaging.pleural_effusion = "no".to_string();
    data.chest_imaging.imaging_urgency = Some(1);

    data.arterial_blood_gases.supplemental_oxygen = "no".to_string();
    data.arterial_blood_gases.abg_interpretation = Some(1);

    data.sleep_breathing.snoring_severity = Some(1);
    data.sleep_breathing.apnea_witnessed = "no".to_string();
    data.sleep_breathing.daytime_sleepiness = Some(1);
    data.sleep_breathing.sleep_study_done = "yes".to_string();
    data.sleep_breathing.sleep_quality = Some(1);

    data.current_treatment.inhaler_technique = Some(5);
    data.current_treatment.treatment_adherence = Some(5);
    data.current_treatment.side_effects_reported = "no".to_string();
    data.current_treatment.treatment_effectiveness = Some(5);

    data.clinical_review.overall_severity_impression = Some(1);
    data.clinical_review.exacerbation_frequency = "none".to_string();
    data.clinical_review.exercise_tolerance = Some(1);
    data.clinical_review.quality_of_life_impact = Some(1);
    data.clinical_review.follow_up_urgency = Some(1);
    data.clinical_review.specialist_referral_needed = "no".to_string();

    data
}

#[test]
fn no_flags_for_normal_patient() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_hemoptysis() {
    let mut data = create_normal_assessment();
    data.symptom_assessment.hemoptysis_present = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SYMP-001"));
}

#[test]
fn flags_severe_dyspnea() {
    let mut data = create_normal_assessment();
    data.symptom_assessment.dyspnea_severity = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SYMP-002"));
}

#[test]
fn flags_active_smoker_with_copd() {
    let mut data = create_normal_assessment();
    data.smoking_exposure.smoking_status = "current".to_string();
    data.respiratory_history.copd_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SMOK-001"));
}

#[test]
fn flags_asbestos_exposure() {
    let mut data = create_normal_assessment();
    data.smoking_exposure.asbestos_exposure = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SMOK-002"));
}

#[test]
fn flags_pulmonary_nodule() {
    let mut data = create_normal_assessment();
    data.chest_imaging.nodule_detected = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IMG-001"));
}

#[test]
fn flags_poor_inhaler_technique() {
    let mut data = create_normal_assessment();
    data.current_treatment.inhaler_technique = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TRT-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.symptom_assessment.hemoptysis_present = "yes".to_string(); // high
    data.chest_imaging.pleural_effusion = "yes".to_string(); // medium
    data.current_treatment.inhaler_technique = Some(2); // medium
    data.clinical_review.specialist_referral_needed = "yes".to_string(); // medium

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
