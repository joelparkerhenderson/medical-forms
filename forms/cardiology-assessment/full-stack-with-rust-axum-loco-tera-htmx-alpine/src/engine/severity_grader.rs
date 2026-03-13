use super::severity_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SeverityLevel};
use super::utils::{calculate_severity_score, has_sufficient_data, score_to_severity};

/// Pure function: evaluates all severity rules against assessment data.
/// Returns the severity level, severity score (0-100), and fired rules.
/// If insufficient data is present, returns "draft" status.
pub fn calculate_severity(data: &AssessmentData) -> (SeverityLevel, f64, Vec<FiredRule>) {
    // Check if enough clinical data is present
    if !has_sufficient_data(data) {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate severity score
    let score = calculate_severity_score(data);

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

    // Determine severity level: if any high-concern rule fires, bump up
    let has_high_concern = fired_rules.iter().any(|r| r.concern_level == "high");
    let has_medium_concern = fired_rules.iter().any(|r| r.concern_level == "medium");

    let level = if has_high_concern {
        // At least one high concern rule fired
        if score >= 80.0 {
            "critical"
        } else {
            "high"
        }
    } else if has_medium_concern {
        if score >= 60.0 {
            "high"
        } else {
            "moderate"
        }
    } else {
        score_to_severity(score)
    };

    (level.to_string(), score, fired_rules)
}
