use mcas_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use mcas_assessment_tera_crate::engine::types::*;

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.assessment_date = "2026-03-10".to_string();

    data.symptom_history.symptom_severity_overall = Some(3);
    data.symptom_history.symptom_impact_daily_life = Some(3);

    data.skin_manifestations.flushing_severity = Some(3);
    data.skin_manifestations.urticaria_severity = Some(3);
    data.skin_manifestations.angioedema_severity = Some(3);
    data.skin_manifestations.pruritus_severity = Some(3);

    data.gastrointestinal_symptoms.abdominal_pain_severity = Some(3);
    data.gastrointestinal_symptoms.nausea_severity = Some(3);
    data.gastrointestinal_symptoms.diarrhea_severity = Some(3);
    data.gastrointestinal_symptoms.bloating_severity = Some(3);
    data.gastrointestinal_symptoms.gastroesophageal_reflux = Some(3);
    data.gastrointestinal_symptoms.malabsorption_signs = "no".to_string();

    data.cardiovascular_neurological.tachycardia_severity = Some(3);
    data.cardiovascular_neurological.hypotension_episodes = Some(3);
    data.cardiovascular_neurological.presyncope_syncope = Some(3);
    data.cardiovascular_neurological.headache_severity = Some(3);
    data.cardiovascular_neurological.brain_fog_severity = Some(3);
    data.cardiovascular_neurological.neuropathic_pain = Some(3);
    data.cardiovascular_neurological.dizziness_severity = Some(3);

    data.respiratory_symptoms.wheezing_severity = Some(3);
    data.respiratory_symptoms.dyspnea_severity = Some(3);
    data.respiratory_symptoms.nasal_congestion_severity = Some(3);
    data.respiratory_symptoms.throat_tightness_severity = Some(3);
    data.respiratory_symptoms.stridor_present = "no".to_string();
    data.respiratory_symptoms.cough_severity = Some(3);
    data.respiratory_symptoms.previous_anaphylaxis = "no".to_string();

    data.laboratory_studies.serum_tryptase_elevated = "no".to_string();
    data.laboratory_studies.urine_prostaglandin_d2_elevated = "no".to_string();
    data.laboratory_studies.urine_n_methylhistamine_elevated = "no".to_string();
    data.laboratory_studies.plasma_histamine_elevated = "no".to_string();
    data.laboratory_studies.serum_chromogranin_a_elevated = "no".to_string();
    data.laboratory_studies.other_mediators_elevated = "no".to_string();
    data.laboratory_studies.bone_marrow_biopsy_done = "no".to_string();

    data.trigger_identification.heat_trigger = Some(3);
    data.trigger_identification.stress_trigger = Some(3);
    data.trigger_identification.exercise_trigger = Some(3);
    data.trigger_identification.food_trigger = Some(3);
    data.trigger_identification.medication_trigger = Some(3);
    data.trigger_identification.fragrance_chemical_trigger = Some(3);
    data.trigger_identification.insect_sting_trigger = Some(3);

    data.current_treatment.h1_antihistamine_response = Some(3);
    data.current_treatment.h2_antihistamine_response = Some(3);
    data.current_treatment.mast_cell_stabilizer_response = Some(3);
    data.current_treatment.leukotriene_inhibitor_response = Some(3);
    data.current_treatment.epinephrine_auto_injector = "yes".to_string();
    data.current_treatment.treatment_adherence = Some(3);

    data.clinical_review.consensus_criteria_met = "partial".to_string();
    data.clinical_review.response_to_mediator_therapy = Some(3);
    data.clinical_review.quality_of_life_impact = Some(3);
    data.clinical_review.clinician_severity_assessment = Some(3);

    data
}

#[test]
fn no_flags_for_moderate_assessment() {
    let data = create_moderate_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_anaphylaxis_history() {
    let mut data = create_moderate_assessment();
    data.respiratory_symptoms.previous_anaphylaxis = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANAPH-001"));
}

#[test]
fn flags_missing_epinephrine_with_anaphylaxis() {
    let mut data = create_moderate_assessment();
    data.respiratory_symptoms.previous_anaphylaxis = "yes".to_string();
    data.current_treatment.epinephrine_auto_injector = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANAPH-002"));
}

#[test]
fn flags_stridor() {
    let mut data = create_moderate_assessment();
    data.respiratory_symptoms.stridor_present = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RESP-001"));
}

#[test]
fn flags_severe_dyspnea() {
    let mut data = create_moderate_assessment();
    data.respiratory_symptoms.dyspnea_severity = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RESP-002"));
}

#[test]
fn flags_syncope() {
    let mut data = create_moderate_assessment();
    data.cardiovascular_neurological.presyncope_syncope = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CARDIO-001"));
}

#[test]
fn flags_elevated_tryptase() {
    let mut data = create_moderate_assessment();
    data.laboratory_studies.serum_tryptase_elevated = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LAB-001"));
}

#[test]
fn flags_malabsorption() {
    let mut data = create_moderate_assessment();
    data.gastrointestinal_symptoms.malabsorption_signs = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GI-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_moderate_assessment();
    // Create flags of different priorities
    data.respiratory_symptoms.previous_anaphylaxis = "yes".to_string(); // high
    data.laboratory_studies.serum_tryptase_elevated = "yes".to_string(); // medium
    data.laboratory_studies.bone_marrow_biopsy_done = "yes".to_string(); // low

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
