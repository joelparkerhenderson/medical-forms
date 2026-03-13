use super::completeness_rules::all_rules;
use super::types::{AssessmentData, CompletenessStatus, FiredRule};
use super::utils::{count_completed_sections, determine_completeness};

/// Pure function: evaluates all completeness rules against assessment data.
/// Returns the completeness status, sections completed count, and fired rules.
pub fn calculate_completeness(data: &AssessmentData) -> (CompletenessStatus, u32, Vec<FiredRule>) {
    let sections_completed = count_completed_sections(data);
    let status = determine_completeness(data);

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

    (status.to_string(), sections_completed, fired_rules)
}
