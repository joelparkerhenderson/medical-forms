use super::asthma_rules::all_rules;
use super::types::{AssessmentData, ControlLevel, FiredRule};
use super::utils::{count_gina_criteria, has_sufficient_data};

/// Pure function: evaluates all asthma rules against assessment data.
/// Returns the control level, GINA criteria count, and fired rules.
/// If insufficient data, returns "draft" status.
///
/// GINA control levels:
///   - Well controlled: 0 criteria met
///   - Partly controlled: 1-2 criteria met
///   - Uncontrolled: 3-4 criteria met
pub fn calculate_control(data: &AssessmentData) -> (ControlLevel, u8, Vec<FiredRule>) {
    if !has_sufficient_data(data) {
        return ("draft".to_string(), 0, vec![]);
    }

    let gina_count = count_gina_criteria(data);

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

    // Determine control level from GINA criteria count
    let level = if gina_count == 0 {
        "wellControlled"
    } else if gina_count <= 2 {
        "partlyControlled"
    } else {
        "uncontrolled"
    };

    (level.to_string(), gina_count, fired_rules)
}
