use super::oncology_rules::all_rules;
use super::types::{AssessmentData, FiredRule, OncologyLevel};
use super::utils::{calculate_composite_score, collect_scored_items};

/// Pure function: evaluates all oncology rules against assessment data.
/// Returns the oncology level, composite score (0-100), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
///
/// Levels (score = severity, higher = worse):
///   - draft: fewer than 5 items answered
///   - stable: score 0-20 (minimal symptoms)
///   - monitoring: score 21-40 (mild symptoms requiring monitoring)
///   - activeIssue: score 41-60 (moderate symptoms requiring active management)
///   - urgent: score 61-80 (severe symptoms requiring urgent attention)
///   - palliative: score 81-100 (critical symptom burden)
pub fn calculate_oncology(data: &AssessmentData) -> (OncologyLevel, f64, Vec<FiredRule>) {
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

    // Determine oncology level from composite score
    let level = if score <= 20.0 {
        "stable"
    } else if score <= 40.0 {
        "monitoring"
    } else if score <= 60.0 {
        "activeIssue"
    } else if score <= 80.0 {
        "urgent"
    } else {
        "palliative"
    };

    (level.to_string(), score, fired_rules)
}
