use super::frailty_rules::all_rules;
use super::types::{AssessmentData, FiredRule, FrailtyLevel};
use super::utils::count_answered_items;

/// Pure function: evaluates all frailty rules against assessment data.
/// Returns the frailty level, Clinical Frailty Scale score (or 0), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
pub fn calculate_frailty(data: &AssessmentData) -> (FrailtyLevel, Vec<FiredRule>) {
    // Check if enough items are answered
    let answered_count = count_answered_items(data);

    if answered_count < 5 {
        return ("draft".to_string(), vec![]);
    }

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

    // Determine frailty level primarily from CFS, falling back to composite assessment
    let level = match data.clinical_review.clinical_frailty_scale {
        Some(7..=9) => "severeFrailty",
        Some(5..=6) => "moderateFrailty",
        Some(4) => "mildFrailty",
        Some(1..=3) => "fit",
        _ => {
            // If CFS not provided, use high-concern rule count as proxy
            let high_count = fired_rules
                .iter()
                .filter(|r| r.concern_level == "high")
                .count();
            let medium_count = fired_rules
                .iter()
                .filter(|r| r.concern_level == "medium")
                .count();
            if high_count >= 3 {
                "severeFrailty"
            } else if high_count >= 1 || medium_count >= 4 {
                "moderateFrailty"
            } else if medium_count >= 2 {
                "mildFrailty"
            } else {
                "fit"
            }
        }
    };

    (level.to_string(), fired_rules)
}
