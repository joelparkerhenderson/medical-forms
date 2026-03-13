use super::types::{AssessmentData, FiredRule, ValidityStatus};
use super::validity_rules::all_rules;

/// Pure function: evaluates all validity rules against ADRT data.
///
/// Determines validity status based on which rules fire:
/// - If ANY critical or required rule fires: check draft heuristic → draft or invalid
/// - If ONLY recommended rules fire: complete
/// - If NO rules fire: valid
pub fn calculate_validity(data: &AssessmentData) -> (ValidityStatus, Vec<FiredRule>) {
    let mut fired_rules = Vec::new();

    for rule in all_rules() {
        if (rule.evaluate)(data) {
            fired_rules.push(FiredRule {
                id: rule.id.to_string(),
                category: rule.category.to_string(),
                description: rule.description.to_string(),
                severity: rule.severity.to_string(),
            });
        }
    }

    let has_critical = fired_rules.iter().any(|r| r.severity == "critical");
    let has_required = fired_rules.iter().any(|r| r.severity == "required");
    let has_recommended = fired_rules.iter().any(|r| r.severity == "recommended");

    let validity_status = if has_critical || has_required {
        if is_likely_draft(data) {
            "draft".to_string()
        } else {
            "invalid".to_string()
        }
    } else if has_recommended {
        "complete".to_string()
    } else {
        "valid".to_string()
    };

    (validity_status, fired_rules)
}

/// Heuristic: if core identification fields are empty, treat as draft rather than invalid.
fn is_likely_draft(data: &AssessmentData) -> bool {
    data.personal_information.full_legal_name.trim().is_empty()
        && data.personal_information.date_of_birth.is_empty()
        && data.legal_signatures.patient_signature != "yes"
}
