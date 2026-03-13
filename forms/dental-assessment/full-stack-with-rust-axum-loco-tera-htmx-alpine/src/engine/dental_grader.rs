use super::dental_rules::all_rules;
use super::types::{AssessmentData, FiredRule, OralHealthStatus};
use super::utils::{calculate_dmft, count_answered_fields, determine_oral_health_status};

/// Pure function: evaluates all dental rules against assessment data.
/// Returns the oral health status, DMFT score, and fired rules.
/// If fewer than 5 clinical fields are answered, returns "draft" status.
pub fn calculate_oral_health(data: &AssessmentData) -> (OralHealthStatus, Option<u8>, Vec<FiredRule>) {
    // Check if enough fields are answered
    let answered = count_answered_fields(data);

    if answered < 5 {
        return ("draft".to_string(), None, vec![]);
    }

    // Calculate DMFT
    let dmft = calculate_dmft(data);

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

    // Determine oral health status from composite assessment
    let status = determine_oral_health_status(data);

    (status, dmft, fired_rules)
}
