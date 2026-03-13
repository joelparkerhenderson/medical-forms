use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "normal" => "Normal",
        "mild" => "Mild",
        "moderate" => "Moderate",
        "severe" => "Severe",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Count the number of abnormal cranial nerve findings.
pub fn abnormal_cranial_nerve_count(data: &AssessmentData) -> u32 {
    let mut count = 0;
    if data.cranial_nerve_examination.visual_fields == "abnormal" { count += 1; }
    if data.cranial_nerve_examination.pupil_reaction == "abnormal" { count += 1; }
    if data.cranial_nerve_examination.eye_movements == "abnormal" { count += 1; }
    if data.cranial_nerve_examination.facial_symmetry == "asymmetric" { count += 1; }
    count
}

/// Get the minimum motor power across all four limbs (0-5 scale).
/// Returns None if no motor power values are recorded.
pub fn minimum_motor_power(data: &AssessmentData) -> Option<u8> {
    let powers = [
        data.motor_assessment.upper_limb_power_right,
        data.motor_assessment.upper_limb_power_left,
        data.motor_assessment.lower_limb_power_right,
        data.motor_assessment.lower_limb_power_left,
    ];
    powers.iter().filter_map(|x| *x).min()
}

/// Check if any motor power is at or below a threshold.
pub fn any_motor_power_at_or_below(data: &AssessmentData, threshold: u8) -> bool {
    minimum_motor_power(data).is_some_and(|p| p <= threshold)
}

/// Calculate a composite cognitive score from orientation, attention, memory,
/// language, and executive function subscores.
/// Returns the total out of a maximum of 30.
pub fn composite_cognitive_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.cognitive_screening.orientation,    // 0-10
        data.cognitive_screening.attention,      // 0-5
        data.cognitive_screening.memory,         // 0-5
        data.cognitive_screening.language,       // 0-5
        data.cognitive_screening.executive_function, // 0-5
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Calculate a severity score (0-100) based on neurological findings.
/// Higher score = more severe findings.
pub fn calculate_severity_score(data: &AssessmentData) -> Option<f64> {
    let mut score: f64 = 0.0;
    let mut factors: u32 = 0;

    // Motor power contribution (inverted: lower power = higher severity)
    if let Some(min_power) = minimum_motor_power(data) {
        score += ((5.0 - min_power as f64) / 5.0) * 100.0;
        factors += 1;
    }

    // Cognitive score contribution (inverted: lower cognitive = higher severity)
    if let Some(cog) = composite_cognitive_score(data) {
        score += ((30.0 - cog as f64) / 30.0) * 100.0;
        factors += 1;
    }

    // Headache severity contribution
    if let Some(hs) = data.headache_assessment.headache_severity {
        score += (hs as f64 / 10.0) * 100.0;
        factors += 1;
    }

    // Cranial nerve abnormalities contribution
    let cn_count = abnormal_cranial_nerve_count(data);
    if cn_count > 0 {
        score += (cn_count as f64 / 4.0) * 100.0;
        factors += 1;
    }

    // Consciousness level contribution
    let cons_score = match data.cognitive_screening.consciousness_level.as_str() {
        "alert" => 0.0,
        "drowsy" => 33.0,
        "stuporous" => 66.0,
        "comatose" => 100.0,
        _ => 0.0,
    };
    if !data.cognitive_screening.consciousness_level.is_empty() {
        score += cons_score;
        factors += 1;
    }

    // Reflexes contribution
    let reflex_score = if data.reflexes_coordination.plantar_response == "extensor" {
        80.0
    } else if data.reflexes_coordination.biceps_reflex == "clonusPresent"
        || data.reflexes_coordination.knee_reflex == "clonusPresent"
        || data.reflexes_coordination.ankle_reflex == "clonusPresent"
    {
        60.0
    } else {
        0.0
    };
    if reflex_score > 0.0 {
        score += reflex_score;
        factors += 1;
    }

    if factors == 0 {
        return None;
    }

    Some((score / factors as f64).round())
}
