use respirology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use respirology_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "John Smith".to_string();
    data.patient_information.date_of_birth = "1975-03-20".to_string();
    data.patient_information.smoking_status = "never".to_string();
    data.patient_information.pack_years = "never".to_string();

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
    data.oxygen_assessment.supplemental_oxygen_use = "no".to_string();

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
    data.clinical_review.action_plan_provided = "yes".to_string();

    data
}

#[test]
fn no_flags_for_normal_patient() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_haemoptysis() {
    let mut data = create_normal_assessment();
    data.cough_assessment.haemoptysis = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COUGH-001"));
}

#[test]
fn flags_critical_resting_spo2() {
    let mut data = create_normal_assessment();
    data.oxygen_assessment.resting_spo2 = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-OXY-001"));
}

#[test]
fn flags_exertional_desaturation() {
    let mut data = create_normal_assessment();
    data.oxygen_assessment.exertional_spo2 = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-OXY-002"));
}

#[test]
fn flags_dyspnoea_at_rest() {
    let mut data = create_normal_assessment();
    data.dyspnoea_assessment.dyspnoea_at_rest = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DYSP-001"));
}

#[test]
fn flags_poor_inhaler_technique() {
    let mut data = create_normal_assessment();
    data.inhaler_medications.inhaler_technique = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MED-001"));
}

#[test]
fn flags_heavy_smoking_history() {
    let mut data = create_normal_assessment();
    data.patient_information.pack_years = "moreThan40".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RISK-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.oxygen_assessment.resting_spo2 = Some(5); // high (FLAG-OXY-001)
    data.inhaler_medications.inhaler_technique = Some(5); // medium (FLAG-MED-001)
    data.respiratory_infections.vaccination_status = Some(5); // low (FLAG-INF-003)
    data.clinical_review.action_plan_provided = "no".to_string(); // low (FLAG-PLAN-001)

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
