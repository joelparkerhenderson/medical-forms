use super::types::AssessmentData;

/// Returns a human-readable label for an impairment level.
pub fn impairment_level_label(level: &str) -> &str {
    match level {
        "normal" => "Normal",
        "mildImpairment" => "Mild Impairment",
        "moderateImpairment" => "Moderate Impairment",
        "severeImpairment" => "Severe Impairment",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all MMSE scored items from the assessment data.
/// MMSE items are scored 0 or 1 (except serial sevens which are 0/1 each).
/// Total possible: 30 points.
pub fn collect_mmse_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Orientation to time (5 points)
        data.orientation.orientation_year,
        data.orientation.orientation_season,
        data.orientation.orientation_date,
        data.orientation.orientation_day,
        data.orientation.orientation_month,
        // Orientation to place (5 points)
        data.orientation.orientation_country,
        data.orientation.orientation_county,
        data.orientation.orientation_city,
        data.orientation.orientation_building,
        data.orientation.orientation_floor,
        // Registration (3 points)
        data.registration_attention.registration_word1,
        data.registration_attention.registration_word2,
        data.registration_attention.registration_word3,
        // Attention / serial sevens (5 points)
        data.registration_attention.serial_sevens_1,
        data.registration_attention.serial_sevens_2,
        data.registration_attention.serial_sevens_3,
        data.registration_attention.serial_sevens_4,
        data.registration_attention.serial_sevens_5,
        // Recall (3 points)
        data.recall.recall_word1,
        data.recall.recall_word2,
        data.recall.recall_word3,
        // Language (8 points: naming 2, repetition 1, three-stage command 0-3, reading 1, writing 1)
        data.language.naming_pencil,
        data.language.naming_watch,
        data.language.repetition,
        data.language.three_stage_command,
        data.language.reading_command,
        data.language.writing_sentence,
        // Visuospatial - copy pentagons (1 point for MMSE)
        data.visuospatial.copy_pentagons,
    ]
}

/// Calculate the MMSE score (0-30) from all answered items.
/// Returns None if no items are answered.
pub fn calculate_mmse_score(data: &AssessmentData) -> Option<u8> {
    let items = collect_mmse_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: u8 = answered.iter().sum();
    Some(sum)
}

/// Collect MoCA-style scored items (executive, visuospatial, additional attention).
/// Provides a supplementary score from 0-30.
pub fn collect_moca_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Visuospatial / Executive (5 points)
        data.visuospatial.clock_drawing_contour,
        data.visuospatial.clock_drawing_numbers,
        data.visuospatial.clock_drawing_hands,
        data.visuospatial.cube_copy,
        data.visuospatial.trail_making,
        // Executive Function (6 points)
        data.executive_function.verbal_fluency_score,
        data.executive_function.abstraction_1,
        data.executive_function.abstraction_2,
        data.executive_function.digit_span_forward,
        data.executive_function.digit_span_backward,
        data.executive_function.inhibition_task,
        // Orientation (reuse 6 key items - 6 points)
        data.orientation.orientation_year,
        data.orientation.orientation_month,
        data.orientation.orientation_date,
        data.orientation.orientation_day,
        data.orientation.orientation_city,
        data.orientation.orientation_country,
        // Recall (3 points)
        data.recall.recall_word1,
        data.recall.recall_word2,
        data.recall.recall_word3,
        // Language (3 points)
        data.language.repetition,
        data.language.naming_pencil,
        data.language.naming_watch,
        // Attention (5 points)
        data.registration_attention.serial_sevens_1,
        data.registration_attention.serial_sevens_2,
        data.registration_attention.serial_sevens_3,
        data.registration_attention.serial_sevens_4,
        data.registration_attention.serial_sevens_5,
        // Registration (2 points partial)
        data.registration_attention.registration_word1,
        data.registration_attention.registration_word2,
    ]
}

/// Calculate the MoCA-style score.
/// Returns None if no items are answered.
pub fn calculate_moca_score(data: &AssessmentData) -> Option<u8> {
    let items = collect_moca_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: u8 = answered.iter().sum();
    // Cap at 30
    Some(sum.min(30))
}

/// Calculate the orientation domain score (0-10).
pub fn orientation_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.orientation.orientation_year,
        data.orientation.orientation_season,
        data.orientation.orientation_date,
        data.orientation.orientation_day,
        data.orientation.orientation_month,
        data.orientation.orientation_country,
        data.orientation.orientation_county,
        data.orientation.orientation_city,
        data.orientation.orientation_building,
        data.orientation.orientation_floor,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Calculate the recall domain score (0-3).
pub fn recall_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.recall.recall_word1,
        data.recall.recall_word2,
        data.recall.recall_word3,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Calculate the attention domain score (0-5).
pub fn attention_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.registration_attention.serial_sevens_1,
        data.registration_attention.serial_sevens_2,
        data.registration_attention.serial_sevens_3,
        data.registration_attention.serial_sevens_4,
        data.registration_attention.serial_sevens_5,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Calculate functional assessment total score (0-7 scale, each item 0 or 1).
pub fn functional_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.functional_assessment.medication_management,
        data.functional_assessment.financial_management,
        data.functional_assessment.meal_preparation,
        data.functional_assessment.transport_ability,
        data.functional_assessment.housekeeping,
        data.functional_assessment.personal_hygiene,
        data.functional_assessment.safety_awareness,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Determine the severity level description based on decline rate.
pub fn decline_rate_label(rate: &str) -> &str {
    match rate {
        "rapid" => "Rapid decline (weeks to months)",
        "gradual" => "Gradual decline (months to years)",
        "stable" => "Stable / no change",
        "improving" => "Improving",
        _ => "Not specified",
    }
}
