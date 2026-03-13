use super::likelihood_rules::all_rules;
use super::types::{AssessmentData, FiredRule, LikelihoodLevel};
use super::utils::{count_asrs_answered, count_asrs_positive, calculate_asrs_score, functional_impact_score};

/// Pure function: evaluates all ADHD likelihood rules against assessment data.
/// Returns the likelihood level, ASRS score, ASRS positive count, and fired rules.
/// If fewer than 4 ASRS items are answered, returns "draft" status.
///
/// Scoring logic:
/// - ASRS Part A: 6 items scored 0-4 (never to very often)
/// - Positive items counted against WHO thresholds
/// - 4+ positive items = "likely" or "highlyLikely" (depending on functional impact)
/// - 2-3 positive items = "possible"
/// - 0-1 positive items = "unlikely"
pub fn calculate_likelihood(data: &AssessmentData) -> (LikelihoodLevel, u8, u8, Vec<FiredRule>) {
    let answered = count_asrs_answered(data);

    // Need at least 4 ASRS items answered to grade
    if answered < 4 {
        return ("draft".to_string(), 0, 0, vec![]);
    }

    let asrs_score = calculate_asrs_score(data);
    let positive_count = count_asrs_positive(data);

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

    // Determine likelihood level based on ASRS positive count and functional impact
    let fi_score = functional_impact_score(data);

    let level = if positive_count >= 4 && fi_score.is_some_and(|s| s > 75.0) {
        "highlyLikely"
    } else if positive_count >= 4 {
        "likely"
    } else if positive_count >= 2 {
        "possible"
    } else {
        "unlikely"
    };

    (level.to_string(), asrs_score, positive_count, fired_rules)
}
