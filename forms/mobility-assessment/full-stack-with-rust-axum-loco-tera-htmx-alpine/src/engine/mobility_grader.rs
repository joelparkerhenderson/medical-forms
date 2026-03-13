use super::mobility_rules::all_rules;
use super::types::{AssessmentData, FiredRule, MobilityLevel};
use super::utils::{calculate_composite_score, collect_likert_items};

/// Pure function: evaluates all mobility rules against assessment data.
/// Returns the mobility level, composite score (0-100), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
pub fn calculate_mobility(data: &AssessmentData) -> (MobilityLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_likert_items(data);
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

    // Determine mobility level from composite score
    let level = if score <= 20.0 {
        "dependent"
    } else if score <= 40.0 {
        "maximalAssistance"
    } else if score <= 60.0 {
        "moderateAssistance"
    } else if score <= 80.0 {
        "minimalAssistance"
    } else {
        "independent"
    };

    (level.to_string(), score, fired_rules)
}
