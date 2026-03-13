use super::types::AssessmentData;

/// Returns a human-readable label for a sleep quality level.
pub fn sleep_quality_label(level: &str) -> &str {
    match level {
        "good" => "Good",
        "fair" => "Fair",
        "poor" => "Poor",
        "veryPoor" => "Very Poor",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate PSQI global score (0-21) from the 7 component scores (each 0-3).
pub fn calculate_psqi_score(data: &AssessmentData) -> u8 {
    let components = collect_psqi_components(data);
    let answered: Vec<u8> = components.into_iter().flatten().collect();
    if answered.is_empty() {
        return 0;
    }
    answered.iter().sum()
}

/// Collect the 7 PSQI component scores.
pub fn collect_psqi_components(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.sleep_quality_psqi.subjective_quality,
        data.sleep_quality_psqi.sleep_latency,
        data.sleep_quality_psqi.sleep_duration,
        data.sleep_quality_psqi.sleep_efficiency_score,
        data.sleep_quality_psqi.sleep_disturbances,
        data.sleep_quality_psqi.sleep_medication,
        data.sleep_quality_psqi.daytime_dysfunction,
    ]
}

/// Count how many PSQI components are answered.
pub fn psqi_answered_count(data: &AssessmentData) -> usize {
    collect_psqi_components(data)
        .iter()
        .filter(|x| x.is_some())
        .count()
}

/// Calculate ESS total score (0-24) from the 8 situation scores (each 0-3).
pub fn calculate_ess_score(data: &AssessmentData) -> u8 {
    let items = collect_ess_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return 0;
    }
    answered.iter().sum()
}

/// Collect the 8 ESS items.
pub fn collect_ess_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.daytime_sleepiness.ess_sitting,
        data.daytime_sleepiness.ess_watching,
        data.daytime_sleepiness.ess_sitting_inactive,
        data.daytime_sleepiness.ess_passenger,
        data.daytime_sleepiness.ess_lying_down,
        data.daytime_sleepiness.ess_talking,
        data.daytime_sleepiness.ess_after_lunch,
        data.daytime_sleepiness.ess_traffic,
    ]
}

/// Calculate STOP-BANG score (0-8) from yes/no answers.
pub fn calculate_stop_bang_score(data: &AssessmentData) -> u8 {
    // If a manual score is provided, use it
    if let Some(score) = data.sleep_apnoea_screening.stop_bang_score {
        return score;
    }
    let yes_answers = [
        &data.sleep_apnoea_screening.loud_snoring,
        &data.sleep_apnoea_screening.witnessed_apnoeas,
        &data.sleep_apnoea_screening.tiredness,
        &data.sleep_apnoea_screening.treated_hypertension,
        &data.sleep_apnoea_screening.bmi_over35,
        &data.sleep_apnoea_screening.age_over50,
        &data.sleep_apnoea_screening.neck_circumference_over40,
        &data.sleep_apnoea_screening.male,
    ];
    yes_answers
        .iter()
        .filter(|a| a.as_str() == "yes")
        .count() as u8
}

/// ESS category from total score.
pub fn ess_category(score: u8) -> &'static str {
    match score {
        0..=6 => "normal",
        7..=10 => "mild",
        11..=15 => "moderate",
        16..=24 => "severe",
        _ => "unknown",
    }
}

/// STOP-BANG risk category.
pub fn stop_bang_category(score: u8) -> &'static str {
    match score {
        0..=2 => "low",
        3..=4 => "intermediate",
        5..=8 => "high",
        _ => "unknown",
    }
}
