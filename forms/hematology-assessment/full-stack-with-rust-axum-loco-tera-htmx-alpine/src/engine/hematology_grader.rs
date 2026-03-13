use super::hematology_rules::all_rules;
use super::types::{AbnormalityLevel, AssessmentData, FiredRule};
use super::utils::{calculate_abnormality_score, collect_numeric_items};

/// Pure function: evaluates all hematology rules against assessment data.
/// Returns the abnormality level, composite score (0-100), and fired rules.
/// If fewer than 3 numeric items are answered, returns "draft" status.
pub fn calculate_abnormality(data: &AssessmentData) -> (AbnormalityLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_numeric_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 3 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate composite abnormality score
    let score = calculate_abnormality_score(data).unwrap_or(0.0);

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

    // Determine abnormality level from composite score
    let level = if score == 0.0 {
        "normal"
    } else if score <= 20.0 {
        "mildAbnormality"
    } else if score <= 50.0 {
        "moderateAbnormality"
    } else if score <= 75.0 {
        "severeAbnormality"
    } else {
        "critical"
    };

    (level.to_string(), score, fired_rules)
}
