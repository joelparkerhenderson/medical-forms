use super::risk_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskCategory};
use super::utils::is_likely_draft;

/// Pure function: evaluates all risk rules against patient data.
/// Returns risk category, and fired rules.
/// Risk category is the maximum among all fired rules.
pub fn calculate_risk(data: &AssessmentData) -> (RiskCategory, Vec<FiredRule>) {
    if is_likely_draft(data) {
        return ("draft".to_string(), vec![]);
    }

    let mut fired_rules = Vec::new();

    for rule in all_rules() {
        if (rule.evaluate)(data) {
            fired_rules.push(FiredRule {
                id: rule.id.to_string(),
                category: rule.category.to_string(),
                description: rule.description.to_string(),
                risk_level: rule.risk_level.to_string(),
            });
        }
    }

    let risk_order = |level: &str| -> u8 {
        match level {
            "low" => 1,
            "medium" => 2,
            "high" => 3,
            _ => 0,
        }
    };

    let risk_category = if fired_rules.is_empty() {
        "low".to_string()
    } else {
        let max_level = fired_rules
            .iter()
            .map(|r| r.risk_level.as_str())
            .max_by_key(|l| risk_order(l))
            .unwrap_or("low");
        // Map to SCORE2-Diabetes categories
        match max_level {
            "high" => "veryHigh".to_string(),
            "medium" => "high".to_string(),
            _ => "moderate".to_string(),
        }
    };

    (risk_category, fired_rules)
}
