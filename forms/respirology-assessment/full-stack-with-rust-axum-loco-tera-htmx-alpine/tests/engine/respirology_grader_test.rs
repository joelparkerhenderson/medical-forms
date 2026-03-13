use respirology_assessment_tera_crate::engine::respirology_grader::calculate_respiratory_level;
use respirology_assessment_tera_crate::engine::respirology_rules::all_rules;
use respirology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_mild_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.date_of_birth = "1980-05-15".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.patient_age = "35to49".to_string();
    data.patient_information.smoking_status = "former".to_string();
    data.patient_information.pack_years = "10to20".to_string();
    data.patient_information.occupational_exposure = "none".to_string();
    data.patient_information.referral_source = "gp".to_string();

    // Respiratory Symptoms — all 2s (mild)
    data.respiratory_symptoms.dyspnoea_severity = Some(2);
    data.respiratory_symptoms.wheeze_frequency = Some(2);
    data.respiratory_symptoms.chest_tightness = Some(2);
    data.respiratory_symptoms.exercise_tolerance = Some(2);
    data.respiratory_symptoms.nocturnal_symptoms = Some(2);
    data.respiratory_symptoms.symptom_duration = "1to3Months".to_string();

    // Cough Assessment — all 2s
    data.cough_assessment.cough_severity = Some(2);
    data.cough_assessment.cough_frequency = Some(2);
    data.cough_assessment.sputum_production = Some(2);
    data.cough_assessment.haemoptysis = Some(1);
    data.cough_assessment.cough_duration = "subacute".to_string();
    data.cough_assessment.cough_character = "productive".to_string();

    // Dyspnoea Assessment — all 2s
    data.dyspnoea_assessment.mrc_dyspnoea_scale = Some(2);
    data.dyspnoea_assessment.dyspnoea_at_rest = Some(2);
    data.dyspnoea_assessment.dyspnoea_on_exertion = Some(2);
    data.dyspnoea_assessment.orthopnoea = Some(2);
    data.dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea = Some(2);
    data.dyspnoea_assessment.dyspnoea_trend = "stable".to_string();

    // Chest Examination — all 2s
    data.chest_examination.breath_sounds = Some(2);
    data.chest_examination.chest_expansion = Some(2);
    data.chest_examination.percussion_note = Some(2);
    data.chest_examination.vocal_resonance = Some(2);
    data.chest_examination.accessory_muscle_use = Some(2);
    data.chest_examination.chest_deformity = "none".to_string();

    // Spirometry Results — all 2s
    data.spirometry_results.fev1_percent_predicted = Some(2);
    data.spirometry_results.fvc_percent_predicted = Some(2);
    data.spirometry_results.fev1_fvc_ratio = Some(2);
    data.spirometry_results.peak_flow_percent_predicted = Some(2);
    data.spirometry_results.bronchodilator_response = Some(2);
    data.spirometry_results.spirometry_quality = "good".to_string();

    // Oxygen Assessment — all 2s
    data.oxygen_assessment.resting_spo2 = Some(2);
    data.oxygen_assessment.exertional_spo2 = Some(2);
    data.oxygen_assessment.oxygen_requirement = Some(2);
    data.oxygen_assessment.arterial_blood_gas = Some(2);
    data.oxygen_assessment.supplemental_oxygen_use = "no".to_string();
    data.oxygen_assessment.oxygen_delivery_method = "none".to_string();

    // Respiratory Infections — all 2s
    data.respiratory_infections.exacerbation_frequency = Some(2);
    data.respiratory_infections.antibiotic_courses = Some(2);
    data.respiratory_infections.hospitalisation_frequency = Some(2);
    data.respiratory_infections.vaccination_status = Some(2);
    data.respiratory_infections.last_exacerbation = "3to6Months".to_string();
    data.respiratory_infections.sputum_culture = "normalFlora".to_string();

    // Inhaler & Medications — all 2s
    data.inhaler_medications.inhaler_technique = Some(2);
    data.inhaler_medications.medication_adherence = Some(2);
    data.inhaler_medications.inhaler_device_suitability = Some(2);
    data.inhaler_medications.side_effects_severity = Some(2);
    data.inhaler_medications.current_inhalers = "Salbutamol MDI".to_string();
    data.inhaler_medications.oral_medications = "".to_string();

    // Clinical Review — all 2s
    data.clinical_review.overall_respiratory_status = Some(2);
    data.clinical_review.quality_of_life_impact = Some(2);
    data.clinical_review.treatment_response = Some(2);
    data.clinical_review.follow_up_urgency = Some(2);
    data.clinical_review.clinical_notes = "".to_string();
    data.clinical_review.action_plan_provided = "yes".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_respiratory_level(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_mild_impairment_for_all_twos() {
    let data = create_mild_assessment();
    let (level, score, _fired_rules) = calculate_respiratory_level(&data);
    assert_eq!(level, "mildImpairment");
    assert_eq!(score, 24.0); // 39 items at 2 + 1 item (haemoptysis) at 1 => avg 1.975 => round((0.975/4)*100) = 24
}

#[test]
fn returns_normal_for_all_ones() {
    let mut data = create_mild_assessment();
    // Set all Likert items to 1
    data.respiratory_symptoms.dyspnoea_severity = Some(1);
    data.respiratory_symptoms.wheeze_frequency = Some(1);
    data.respiratory_symptoms.chest_tightness = Some(1);
    data.respiratory_symptoms.exercise_tolerance = Some(1);
    data.respiratory_symptoms.nocturnal_symptoms = Some(1);
    data.cough_assessment.cough_severity = Some(1);
    data.cough_assessment.cough_frequency = Some(1);
    data.cough_assessment.sputum_production = Some(1);
    data.cough_assessment.haemoptysis = Some(1);
    data.dyspnoea_assessment.mrc_dyspnoea_scale = Some(1);
    data.dyspnoea_assessment.dyspnoea_at_rest = Some(1);
    data.dyspnoea_assessment.dyspnoea_on_exertion = Some(1);
    data.dyspnoea_assessment.orthopnoea = Some(1);
    data.dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea = Some(1);
    data.chest_examination.breath_sounds = Some(1);
    data.chest_examination.chest_expansion = Some(1);
    data.chest_examination.percussion_note = Some(1);
    data.chest_examination.vocal_resonance = Some(1);
    data.chest_examination.accessory_muscle_use = Some(1);
    data.spirometry_results.fev1_percent_predicted = Some(1);
    data.spirometry_results.fvc_percent_predicted = Some(1);
    data.spirometry_results.fev1_fvc_ratio = Some(1);
    data.spirometry_results.peak_flow_percent_predicted = Some(1);
    data.spirometry_results.bronchodilator_response = Some(1);
    data.oxygen_assessment.resting_spo2 = Some(1);
    data.oxygen_assessment.exertional_spo2 = Some(1);
    data.oxygen_assessment.oxygen_requirement = Some(1);
    data.oxygen_assessment.arterial_blood_gas = Some(1);
    data.respiratory_infections.exacerbation_frequency = Some(1);
    data.respiratory_infections.antibiotic_courses = Some(1);
    data.respiratory_infections.hospitalisation_frequency = Some(1);
    data.respiratory_infections.vaccination_status = Some(1);
    data.inhaler_medications.inhaler_technique = Some(1);
    data.inhaler_medications.medication_adherence = Some(1);
    data.inhaler_medications.inhaler_device_suitability = Some(1);
    data.inhaler_medications.side_effects_severity = Some(1);
    data.clinical_review.overall_respiratory_status = Some(1);
    data.clinical_review.quality_of_life_impact = Some(1);
    data.clinical_review.treatment_response = Some(1);
    data.clinical_review.follow_up_urgency = Some(1);

    let (level, score, _fired_rules) = calculate_respiratory_level(&data);
    assert_eq!(level, "normal");
    assert_eq!(score, 0.0);
}

#[test]
fn returns_respiratory_failure_for_all_fives() {
    let mut data = create_mild_assessment();
    // Set all Likert items to 5
    data.respiratory_symptoms.dyspnoea_severity = Some(5);
    data.respiratory_symptoms.wheeze_frequency = Some(5);
    data.respiratory_symptoms.chest_tightness = Some(5);
    data.respiratory_symptoms.exercise_tolerance = Some(5);
    data.respiratory_symptoms.nocturnal_symptoms = Some(5);
    data.cough_assessment.cough_severity = Some(5);
    data.cough_assessment.cough_frequency = Some(5);
    data.cough_assessment.sputum_production = Some(5);
    data.cough_assessment.haemoptysis = Some(5);
    data.dyspnoea_assessment.mrc_dyspnoea_scale = Some(5);
    data.dyspnoea_assessment.dyspnoea_at_rest = Some(5);
    data.dyspnoea_assessment.dyspnoea_on_exertion = Some(5);
    data.dyspnoea_assessment.orthopnoea = Some(5);
    data.dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea = Some(5);
    data.chest_examination.breath_sounds = Some(5);
    data.chest_examination.chest_expansion = Some(5);
    data.chest_examination.percussion_note = Some(5);
    data.chest_examination.vocal_resonance = Some(5);
    data.chest_examination.accessory_muscle_use = Some(5);
    data.spirometry_results.fev1_percent_predicted = Some(5);
    data.spirometry_results.fvc_percent_predicted = Some(5);
    data.spirometry_results.fev1_fvc_ratio = Some(5);
    data.spirometry_results.peak_flow_percent_predicted = Some(5);
    data.spirometry_results.bronchodilator_response = Some(5);
    data.oxygen_assessment.resting_spo2 = Some(5);
    data.oxygen_assessment.exertional_spo2 = Some(5);
    data.oxygen_assessment.oxygen_requirement = Some(5);
    data.oxygen_assessment.arterial_blood_gas = Some(5);
    data.respiratory_infections.exacerbation_frequency = Some(5);
    data.respiratory_infections.antibiotic_courses = Some(5);
    data.respiratory_infections.hospitalisation_frequency = Some(5);
    data.respiratory_infections.vaccination_status = Some(5);
    data.inhaler_medications.inhaler_technique = Some(5);
    data.inhaler_medications.medication_adherence = Some(5);
    data.inhaler_medications.inhaler_device_suitability = Some(5);
    data.inhaler_medications.side_effects_severity = Some(5);
    data.clinical_review.overall_respiratory_status = Some(5);
    data.clinical_review.quality_of_life_impact = Some(5);
    data.clinical_review.treatment_response = Some(5);
    data.clinical_review.follow_up_urgency = Some(5);

    let (level, score, fired_rules) = calculate_respiratory_level(&data);
    assert_eq!(level, "respiratoryFailure");
    assert_eq!(score, 100.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_moderate_impairment_for_all_threes() {
    let mut data = create_mild_assessment();
    // Set all Likert items to 3
    data.respiratory_symptoms.dyspnoea_severity = Some(3);
    data.respiratory_symptoms.wheeze_frequency = Some(3);
    data.respiratory_symptoms.chest_tightness = Some(3);
    data.respiratory_symptoms.exercise_tolerance = Some(3);
    data.respiratory_symptoms.nocturnal_symptoms = Some(3);
    data.cough_assessment.cough_severity = Some(3);
    data.cough_assessment.cough_frequency = Some(3);
    data.cough_assessment.sputum_production = Some(3);
    data.cough_assessment.haemoptysis = Some(3);
    data.dyspnoea_assessment.mrc_dyspnoea_scale = Some(3);
    data.dyspnoea_assessment.dyspnoea_at_rest = Some(3);
    data.dyspnoea_assessment.dyspnoea_on_exertion = Some(3);
    data.dyspnoea_assessment.orthopnoea = Some(3);
    data.dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea = Some(3);
    data.chest_examination.breath_sounds = Some(3);
    data.chest_examination.chest_expansion = Some(3);
    data.chest_examination.percussion_note = Some(3);
    data.chest_examination.vocal_resonance = Some(3);
    data.chest_examination.accessory_muscle_use = Some(3);
    data.spirometry_results.fev1_percent_predicted = Some(3);
    data.spirometry_results.fvc_percent_predicted = Some(3);
    data.spirometry_results.fev1_fvc_ratio = Some(3);
    data.spirometry_results.peak_flow_percent_predicted = Some(3);
    data.spirometry_results.bronchodilator_response = Some(3);
    data.oxygen_assessment.resting_spo2 = Some(3);
    data.oxygen_assessment.exertional_spo2 = Some(3);
    data.oxygen_assessment.oxygen_requirement = Some(3);
    data.oxygen_assessment.arterial_blood_gas = Some(3);
    data.respiratory_infections.exacerbation_frequency = Some(3);
    data.respiratory_infections.antibiotic_courses = Some(3);
    data.respiratory_infections.hospitalisation_frequency = Some(3);
    data.respiratory_infections.vaccination_status = Some(3);
    data.inhaler_medications.inhaler_technique = Some(3);
    data.inhaler_medications.medication_adherence = Some(3);
    data.inhaler_medications.inhaler_device_suitability = Some(3);
    data.inhaler_medications.side_effects_severity = Some(3);
    data.clinical_review.overall_respiratory_status = Some(3);
    data.clinical_review.quality_of_life_impact = Some(3);
    data.clinical_review.treatment_response = Some(3);
    data.clinical_review.follow_up_urgency = Some(3);

    let (level, score, _fired_rules) = calculate_respiratory_level(&data);
    assert_eq!(level, "moderateImpairment");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn fires_haemoptysis_rule() {
    let mut data = create_mild_assessment();
    data.cough_assessment.haemoptysis = Some(5);

    let (_level, _score, fired_rules) = calculate_respiratory_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RESP-004"));
}

#[test]
fn fires_critical_spo2_rule() {
    let mut data = create_mild_assessment();
    data.oxygen_assessment.resting_spo2 = Some(5);

    let (_level, _score, fired_rules) = calculate_respiratory_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RESP-001"));
}

#[test]
fn fires_normal_spirometry_rule_for_all_ones() {
    let mut data = create_mild_assessment();
    data.spirometry_results.fev1_percent_predicted = Some(1);
    data.spirometry_results.fvc_percent_predicted = Some(1);
    data.spirometry_results.fev1_fvc_ratio = Some(1);
    data.spirometry_results.peak_flow_percent_predicted = Some(1);
    data.spirometry_results.bronchodilator_response = Some(1);

    let (_level, _score, fired_rules) = calculate_respiratory_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RESP-016"));
}

#[test]
fn fires_good_inhaler_and_adherence_rule() {
    let mut data = create_mild_assessment();
    data.inhaler_medications.inhaler_technique = Some(1);
    data.inhaler_medications.medication_adherence = Some(1);

    let (_level, _score, fired_rules) = calculate_respiratory_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RESP-019"));
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
