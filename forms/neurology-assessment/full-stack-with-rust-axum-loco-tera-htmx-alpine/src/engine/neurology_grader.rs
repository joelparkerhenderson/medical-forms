use super::neurology_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SeverityLevel};
use super::utils::calculate_severity_score;

/// Pure function: evaluates all neurology rules against assessment data.
/// Returns the severity level, severity score (0-100), and fired rules.
/// If insufficient data is provided, returns "draft" status.
pub fn calculate_severity(data: &AssessmentData) -> (SeverityLevel, f64, Vec<FiredRule>) {
    // Check if enough data has been entered to grade
    let has_motor = data.motor_assessment.upper_limb_power_right.is_some()
        || data.motor_assessment.upper_limb_power_left.is_some()
        || data.motor_assessment.lower_limb_power_right.is_some()
        || data.motor_assessment.lower_limb_power_left.is_some();
    let has_cognitive = data.cognitive_screening.orientation.is_some()
        || data.cognitive_screening.mmse_score.is_some()
        || data.cognitive_screening.moca_score.is_some();
    let has_consciousness = !data.cognitive_screening.consciousness_level.is_empty();
    let has_cranial = data.cranial_nerve_examination.visual_fields != ""
        || data.cranial_nerve_examination.pupil_reaction != ""
        || data.cranial_nerve_examination.eye_movements != ""
        || data.cranial_nerve_examination.facial_symmetry != "";
    let has_reflexes = !data.reflexes_coordination.plantar_response.is_empty()
        || !data.reflexes_coordination.biceps_reflex.is_empty();

    let filled_sections = [has_motor, has_cognitive, has_consciousness, has_cranial, has_reflexes]
        .iter()
        .filter(|&&x| x)
        .count();

    if filled_sections < 2 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate severity score
    let score = calculate_severity_score(data).unwrap_or(0.0);

    // Fire rules
    let mut fired_rules = Vec::new();
    for rule in all_rules() {
        if (rule.evaluate)(data) {
            fired_rules.push(FiredRule {
                id: rule.id.to_string(),
                category: rule.category.to_string(),
                description: rule.description.to_string(),
                concern_level: rule.concern_level.to_string(),
            });
        }
    }

    // Determine severity level from score and high-concern rules
    let high_count = fired_rules.iter().filter(|r| r.concern_level == "high").count();

    let level = if high_count >= 2 || score >= 70.0 {
        "severe"
    } else if high_count == 1 || score >= 40.0 {
        "moderate"
    } else if score >= 15.0 {
        "mild"
    } else {
        "normal"
    };

    (level.to_string(), score, fired_rules)
}
