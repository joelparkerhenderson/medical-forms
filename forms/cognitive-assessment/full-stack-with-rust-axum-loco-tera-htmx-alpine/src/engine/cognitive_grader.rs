use super::cognitive_rules::all_rules;
use super::types::{AssessmentData, FiredRule, ImpairmentLevel};
use super::utils::{calculate_mmse_score, calculate_moca_score, collect_mmse_items};

/// Pure function: evaluates all cognitive rules against assessment data.
/// Returns the impairment level, MMSE score (0-30), MoCA score (0-30), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
pub fn calculate_cognitive_status(data: &AssessmentData) -> (ImpairmentLevel, u8, u8, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_mmse_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 5 {
        return ("draft".to_string(), 0, 0, vec![]);
    }

    // Calculate MMSE score
    let mmse = calculate_mmse_score(data).unwrap_or(0);

    // Calculate MoCA score
    let moca = calculate_moca_score(data).unwrap_or(0);

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

    // Determine impairment level from MMSE score
    let level = if mmse >= 24 {
        "normal"
    } else if mmse >= 19 {
        "mildImpairment"
    } else if mmse >= 10 {
        "moderateImpairment"
    } else {
        "severeImpairment"
    };

    (level.to_string(), mmse, moca, fired_rules)
}
