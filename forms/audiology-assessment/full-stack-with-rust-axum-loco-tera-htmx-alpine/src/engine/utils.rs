use super::types::AssessmentData;

/// Returns a human-readable label for a hearing level.
pub fn hearing_level_label(level: &str) -> &str {
    match level {
        "normal" => "Normal",
        "mild" => "Mild",
        "moderate" => "Moderate",
        "moderatelySevere" => "Moderately Severe",
        "severe" => "Severe",
        "profound" => "Profound",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate the pure-tone average (PTA) for one ear from air conduction
/// thresholds at 500, 1000, 2000, and 4000 Hz (4-frequency average).
/// Returns None if fewer than 3 frequencies are available.
pub fn calculate_pta(
    ac_500: Option<u8>,
    ac_1000: Option<u8>,
    ac_2000: Option<u8>,
    ac_4000: Option<u8>,
) -> Option<f64> {
    let values: Vec<f64> = [ac_500, ac_1000, ac_2000, ac_4000]
        .iter()
        .filter_map(|v| v.map(|x| x as f64))
        .collect();
    if values.len() < 3 {
        return None;
    }
    let sum: f64 = values.iter().sum();
    Some((sum / values.len() as f64 * 10.0).round() / 10.0)
}

/// Calculate the better-ear PTA (lower of left and right).
/// Returns None if neither ear has enough data.
pub fn better_ear_pta(data: &AssessmentData) -> Option<f64> {
    let right = calculate_pta(
        data.audiometric_results.right_ac_500,
        data.audiometric_results.right_ac_1000,
        data.audiometric_results.right_ac_2000,
        data.audiometric_results.right_ac_4000,
    );
    let left = calculate_pta(
        data.audiometric_results.left_ac_500,
        data.audiometric_results.left_ac_1000,
        data.audiometric_results.left_ac_2000,
        data.audiometric_results.left_ac_4000,
    );
    match (right, left) {
        (Some(r), Some(l)) => Some(r.min(l)),
        (Some(r), None) => Some(r),
        (None, Some(l)) => Some(l),
        (None, None) => None,
    }
}

/// Calculate the worse-ear PTA (higher of left and right).
pub fn worse_ear_pta(data: &AssessmentData) -> Option<f64> {
    let right = calculate_pta(
        data.audiometric_results.right_ac_500,
        data.audiometric_results.right_ac_1000,
        data.audiometric_results.right_ac_2000,
        data.audiometric_results.right_ac_4000,
    );
    let left = calculate_pta(
        data.audiometric_results.left_ac_500,
        data.audiometric_results.left_ac_1000,
        data.audiometric_results.left_ac_2000,
        data.audiometric_results.left_ac_4000,
    );
    match (right, left) {
        (Some(r), Some(l)) => Some(r.max(l)),
        (Some(r), None) => Some(r),
        (None, Some(l)) => Some(l),
        (None, None) => None,
    }
}

/// Calculate the asymmetry between left and right PTA (absolute difference).
pub fn pta_asymmetry(data: &AssessmentData) -> Option<f64> {
    let right = calculate_pta(
        data.audiometric_results.right_ac_500,
        data.audiometric_results.right_ac_1000,
        data.audiometric_results.right_ac_2000,
        data.audiometric_results.right_ac_4000,
    );
    let left = calculate_pta(
        data.audiometric_results.left_ac_500,
        data.audiometric_results.left_ac_1000,
        data.audiometric_results.left_ac_2000,
        data.audiometric_results.left_ac_4000,
    );
    match (right, left) {
        (Some(r), Some(l)) => Some((r - l).abs()),
        _ => None,
    }
}

/// Check if the hearing loss is conductive by comparing air and bone
/// conduction at matching frequencies. Returns true if there is a
/// significant air-bone gap (>10 dB) on average.
pub fn has_air_bone_gap(
    ac_500: Option<u8>,
    ac_1000: Option<u8>,
    ac_2000: Option<u8>,
    ac_4000: Option<u8>,
    bc_500: Option<u8>,
    bc_1000: Option<u8>,
    bc_2000: Option<u8>,
    bc_4000: Option<u8>,
) -> bool {
    let mut gaps = Vec::new();
    if let (Some(a), Some(b)) = (ac_500, bc_500) {
        gaps.push(a as f64 - b as f64);
    }
    if let (Some(a), Some(b)) = (ac_1000, bc_1000) {
        gaps.push(a as f64 - b as f64);
    }
    if let (Some(a), Some(b)) = (ac_2000, bc_2000) {
        gaps.push(a as f64 - b as f64);
    }
    if let (Some(a), Some(b)) = (ac_4000, bc_4000) {
        gaps.push(a as f64 - b as f64);
    }
    if gaps.is_empty() {
        return false;
    }
    let avg_gap: f64 = gaps.iter().sum::<f64>() / gaps.len() as f64;
    avg_gap > 10.0
}

/// Collect all hearing difficulty Likert items (1-5) from symptoms assessment.
pub fn collect_symptom_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.symptoms_assessment.hearing_difficulty_quiet,
        data.symptoms_assessment.hearing_difficulty_noise,
        data.symptoms_assessment.hearing_difficulty_phone,
        data.symptoms_assessment.hearing_difficulty_group,
        data.symptoms_assessment.hearing_difficulty_tv,
    ]
}

/// Collect all tinnitus impact items (1-10).
pub fn collect_tinnitus_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.tinnitus.tinnitus_severity,
        data.tinnitus.tinnitus_sleep_impact,
        data.tinnitus.tinnitus_concentration_impact,
        data.tinnitus.tinnitus_emotional_impact,
        data.tinnitus.tinnitus_daily_activity_impact,
    ]
}

/// Collect all communication impact items (1-5).
pub fn collect_communication_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.communication_impact.difficulty_understanding_speech,
        data.communication_impact.social_withdrawal,
        data.communication_impact.frustration_level,
        data.communication_impact.asking_to_repeat,
        data.communication_impact.avoiding_situations,
        data.communication_impact.impact_on_work,
        data.communication_impact.impact_on_relationships,
    ]
}

/// Calculate average of communication impact items (0-100 scale from 1-5 Likert).
pub fn communication_impact_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_communication_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 4.0) * 100.0)
}

/// Calculate tinnitus impact score (0-100 scale from 1-10 items).
pub fn tinnitus_impact_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_tinnitus_items(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 9.0) * 100.0)
}

/// Determine the hearing aid status description.
pub fn hearing_aid_status(data: &AssessmentData) -> &str {
    match data.hearing_aid_assessment.current_hearing_aid.as_str() {
        "yes" => "Current user",
        "no" => match data.hearing_aid_assessment.interest_in_hearing_aid.as_str() {
            "yes" => "Candidate - interested",
            "maybe" => "Candidate - considering",
            _ => "Not using",
        },
        "previous" => "Previous user",
        _ => "Unknown",
    }
}
