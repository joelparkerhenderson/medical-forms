use super::risk_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskLevel};
use super::utils::{calculate_risk_score, collect_scored_items};

/// Pure function: evaluates all HRT risk rules against assessment data.
/// Returns the risk level, risk score (0-100), and fired rules.
/// If fewer than 5 scored items are answered, returns "draft" status.
pub fn calculate_risk(data: &AssessmentData) -> (RiskLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_scored_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 5 {
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

    // Determine risk level based on score and critical contraindications
    let has_contraindication = fired_rules.iter().any(|r| {
        r.concern_level == "high"
            && (r.id == "HRT-001" || r.id == "HRT-004" || r.id == "HRT-005")
    });

    let has_high_concern = fired_rules.iter().any(|r| r.concern_level == "high");

    let level = if has_contraindication {
        "contraindicated"
    } else if has_high_concern || score >= 60.0 {
        "highRisk"
    } else if score >= 30.0 {
        "moderateRisk"
    } else {
        "lowRisk"
    };

    (level.to_string(), score, fired_rules)
}
