use super::rheumatology_rules::all_rules;
use super::types::{AssessmentData, FiredRule, ActivityLevel};
use super::utils::{calculate_composite_score, collect_scored_items};

/// Pure function: evaluates all rheumatology rules against assessment data.
/// Returns the activity level, composite score (0-100), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
pub fn calculate_activity(data: &AssessmentData) -> (ActivityLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_scored_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 5 {
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

    // Determine activity level from composite score
    // Higher score = more disease activity
    let level = if score <= 10.0 {
        "remission"
    } else if score <= 25.0 {
        "lowActivity"
    } else if score <= 50.0 {
        "moderateActivity"
    } else if score <= 75.0 {
        "highActivity"
    } else {
        "severe"
    };

    (level.to_string(), score, fired_rules)
}
