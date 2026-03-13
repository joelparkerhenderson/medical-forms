use super::risk_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskLevel};
use super::utils::{estimate_ten_year_risk, estimate_thirty_year_risk, is_likely_draft};

/// Pure function: evaluates all PREVENT risk rules against assessment data.
/// Returns (risk_category, 10yr_risk_percent, 30yr_risk_percent, fired_rules).
/// If both age and sex are missing, returns "draft" status.
pub fn calculate_risk(
    data: &AssessmentData,
) -> (RiskLevel, f64, f64, Vec<FiredRule>) {
    // Draft detection
    if is_likely_draft(data) {
        return ("draft".to_string(), 0.0, 0.0, vec![]);
    }

    // Calculate risk estimates
    let ten_year = estimate_ten_year_risk(data);
    let thirty_year = estimate_thirty_year_risk(ten_year);

    // Fire rules
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

    // Determine risk category from 10-year risk
    let category = if ten_year < 5.0 {
        "low"
    } else if ten_year < 7.5 {
        "borderline"
    } else if ten_year < 20.0 {
        "intermediate"
    } else {
        "high"
    };

    (category.to_string(), ten_year, thirty_year, fired_rules)
}
