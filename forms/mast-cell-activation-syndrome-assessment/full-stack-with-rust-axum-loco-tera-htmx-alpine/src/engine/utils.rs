use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "anaphylactic" => "Anaphylactic",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 severity-scale items from the assessment data.
pub fn collect_scored_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Symptom History (2 scored items)
        data.symptom_history.symptom_severity_overall,
        data.symptom_history.symptom_impact_daily_life,
        // Skin Manifestations (4 scored items)
        data.skin_manifestations.flushing_severity,
        data.skin_manifestations.urticaria_severity,
        data.skin_manifestations.angioedema_severity,
        data.skin_manifestations.pruritus_severity,
        // Gastrointestinal Symptoms (5 scored items)
        data.gastrointestinal_symptoms.abdominal_pain_severity,
        data.gastrointestinal_symptoms.nausea_severity,
        data.gastrointestinal_symptoms.diarrhea_severity,
        data.gastrointestinal_symptoms.bloating_severity,
        data.gastrointestinal_symptoms.gastroesophageal_reflux,
        // Cardiovascular & Neurological (7 scored items)
        data.cardiovascular_neurological.tachycardia_severity,
        data.cardiovascular_neurological.hypotension_episodes,
        data.cardiovascular_neurological.presyncope_syncope,
        data.cardiovascular_neurological.headache_severity,
        data.cardiovascular_neurological.brain_fog_severity,
        data.cardiovascular_neurological.neuropathic_pain,
        data.cardiovascular_neurological.dizziness_severity,
        // Respiratory Symptoms (5 scored items)
        data.respiratory_symptoms.wheezing_severity,
        data.respiratory_symptoms.dyspnea_severity,
        data.respiratory_symptoms.nasal_congestion_severity,
        data.respiratory_symptoms.throat_tightness_severity,
        data.respiratory_symptoms.cough_severity,
        // Trigger Identification (7 scored items)
        data.trigger_identification.heat_trigger,
        data.trigger_identification.stress_trigger,
        data.trigger_identification.exercise_trigger,
        data.trigger_identification.food_trigger,
        data.trigger_identification.medication_trigger,
        data.trigger_identification.fragrance_chemical_trigger,
        data.trigger_identification.insect_sting_trigger,
        // Current Treatment (4 scored items)
        data.current_treatment.h1_antihistamine_response,
        data.current_treatment.h2_antihistamine_response,
        data.current_treatment.mast_cell_stabilizer_response,
        data.current_treatment.leukotriene_inhibitor_response,
        data.current_treatment.treatment_adherence,
        // Clinical Review (3 scored items)
        data.clinical_review.response_to_mediator_therapy,
        data.clinical_review.quality_of_life_impact,
        data.clinical_review.clinician_severity_assessment,
    ]
}

/// Calculate the composite severity score (0-100) from all answered scored items.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_scored_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    // Convert 1-5 scale to 0-100
    let score = ((avg - 1.0) / 4.0) * 100.0;
    Some(score.round())
}

/// Calculate the dimension score (0-100) for a set of scored items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 4.0) * 100.0)
}

/// Get the skin manifestations dimension score.
pub fn skin_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.skin_manifestations.flushing_severity,
        data.skin_manifestations.urticaria_severity,
        data.skin_manifestations.angioedema_severity,
        data.skin_manifestations.pruritus_severity,
    ])
}

/// Get the GI symptoms dimension score.
pub fn gi_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.gastrointestinal_symptoms.abdominal_pain_severity,
        data.gastrointestinal_symptoms.nausea_severity,
        data.gastrointestinal_symptoms.diarrhea_severity,
        data.gastrointestinal_symptoms.bloating_severity,
        data.gastrointestinal_symptoms.gastroesophageal_reflux,
    ])
}

/// Get the cardiovascular/neurological dimension score.
pub fn cardio_neuro_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.cardiovascular_neurological.tachycardia_severity,
        data.cardiovascular_neurological.hypotension_episodes,
        data.cardiovascular_neurological.presyncope_syncope,
        data.cardiovascular_neurological.headache_severity,
        data.cardiovascular_neurological.brain_fog_severity,
        data.cardiovascular_neurological.neuropathic_pain,
        data.cardiovascular_neurological.dizziness_severity,
    ])
}

/// Get the respiratory dimension score.
pub fn respiratory_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.respiratory_symptoms.wheezing_severity,
        data.respiratory_symptoms.dyspnea_severity,
        data.respiratory_symptoms.nasal_congestion_severity,
        data.respiratory_symptoms.throat_tightness_severity,
        data.respiratory_symptoms.cough_severity,
    ])
}

/// Count number of elevated laboratory mediators.
pub fn elevated_mediator_count(data: &AssessmentData) -> u8 {
    let mut count: u8 = 0;
    if data.laboratory_studies.serum_tryptase_elevated == "yes" {
        count += 1;
    }
    if data.laboratory_studies.urine_prostaglandin_d2_elevated == "yes" {
        count += 1;
    }
    if data.laboratory_studies.urine_n_methylhistamine_elevated == "yes" {
        count += 1;
    }
    if data.laboratory_studies.plasma_histamine_elevated == "yes" {
        count += 1;
    }
    if data.laboratory_studies.serum_chromogranin_a_elevated == "yes" {
        count += 1;
    }
    if data.laboratory_studies.other_mediators_elevated == "yes" {
        count += 1;
    }
    count
}
