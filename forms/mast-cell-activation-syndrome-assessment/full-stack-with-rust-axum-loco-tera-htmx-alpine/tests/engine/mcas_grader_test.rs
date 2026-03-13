use mcas_assessment_tera_crate::engine::mcas_grader::calculate_severity;
use mcas_assessment_tera_crate::engine::mcas_rules::all_rules;
use mcas_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.sex = "female".to_string();
    data.patient_information.assessment_date = "2026-03-10".to_string();
    data.patient_information.referring_physician = "Dr Smith".to_string();
    data.patient_information.primary_complaint = "Recurrent flushing and GI symptoms".to_string();
    data.patient_information.symptom_onset_date = "2024-01-15".to_string();
    data.patient_information.family_history_mcas = "no".to_string();

    // Symptom History — moderate
    data.symptom_history.symptom_duration_months = "1to3years".to_string();
    data.symptom_history.symptom_frequency = "weekly".to_string();
    data.symptom_history.symptom_pattern = "episodic".to_string();
    data.symptom_history.symptom_severity_overall = Some(3);
    data.symptom_history.symptom_progression = "stable".to_string();
    data.symptom_history.episode_duration = "hours".to_string();
    data.symptom_history.symptom_impact_daily_life = Some(3);
    data.symptom_history.emergency_visits_past_year = "1to2".to_string();

    // Skin Manifestations — moderate (all 3s)
    data.skin_manifestations.flushing_severity = Some(3);
    data.skin_manifestations.flushing_frequency = "weekly".to_string();
    data.skin_manifestations.urticaria_severity = Some(3);
    data.skin_manifestations.angioedema_severity = Some(3);
    data.skin_manifestations.dermatographism_present = "no".to_string();
    data.skin_manifestations.pruritus_severity = Some(3);
    data.skin_manifestations.skin_lesions_present = "no".to_string();

    // Gastrointestinal Symptoms — moderate (all 3s)
    data.gastrointestinal_symptoms.abdominal_pain_severity = Some(3);
    data.gastrointestinal_symptoms.nausea_severity = Some(3);
    data.gastrointestinal_symptoms.diarrhea_severity = Some(3);
    data.gastrointestinal_symptoms.bloating_severity = Some(3);
    data.gastrointestinal_symptoms.gastroesophageal_reflux = Some(3);
    data.gastrointestinal_symptoms.food_intolerances_count = "3to5".to_string();
    data.gastrointestinal_symptoms.malabsorption_signs = "no".to_string();

    // Cardiovascular & Neurological — moderate (all 3s)
    data.cardiovascular_neurological.tachycardia_severity = Some(3);
    data.cardiovascular_neurological.hypotension_episodes = Some(3);
    data.cardiovascular_neurological.presyncope_syncope = Some(3);
    data.cardiovascular_neurological.headache_severity = Some(3);
    data.cardiovascular_neurological.brain_fog_severity = Some(3);
    data.cardiovascular_neurological.neuropathic_pain = Some(3);
    data.cardiovascular_neurological.dizziness_severity = Some(3);

    // Respiratory Symptoms — moderate (all 3s)
    data.respiratory_symptoms.wheezing_severity = Some(3);
    data.respiratory_symptoms.dyspnea_severity = Some(3);
    data.respiratory_symptoms.nasal_congestion_severity = Some(3);
    data.respiratory_symptoms.throat_tightness_severity = Some(3);
    data.respiratory_symptoms.stridor_present = "no".to_string();
    data.respiratory_symptoms.cough_severity = Some(3);
    data.respiratory_symptoms.previous_anaphylaxis = "no".to_string();

    // Laboratory Studies
    data.laboratory_studies.serum_tryptase_elevated = "no".to_string();
    data.laboratory_studies.urine_prostaglandin_d2_elevated = "no".to_string();
    data.laboratory_studies.urine_n_methylhistamine_elevated = "no".to_string();
    data.laboratory_studies.plasma_histamine_elevated = "no".to_string();
    data.laboratory_studies.serum_chromogranin_a_elevated = "no".to_string();
    data.laboratory_studies.other_mediators_elevated = "no".to_string();
    data.laboratory_studies.bone_marrow_biopsy_done = "no".to_string();

    // Trigger Identification — moderate (all 3s)
    data.trigger_identification.heat_trigger = Some(3);
    data.trigger_identification.stress_trigger = Some(3);
    data.trigger_identification.exercise_trigger = Some(3);
    data.trigger_identification.food_trigger = Some(3);
    data.trigger_identification.medication_trigger = Some(3);
    data.trigger_identification.fragrance_chemical_trigger = Some(3);
    data.trigger_identification.insect_sting_trigger = Some(3);
    data.trigger_identification.trigger_predictability = "somewhatPredictable".to_string();

    // Current Treatment — moderate response (all 3s)
    data.current_treatment.h1_antihistamine_response = Some(3);
    data.current_treatment.h2_antihistamine_response = Some(3);
    data.current_treatment.mast_cell_stabilizer_response = Some(3);
    data.current_treatment.leukotriene_inhibitor_response = Some(3);
    data.current_treatment.epinephrine_auto_injector = "no".to_string();
    data.current_treatment.corticosteroid_use = "none".to_string();
    data.current_treatment.other_medications = "".to_string();
    data.current_treatment.treatment_adherence = Some(3);

    // Clinical Review — moderate
    data.clinical_review.consensus_criteria_met = "partial".to_string();
    data.clinical_review.organ_systems_involved_count = "3".to_string();
    data.clinical_review.response_to_mediator_therapy = Some(3);
    data.clinical_review.differential_diagnoses_excluded = "yes".to_string();
    data.clinical_review.comorbid_conditions = "".to_string();
    data.clinical_review.quality_of_life_impact = Some(3);
    data.clinical_review.clinician_severity_assessment = Some(3);
    data.clinical_review.additional_notes = "".to_string();

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
fn returns_mild_for_all_ones() {
    let mut data = create_moderate_assessment();
    // Set all scored items to 1
    data.symptom_history.symptom_severity_overall = Some(1);
    data.symptom_history.symptom_impact_daily_life = Some(1);
    data.skin_manifestations.flushing_severity = Some(1);
    data.skin_manifestations.urticaria_severity = Some(1);
    data.skin_manifestations.angioedema_severity = Some(1);
    data.skin_manifestations.pruritus_severity = Some(1);
    data.gastrointestinal_symptoms.abdominal_pain_severity = Some(1);
    data.gastrointestinal_symptoms.nausea_severity = Some(1);
    data.gastrointestinal_symptoms.diarrhea_severity = Some(1);
    data.gastrointestinal_symptoms.bloating_severity = Some(1);
    data.gastrointestinal_symptoms.gastroesophageal_reflux = Some(1);
    data.cardiovascular_neurological.tachycardia_severity = Some(1);
    data.cardiovascular_neurological.hypotension_episodes = Some(1);
    data.cardiovascular_neurological.presyncope_syncope = Some(1);
    data.cardiovascular_neurological.headache_severity = Some(1);
    data.cardiovascular_neurological.brain_fog_severity = Some(1);
    data.cardiovascular_neurological.neuropathic_pain = Some(1);
    data.cardiovascular_neurological.dizziness_severity = Some(1);
    data.respiratory_symptoms.wheezing_severity = Some(1);
    data.respiratory_symptoms.dyspnea_severity = Some(1);
    data.respiratory_symptoms.nasal_congestion_severity = Some(1);
    data.respiratory_symptoms.throat_tightness_severity = Some(1);
    data.respiratory_symptoms.cough_severity = Some(1);
    data.trigger_identification.heat_trigger = Some(1);
    data.trigger_identification.stress_trigger = Some(1);
    data.trigger_identification.exercise_trigger = Some(1);
    data.trigger_identification.food_trigger = Some(1);
    data.trigger_identification.medication_trigger = Some(1);
    data.trigger_identification.fragrance_chemical_trigger = Some(1);
    data.trigger_identification.insect_sting_trigger = Some(1);
    data.current_treatment.h1_antihistamine_response = Some(1);
    data.current_treatment.h2_antihistamine_response = Some(1);
    data.current_treatment.mast_cell_stabilizer_response = Some(1);
    data.current_treatment.leukotriene_inhibitor_response = Some(1);
    data.current_treatment.treatment_adherence = Some(1);
    data.clinical_review.response_to_mediator_therapy = Some(1);
    data.clinical_review.quality_of_life_impact = Some(1);
    data.clinical_review.clinician_severity_assessment = Some(1);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
    assert_eq!(score, 0.0); // (1-1)/4 * 100 = 0
}

#[test]
fn returns_anaphylactic_for_all_fives() {
    let mut data = create_moderate_assessment();
    // Set all scored items to 5
    data.symptom_history.symptom_severity_overall = Some(5);
    data.symptom_history.symptom_impact_daily_life = Some(5);
    data.skin_manifestations.flushing_severity = Some(5);
    data.skin_manifestations.urticaria_severity = Some(5);
    data.skin_manifestations.angioedema_severity = Some(5);
    data.skin_manifestations.pruritus_severity = Some(5);
    data.gastrointestinal_symptoms.abdominal_pain_severity = Some(5);
    data.gastrointestinal_symptoms.nausea_severity = Some(5);
    data.gastrointestinal_symptoms.diarrhea_severity = Some(5);
    data.gastrointestinal_symptoms.bloating_severity = Some(5);
    data.gastrointestinal_symptoms.gastroesophageal_reflux = Some(5);
    data.cardiovascular_neurological.tachycardia_severity = Some(5);
    data.cardiovascular_neurological.hypotension_episodes = Some(5);
    data.cardiovascular_neurological.presyncope_syncope = Some(5);
    data.cardiovascular_neurological.headache_severity = Some(5);
    data.cardiovascular_neurological.brain_fog_severity = Some(5);
    data.cardiovascular_neurological.neuropathic_pain = Some(5);
    data.cardiovascular_neurological.dizziness_severity = Some(5);
    data.respiratory_symptoms.wheezing_severity = Some(5);
    data.respiratory_symptoms.dyspnea_severity = Some(5);
    data.respiratory_symptoms.nasal_congestion_severity = Some(5);
    data.respiratory_symptoms.throat_tightness_severity = Some(5);
    data.respiratory_symptoms.cough_severity = Some(5);
    data.trigger_identification.heat_trigger = Some(5);
    data.trigger_identification.stress_trigger = Some(5);
    data.trigger_identification.exercise_trigger = Some(5);
    data.trigger_identification.food_trigger = Some(5);
    data.trigger_identification.medication_trigger = Some(5);
    data.trigger_identification.fragrance_chemical_trigger = Some(5);
    data.trigger_identification.insect_sting_trigger = Some(5);
    data.current_treatment.h1_antihistamine_response = Some(5);
    data.current_treatment.h2_antihistamine_response = Some(5);
    data.current_treatment.mast_cell_stabilizer_response = Some(5);
    data.current_treatment.leukotriene_inhibitor_response = Some(5);
    data.current_treatment.treatment_adherence = Some(5);
    data.clinical_review.response_to_mediator_therapy = Some(5);
    data.clinical_review.quality_of_life_impact = Some(5);
    data.clinical_review.clinician_severity_assessment = Some(5);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "anaphylactic");
    assert_eq!(score, 100.0); // (5-1)/4 * 100 = 100
}

#[test]
fn returns_severe_for_all_fours() {
    let mut data = create_moderate_assessment();
    // Set all scored items to 4
    data.symptom_history.symptom_severity_overall = Some(4);
    data.symptom_history.symptom_impact_daily_life = Some(4);
    data.skin_manifestations.flushing_severity = Some(4);
    data.skin_manifestations.urticaria_severity = Some(4);
    data.skin_manifestations.angioedema_severity = Some(4);
    data.skin_manifestations.pruritus_severity = Some(4);
    data.gastrointestinal_symptoms.abdominal_pain_severity = Some(4);
    data.gastrointestinal_symptoms.nausea_severity = Some(4);
    data.gastrointestinal_symptoms.diarrhea_severity = Some(4);
    data.gastrointestinal_symptoms.bloating_severity = Some(4);
    data.gastrointestinal_symptoms.gastroesophageal_reflux = Some(4);
    data.cardiovascular_neurological.tachycardia_severity = Some(4);
    data.cardiovascular_neurological.hypotension_episodes = Some(4);
    data.cardiovascular_neurological.presyncope_syncope = Some(4);
    data.cardiovascular_neurological.headache_severity = Some(4);
    data.cardiovascular_neurological.brain_fog_severity = Some(4);
    data.cardiovascular_neurological.neuropathic_pain = Some(4);
    data.cardiovascular_neurological.dizziness_severity = Some(4);
    data.respiratory_symptoms.wheezing_severity = Some(4);
    data.respiratory_symptoms.dyspnea_severity = Some(4);
    data.respiratory_symptoms.nasal_congestion_severity = Some(4);
    data.respiratory_symptoms.throat_tightness_severity = Some(4);
    data.respiratory_symptoms.cough_severity = Some(4);
    data.trigger_identification.heat_trigger = Some(4);
    data.trigger_identification.stress_trigger = Some(4);
    data.trigger_identification.exercise_trigger = Some(4);
    data.trigger_identification.food_trigger = Some(4);
    data.trigger_identification.medication_trigger = Some(4);
    data.trigger_identification.fragrance_chemical_trigger = Some(4);
    data.trigger_identification.insect_sting_trigger = Some(4);
    data.current_treatment.h1_antihistamine_response = Some(4);
    data.current_treatment.h2_antihistamine_response = Some(4);
    data.current_treatment.mast_cell_stabilizer_response = Some(4);
    data.current_treatment.leukotriene_inhibitor_response = Some(4);
    data.current_treatment.treatment_adherence = Some(4);
    data.clinical_review.response_to_mediator_therapy = Some(4);
    data.clinical_review.quality_of_life_impact = Some(4);
    data.clinical_review.clinician_severity_assessment = Some(4);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn fires_anaphylaxis_history_rule() {
    let mut data = create_moderate_assessment();
    data.respiratory_symptoms.previous_anaphylaxis = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MCAS-001"));
}

#[test]
fn fires_airway_compromise_rule() {
    let mut data = create_moderate_assessment();
    data.respiratory_symptoms.stridor_present = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MCAS-002"));
}

#[test]
fn fires_severe_syncope_rule() {
    let mut data = create_moderate_assessment();
    data.cardiovascular_neurological.presyncope_syncope = Some(5);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MCAS-003"));
}

#[test]
fn fires_multiple_elevated_mediators_rule() {
    let mut data = create_moderate_assessment();
    data.laboratory_studies.serum_tryptase_elevated = "yes".to_string();
    data.laboratory_studies.urine_prostaglandin_d2_elevated = "yes".to_string();
    data.laboratory_studies.plasma_histamine_elevated = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MCAS-004"));
}

#[test]
fn fires_consensus_criteria_met_rule() {
    let mut data = create_moderate_assessment();
    data.clinical_review.consensus_criteria_met = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MCAS-018"));
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
