use super::genetic_rules::all_rules;
use super::types::{AssessmentData, FiredRule, RiskLevel};

/// Pure function: evaluates all genetic rules against assessment data.
/// Returns the risk level, total risk score, and fired rules.
///
/// Risk levels:
///   - "draft" if patient name is empty (incomplete form)
///   - "confirmed" if a pathogenic variant is confirmed (score >= 10)
///   - "highRisk" if score >= 6
///   - "moderateRisk" if score >= 3
///   - "lowRisk" if score < 3
pub fn calculate_risk(data: &AssessmentData) -> (RiskLevel, u32, Vec<FiredRule>) {
    // Check if enough data is present
    if data.patient_information.patient_name.trim().is_empty() {
        return ("draft".to_string(), 0, vec![]);
    }

    // Fire rules and accumulate score
    let mut fired_rules = Vec::new();
    let mut score: u32 = 0;
    for rule in all_rules() {
        if (rule.evaluate)(data) {
            fired_rules.push(FiredRule {
                id: rule.id.to_string(),
                category: rule.category.to_string(),
                description: rule.description.to_string(),
                concern_level: rule.concern_level.to_string(),
            });
            score += rule.weight;
        }
    }

    // Determine risk level from score
    let level = if score >= 10 {
        "confirmed"
    } else if score >= 6 {
        "highRisk"
    } else if score >= 3 {
        "moderateRisk"
    } else {
        "lowRisk"
    };

    (level.to_string(), score, fired_rules)
}
