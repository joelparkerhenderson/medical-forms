use super::gi_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SeverityLevel};
use super::utils::{calculate_composite_score, collect_scored_items, count_alarm_features};

/// Pure function: evaluates all GI rules against assessment data.
/// Returns the severity level, composite score (0-100), and fired rules.
/// If fewer than 3 items are answered, returns "draft" status.
pub fn calculate_severity(data: &AssessmentData) -> (SeverityLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_scored_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 3 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate composite score
    let score = calculate_composite_score(data).unwrap_or(0.0);

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

    // Determine severity level: alarm features override score-based level
    let alarm_count = count_alarm_features(data);
    let level = if alarm_count >= 2 {
        "alarm"
    } else if alarm_count == 1 || score > 75.0 {
        "severe"
    } else if score > 50.0 {
        "moderate"
    } else if score > 25.0 {
        "mild"
    } else {
        "mild"
    };

    (level.to_string(), score, fired_rules)
}
