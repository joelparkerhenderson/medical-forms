use super::risk_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskLevel};
use super::utils::{calculate_framingham_risk, is_likely_draft};

/// Pure function: evaluates all risk rules against assessment data.
/// Returns the risk level, 10-year risk percentage, and fired rules.
/// If age and sex are missing, returns "draft" status.
pub fn calculate_risk(data: &AssessmentData) -> (RiskLevel, f64, Vec<FiredRule>) {
    // Check if draft (age and sex missing)
    if is_likely_draft(data) {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate 10-year risk using Framingham Cox regression
    let risk_percent = calculate_framingham_risk(data);

    // Round to 1 decimal place
    let risk_percent = (risk_percent * 10.0).round() / 10.0;

    // Fire rules
    let mut fired_rules = Vec::new();
    for rule in all_rules() {
        if (rule.evaluate)(data, risk_percent) {
            fired_rules.push(FiredRule {
                id: rule.id.to_string(),
                category: rule.category.to_string(),
                description: rule.description.to_string(),
                risk_level: rule.risk_level.to_string(),
            });
        }
    }

    // Determine risk category from 10-year risk
    let level = if risk_percent < 10.0 {
        "low"
    } else if risk_percent < 20.0 {
        "intermediate"
    } else {
        "high"
    };

    (level.to_string(), risk_percent, fired_rules)
}
