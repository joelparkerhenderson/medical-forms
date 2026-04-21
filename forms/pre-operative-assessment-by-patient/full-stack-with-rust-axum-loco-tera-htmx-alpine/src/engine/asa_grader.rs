use super::asa_rules::all_rules;
use super::types::{AsaGrade, AssessmentData, FiredRule};

/// Pure function: evaluates all ASA rules against patient data.
/// Returns the maximum grade among all fired rules (worst comorbidity),
/// defaulting to ASA I for healthy patients with no fired rules.
pub fn calculate_asa(data: &AssessmentData) -> (AsaGrade, Vec<FiredRule>) {
    let mut fired_rules = Vec::new();

    for rule in all_rules() {
        if (rule.evaluate)(data) {
            fired_rules.push(FiredRule {
                id: rule.id.to_string(),
                system: rule.system.to_string(),
                description: rule.description.to_string(),
                grade: rule.grade,
            });
        }
    }

    let asa_grade = if fired_rules.is_empty() {
        1
    } else {
        fired_rules.iter().map(|r| r.grade).max().unwrap_or(1)
    };

    (asa_grade, fired_rules)
}
