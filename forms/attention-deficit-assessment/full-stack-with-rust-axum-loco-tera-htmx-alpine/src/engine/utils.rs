use super::types::AssessmentData;

/// Returns a human-readable label for a likelihood level.
pub fn likelihood_level_label(level: &str) -> &str {
    match level {
        "highlyLikely" => "Highly Likely",
        "likely" => "Likely",
        "possible" => "Possible",
        "unlikely" => "Unlikely",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// ASRS Part A thresholds: for each question, the threshold at which a
/// response is considered "positive" (clinically significant).
/// Questions 1-3: threshold >= 2 (sometimes or more)
/// Questions 4-6: threshold >= 3 (often or more)
/// Based on the WHO ASRS v1.1 scoring guide.
pub fn asrs_thresholds() -> [u8; 6] {
    [2, 2, 2, 3, 3, 3]
}

/// Collect the 6 ASRS Part A item values.
pub fn collect_asrs_items(data: &AssessmentData) -> [Option<u8>; 6] {
    [
        data.asrs_screener.asrs_q1_wrapping_up,
        data.asrs_screener.asrs_q2_difficulty_ordering,
        data.asrs_screener.asrs_q3_difficulty_remembering,
        data.asrs_screener.asrs_q4_avoids_getting_started,
        data.asrs_screener.asrs_q5_fidget_squirm,
        data.asrs_screener.asrs_q6_overly_active,
    ]
}

/// Count how many ASRS Part A items score at or above threshold.
pub fn count_asrs_positive(data: &AssessmentData) -> u8 {
    let items = collect_asrs_items(data);
    let thresholds = asrs_thresholds();
    let mut count: u8 = 0;
    for (item, threshold) in items.iter().zip(thresholds.iter()) {
        if let Some(val) = item {
            if val >= threshold {
                count += 1;
            }
        }
    }
    count
}

/// Calculate the ASRS Part A total score (sum of all 6 items, 0-24).
pub fn calculate_asrs_score(data: &AssessmentData) -> u8 {
    let items = collect_asrs_items(data);
    items.iter().filter_map(|x| *x).sum()
}

/// Count the number of answered ASRS Part A items.
pub fn count_asrs_answered(data: &AssessmentData) -> u8 {
    let items = collect_asrs_items(data);
    items.iter().filter(|x| x.is_some()).count() as u8
}

/// Collect all scoreable Likert items from symptom sections (inattention + hyperactivity).
pub fn collect_symptom_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Inattention (9 items)
        data.inattention_symptoms.difficulty_sustaining_attention,
        data.inattention_symptoms.fails_to_give_close_attention,
        data.inattention_symptoms.does_not_listen_when_spoken_to,
        data.inattention_symptoms.fails_to_follow_through,
        data.inattention_symptoms.difficulty_organizing_tasks,
        data.inattention_symptoms.avoids_sustained_mental_effort,
        data.inattention_symptoms.loses_things_necessary,
        data.inattention_symptoms.easily_distracted,
        data.inattention_symptoms.forgetful_in_daily_activities,
        // Hyperactivity-Impulsivity (9 items)
        data.hyperactivity_impulsivity.fidgets_or_squirms,
        data.hyperactivity_impulsivity.leaves_seat_unexpectedly,
        data.hyperactivity_impulsivity.feels_restless,
        data.hyperactivity_impulsivity.difficulty_engaging_quietly,
        data.hyperactivity_impulsivity.on_the_go_driven_by_motor,
        data.hyperactivity_impulsivity.talks_excessively,
        data.hyperactivity_impulsivity.blurts_out_answers,
        data.hyperactivity_impulsivity.difficulty_waiting_turn,
        data.hyperactivity_impulsivity.interrupts_or_intrudes,
    ]
}

/// Calculate dimension score (0-100) for a set of 0-4 Likert items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some((avg / 4.0) * 100.0)
}

/// Get inattention dimension score (0-100).
pub fn inattention_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.inattention_symptoms.difficulty_sustaining_attention,
        data.inattention_symptoms.fails_to_give_close_attention,
        data.inattention_symptoms.does_not_listen_when_spoken_to,
        data.inattention_symptoms.fails_to_follow_through,
        data.inattention_symptoms.difficulty_organizing_tasks,
        data.inattention_symptoms.avoids_sustained_mental_effort,
        data.inattention_symptoms.loses_things_necessary,
        data.inattention_symptoms.easily_distracted,
        data.inattention_symptoms.forgetful_in_daily_activities,
    ])
}

/// Get hyperactivity-impulsivity dimension score (0-100).
pub fn hyperactivity_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.hyperactivity_impulsivity.fidgets_or_squirms,
        data.hyperactivity_impulsivity.leaves_seat_unexpectedly,
        data.hyperactivity_impulsivity.feels_restless,
        data.hyperactivity_impulsivity.difficulty_engaging_quietly,
        data.hyperactivity_impulsivity.on_the_go_driven_by_motor,
        data.hyperactivity_impulsivity.talks_excessively,
        data.hyperactivity_impulsivity.blurts_out_answers,
        data.hyperactivity_impulsivity.difficulty_waiting_turn,
        data.hyperactivity_impulsivity.interrupts_or_intrudes,
    ])
}

/// Get functional impact dimension score (0-100).
pub fn functional_impact_score(data: &AssessmentData) -> Option<f64> {
    dimension_score(&[
        data.functional_impact.work_performance_impact,
        data.functional_impact.academic_impact,
        data.functional_impact.relationship_impact,
        data.functional_impact.social_functioning_impact,
        data.functional_impact.financial_management_impact,
        data.functional_impact.driving_safety_concern,
        data.functional_impact.daily_task_management,
        data.functional_impact.self_esteem_impact,
    ])
}

/// Treatment status label from current management data.
pub fn treatment_status(data: &AssessmentData) -> &str {
    match data.current_management.currently_on_medication.as_str() {
        "yes" => "On Medication",
        "no" => "No Medication",
        "previously" => "Previously Treated",
        _ => "Unknown",
    }
}
