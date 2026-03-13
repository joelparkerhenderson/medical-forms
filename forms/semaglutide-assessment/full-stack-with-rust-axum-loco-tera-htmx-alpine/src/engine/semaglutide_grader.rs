use super::semaglutide_rules::all_rules;
use super::types::{AssessmentData, EligibilityLevel, FiredRule};
use super::utils::{calculate_composite_score, collect_likert_items, has_any_contraindication};

/// Pure function: evaluates all semaglutide rules against assessment data.
/// Returns the eligibility level, composite score (0-100), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
///
/// Levels:
///   - "draft" — incomplete assessment
///   - "contraindicated" — absolute contraindication present
///   - "notEligible" — score <= 30 or multiple high-concern rules
///   - "cautionRequired" — score 31-60 or medium-concern issues
///   - "eligible" — score > 60, no contraindications
pub fn calculate_eligibility(data: &AssessmentData) -> (EligibilityLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_likert_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 5 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate composite score
    let score = calculate_composite_score(data).unwrap_or(0.0);

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

    // Determine eligibility level
    let level = if has_any_contraindication(data) {
        "contraindicated"
    } else if score <= 30.0 {
        "notEligible"
    } else if score <= 60.0 {
        "cautionRequired"
    } else {
        "eligible"
    };

    (level.to_string(), score, fired_rules)
}
