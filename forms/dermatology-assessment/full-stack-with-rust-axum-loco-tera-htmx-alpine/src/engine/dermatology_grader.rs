use super::dermatology_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SeverityLevel};
use super::utils::{calculate_dlqi_score, dlqi_answered_count};

/// Pure function: evaluates all dermatology rules against assessment data.
/// Returns the severity level, DLQI score (0-30), and fired rules.
/// If fewer than 3 DLQI items are answered, returns "draft" status.
pub fn calculate_severity(data: &AssessmentData) -> (SeverityLevel, f64, Vec<FiredRule>) {
    // Check if enough DLQI items are answered
    let answered_count = dlqi_answered_count(data);

    if answered_count < 3 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate DLQI score
    let dlqi_score = calculate_dlqi_score(data).unwrap_or(0) as f64;

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

    // Determine severity level from DLQI score (standard DLQI banding)
    let level = if dlqi_score <= 1.0 {
        "clear"
    } else if dlqi_score <= 5.0 {
        "mild"
    } else if dlqi_score <= 10.0 {
        "moderate"
    } else if dlqi_score <= 20.0 {
        "severe"
    } else {
        "verySevere"
    };

    (level.to_string(), dlqi_score, fired_rules)
}
