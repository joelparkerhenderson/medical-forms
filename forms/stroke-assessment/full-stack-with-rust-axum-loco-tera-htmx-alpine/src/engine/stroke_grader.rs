use super::stroke_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SeverityLevel};
use super::utils::{calculate_nihss_total, collect_nihss_items, severity_from_nihss};

/// Pure function: evaluates all stroke rules against assessment data.
/// Returns the severity level, NIHSS total score, and fired rules.
/// If fewer than 3 NIHSS items are answered, returns "draft" status.
pub fn calculate_severity(data: &AssessmentData) -> (SeverityLevel, u8, Vec<FiredRule>) {
    // Check if enough NIHSS items are answered
    let items = collect_nihss_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 3 {
        return ("draft".to_string(), 0, vec![]);
    }

    // Calculate NIHSS total
    let nihss_total = calculate_nihss_total(data).unwrap_or(0);

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

    // Determine severity level from NIHSS total
    let level = severity_from_nihss(nihss_total);

    (level.to_string(), nihss_total, fired_rules)
}
