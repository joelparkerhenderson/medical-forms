use super::prenatal_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskLevel};
use super::utils::{calculate_risk_score, collect_risk_indicators};

/// Pure function: evaluates all prenatal rules against assessment data.
/// Returns the risk level, risk score (0-100), and fired rules.
/// If fewer than 3 indicators are evaluable, returns "draft" status.
pub fn calculate_risk(data: &AssessmentData) -> (RiskLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_risk_indicators(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 3 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate risk score
    let score = calculate_risk_score(data).unwrap_or(0.0);

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

    // Determine risk level based on score and high-concern rules
    let high_count = fired_rules.iter().filter(|r| r.concern_level == "high").count();
    let medium_count = fired_rules.iter().filter(|r| r.concern_level == "medium").count();

    let level = if high_count >= 2 || score >= 60.0 {
        "urgent"
    } else if high_count >= 1 || score >= 40.0 {
        "highRisk"
    } else if medium_count >= 2 || score >= 20.0 {
        "moderateRisk"
    } else {
        "lowRisk"
    };

    (level.to_string(), score, fired_rules)
}
