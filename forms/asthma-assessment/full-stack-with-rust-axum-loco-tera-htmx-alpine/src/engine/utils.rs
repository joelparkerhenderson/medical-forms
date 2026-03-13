use super::types::AssessmentData;

/// Returns a human-readable label for a control level.
pub fn control_level_label(level: &str) -> &str {
    match level {
        "wellControlled" => "Well Controlled",
        "partlyControlled" => "Partly Controlled",
        "uncontrolled" => "Uncontrolled",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Count how many of the 4 GINA criteria are uncontrolled (score >= 3 means >2/week).
/// GINA criteria (past 4 weeks):
/// 1. Daytime symptoms >2/week  (value >= 3)
/// 2. Night waking due to asthma (value >= 1)
/// 3. Reliever use >2/week     (value >= 3)
/// 4. Activity limitation       (value >= 1)
pub fn count_gina_criteria(data: &AssessmentData) -> u8 {
    let mut count: u8 = 0;

    // Daytime symptoms: 0=none, 1=1/week, 2=2/week, 3=3-4/week, 4=daily
    if matches!(data.symptom_assessment.daytime_symptoms, Some(3..=4)) {
        count += 1;
    }

    // Night waking: 0=none, 1=1/month, 2=1/week, 3=2-3/week, 4=most nights
    if matches!(data.symptom_assessment.night_waking, Some(1..=4)) {
        count += 1;
    }

    // Reliever use: 0=none, 1=1/week, 2=2/week, 3=3-4/week, 4=daily
    if matches!(data.symptom_assessment.reliever_use, Some(3..=4)) {
        count += 1;
    }

    // Activity limitation: 0=none, 1=mild, 2=moderate, 3=severe, 4=very severe
    if matches!(data.symptom_assessment.activity_limitation, Some(1..=4)) {
        count += 1;
    }

    count
}

/// Calculate FEV1 as a percentage of predicted.
pub fn fev1_percent_predicted(data: &AssessmentData) -> Option<f64> {
    match (data.lung_function.fev1, data.lung_function.fev1_predicted) {
        (Some(fev1), Some(predicted)) if predicted > 0.0 => {
            Some(((fev1 / predicted) * 100.0).round())
        }
        _ => None,
    }
}

/// Calculate peak flow as a percentage of best.
pub fn peak_flow_percent_best(data: &AssessmentData) -> Option<f64> {
    match (
        data.lung_function.current_peak_flow,
        data.asthma_history.best_peak_flow,
    ) {
        (Some(current), Some(best)) if best > 0.0 => {
            Some(((current / best) * 100.0).round())
        }
        _ => None,
    }
}

/// Count comorbidities that may affect asthma control.
pub fn count_comorbidities(data: &AssessmentData) -> u8 {
    let mut count: u8 = 0;
    if data.comorbidities.rhinitis == "yes" {
        count += 1;
    }
    if data.comorbidities.sinusitis == "yes" {
        count += 1;
    }
    if data.comorbidities.gerd == "yes" {
        count += 1;
    }
    if data.comorbidities.obesity == "yes" {
        count += 1;
    }
    if data.comorbidities.obstructive_sleep_apnoea == "yes" {
        count += 1;
    }
    if data.comorbidities.anxiety_depression == "yes" {
        count += 1;
    }
    count
}

/// Check if the assessment has enough data to grade (not draft).
/// We require at least one GINA symptom criterion to be answered.
pub fn has_sufficient_data(data: &AssessmentData) -> bool {
    let answered = [
        data.symptom_assessment.daytime_symptoms,
        data.symptom_assessment.night_waking,
        data.symptom_assessment.reliever_use,
        data.symptom_assessment.activity_limitation,
    ]
    .iter()
    .filter(|x| x.is_some())
    .count();
    answered >= 1
}
