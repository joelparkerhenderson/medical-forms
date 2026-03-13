use super::ophthalmology_rules::all_rules;
use super::types::{AssessmentData, FiredRule, ImpairmentLevel};
use super::utils::{calculate_composite_score, collect_clinical_items};

/// Pure function: evaluates all ophthalmology rules against assessment data.
/// Returns the impairment level, composite score (0-100), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
pub fn calculate_impairment(data: &AssessmentData) -> (ImpairmentLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_clinical_items(data);
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

    // Determine impairment level from composite score
    // Higher score = more normal findings; lower score = more abnormalities
    let level = if score >= 80.0 {
        "normal"
    } else if score >= 60.0 {
        "mildImpairment"
    } else if score >= 40.0 {
        "moderateImpairment"
    } else if score >= 20.0 {
        "severeImpairment"
    } else {
        "blind"
    };

    (level.to_string(), score, fired_rules)
}
