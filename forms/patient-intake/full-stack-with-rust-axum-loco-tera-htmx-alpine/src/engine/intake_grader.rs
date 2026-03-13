use super::intake_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskLevel};

/// Pure function: evaluates all intake rules against patient data.
/// Returns the maximum risk level among all fired rules (worst complexity),
/// defaulting to "low" for healthy patients with no fired rules.
pub fn calculate_risk_level(data: &AssessmentData) -> (RiskLevel, Vec<FiredRule>) {
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
            "low" => 0,
            "medium" => 1,
            "high" => 2,
            _ => 0,
        }
    };

    let risk_level = if fired_rules.is_empty() {
        "low".to_string()
    } else {
        fired_rules
            .iter()
            .map(|r| r.risk_level.as_str())
            .max_by_key(|l| risk_order(l))
            .unwrap_or("low")
            .to_string()
    };

    (risk_level, fired_rules)
}
