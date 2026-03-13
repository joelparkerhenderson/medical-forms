use super::risk_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskLevel};
use super::utils::{calculate_heart_age, estimate_ten_year_risk, is_likely_draft};

/// Pure function: evaluates all risk rules against assessment data.
/// Returns (risk_category, ten_year_risk_percent, heart_age, fired_rules).
/// If the assessment is likely a draft, returns "draft" status.
pub fn calculate_risk(
    data: &AssessmentData,
) -> (RiskLevel, f64, Option<u8>, Vec<FiredRule>) {
    // Draft detection
    if is_likely_draft(data) {
        return ("draft".to_string(), 0.0, None, vec![]);
    }

    // Calculate 10-year risk
    let ten_year_risk = estimate_ten_year_risk(data);

    // Calculate heart age
    let heart_age = calculate_heart_age(data, ten_year_risk);

    // Fire rules
    let mut fired_rules = Vec::new();
    for rule in all_rules() {
        if (rule.evaluate)(data, ten_year_risk, heart_age) {
            fired_rules.push(FiredRule {
                id: rule.id.to_string(),
                category: rule.category.to_string(),
                description: rule.description.to_string(),
                risk_level: rule.risk_level.to_string(),
            });
        }
    }

    // Determine risk category from 10-year risk percentage
    let category = if ten_year_risk >= 20.0 {
        "high"
    } else if ten_year_risk >= 10.0 {
        "moderate"
    } else {
        "low"
    };

    (category.to_string(), ten_year_risk, heart_age, fired_rules)
}
