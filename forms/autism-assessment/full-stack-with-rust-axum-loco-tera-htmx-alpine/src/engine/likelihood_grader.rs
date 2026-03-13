use super::likelihood_rules::all_rules;
use super::types::{AssessmentData, FiredRule, LikelihoodLevel};
use super::utils::{calculate_aq10_score, collect_clinical_items};

/// Pure function: evaluates all likelihood rules against assessment data.
/// Returns the likelihood level, AQ-10 score, and fired rules.
/// If fewer than 5 clinical items are answered and AQ-10 is incomplete,
/// returns "draft" status.
pub fn calculate_likelihood(data: &AssessmentData) -> (LikelihoodLevel, u8, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_clinical_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();
    let aq10_score = calculate_aq10_score(&data.aq10_screening);

    if answered_count < 5 && aq10_score.is_none() {
        return ("draft".to_string(), 0, vec![]);
    }

    let score = aq10_score.unwrap_or(0);

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

    // Determine likelihood level from AQ-10 score and clinical observation
    let level = if aq10_score.is_none() {
        // No AQ-10 but has clinical items -- use clinical judgment
        let high_count = fired_rules.iter().filter(|r| r.concern_level == "high").count();
        let medium_count = fired_rules.iter().filter(|r| r.concern_level == "medium").count();
        if high_count >= 2 {
            "highlyLikely"
        } else if high_count >= 1 || medium_count >= 3 {
            "likely"
        } else if medium_count >= 1 {
            "possible"
        } else {
            "unlikely"
        }
    } else if score >= 8 {
        "highlyLikely"
    } else if score >= 6 {
        "likely"
    } else if score >= 4 {
        "possible"
    } else {
        "unlikely"
    };

    (level.to_string(), score, fired_rules)
}
