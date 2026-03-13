use super::diabetes_rules::all_rules;
use super::types::{AssessmentData, ControlLevel, FiredRule};
use super::utils::{calculate_composite_score, collect_scored_items};

/// Pure function: evaluates all diabetes rules against assessment data.
/// Returns the control level, composite score (0-100), and fired rules.
/// If fewer than 3 scored items are answered, returns "draft" status.
pub fn calculate_control(data: &AssessmentData) -> (ControlLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_scored_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    // Also count HbA1c as a key data point
    let has_hba1c = data.glycaemic_control.hba1c_value.is_some();

    if answered_count < 2 && !has_hba1c {
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

    // Determine control level from composite score
    let level = if score <= 20.0 {
        "veryPoor"
    } else if score <= 40.0 {
        "poor"
    } else if score < 65.0 {
        "suboptimal"
    } else {
        "wellControlled"
    };

    (level.to_string(), score, fired_rules)
}
