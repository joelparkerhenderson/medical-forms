use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "severe" => "Severe",
        "moderatelySevere" => "Moderately Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "minimal" => "Minimal",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate PHQ-9 total score (0-27) from all 9 items (each 0-3).
pub fn phq9_total(data: &AssessmentData) -> u8 {
    let items = [
        data.depression_screening.phq1_interest,
        data.depression_screening.phq2_mood,
        data.depression_screening.phq3_sleep,
        data.depression_screening.phq4_fatigue,
        data.depression_screening.phq5_appetite,
        data.depression_screening.phq6_self_esteem,
        data.depression_screening.phq7_concentration,
        data.depression_screening.phq8_psychomotor,
        data.depression_screening.phq9_self_harm,
    ];
    items.iter().filter_map(|x| *x).sum()
}

/// Calculate GAD-7 total score (0-21) from all 7 items (each 0-3).
pub fn gad7_total(data: &AssessmentData) -> u8 {
    let items = [
        data.anxiety_screening.gad1_nervous,
        data.anxiety_screening.gad2_uncontrollable,
        data.anxiety_screening.gad3_excessive_worry,
        data.anxiety_screening.gad4_trouble_relaxing,
        data.anxiety_screening.gad5_restless,
        data.anxiety_screening.gad6_irritable,
        data.anxiety_screening.gad7_afraid,
    ];
    items.iter().filter_map(|x| *x).sum()
}

/// Count how many PHQ-9 items have been answered.
pub fn phq9_answered_count(data: &AssessmentData) -> usize {
    let items = [
        data.depression_screening.phq1_interest,
        data.depression_screening.phq2_mood,
        data.depression_screening.phq3_sleep,
        data.depression_screening.phq4_fatigue,
        data.depression_screening.phq5_appetite,
        data.depression_screening.phq6_self_esteem,
        data.depression_screening.phq7_concentration,
        data.depression_screening.phq8_psychomotor,
        data.depression_screening.phq9_self_harm,
    ];
    items.iter().filter(|x| x.is_some()).count()
}

/// Count how many GAD-7 items have been answered.
pub fn gad7_answered_count(data: &AssessmentData) -> usize {
    let items = [
        data.anxiety_screening.gad1_nervous,
        data.anxiety_screening.gad2_uncontrollable,
        data.anxiety_screening.gad3_excessive_worry,
        data.anxiety_screening.gad4_trouble_relaxing,
        data.anxiety_screening.gad5_restless,
        data.anxiety_screening.gad6_irritable,
        data.anxiety_screening.gad7_afraid,
    ];
    items.iter().filter(|x| x.is_some()).count()
}

/// Calculate the composite severity score (0-100) from PHQ-9 (0-27) and GAD-7 (0-21).
/// Maps the combined score range (0-48) to a percentage scale.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let phq9_count = phq9_answered_count(data);
    let gad7_count = gad7_answered_count(data);

    // Need at least some items answered
    if phq9_count == 0 && gad7_count == 0 {
        return None;
    }

    let phq9 = phq9_total(data) as f64;
    let gad7 = gad7_total(data) as f64;

    // Maximum possible: PHQ-9 = 27, GAD-7 = 21, total = 48
    let combined = phq9 + gad7;
    let score = (combined / 48.0) * 100.0;
    Some(score.round())
}
