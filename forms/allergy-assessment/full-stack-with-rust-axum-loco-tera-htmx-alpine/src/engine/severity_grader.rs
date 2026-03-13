use super::severity_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SeverityLevel};
use super::utils::{calculate_composite_score, collect_severity_items};

/// Pure function: evaluates all severity rules against assessment data.
/// Returns the severity level, composite score (0-100), and fired rules.
/// If fewer than 3 items are answered, returns "draft" status.
pub fn calculate_severity(data: &AssessmentData) -> (SeverityLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_severity_items(data);
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

    // Determine severity level from composite score
    // Higher scores = more severe symptoms
    let level = if data.allergy_history.previous_anaphylaxis == "yes"
        && data.symptoms_reactions.cardiovascular_symptoms.is_some_and(|v| v >= 4)
    {
        "lifeThreatening"
    } else if score >= 75.0 {
        "lifeThreatening"
    } else if score >= 50.0 {
        "severe"
    } else if score >= 25.0 {
        "moderate"
    } else {
        "mild"
    };

    (level.to_string(), score, fired_rules)
}
