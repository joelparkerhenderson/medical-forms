use super::release_rules::all_rules;
use super::types::{AssessmentData, CompletionLevel, FiredRule};
use super::utils::{calculate_completion_score, count_required_fields, is_consent_given, is_identity_verified};

/// Pure function: evaluates all release rules against form data.
/// Returns the completion level, completion score (0-100), and fired rules.
/// If fewer than 5 fields are filled, returns "draft" status.
pub fn calculate_completion(data: &AssessmentData) -> (CompletionLevel, f64, Vec<FiredRule>) {
    let (filled, _total) = count_required_fields(data);

    if filled < 5 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate completion score
    let score = calculate_completion_score(data);

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

    // Determine completion level
    let has_high_concern = fired_rules.iter().any(|r| r.concern_level == "high");
    let consent_given = is_consent_given(data);
    let identity_verified = is_identity_verified(data);

    let level = if has_high_concern {
        "invalid"
    } else if score >= 100.0 && consent_given && identity_verified {
        "valid"
    } else if score >= 80.0 {
        "complete"
    } else {
        "incomplete"
    };

    (level.to_string(), score, fired_rules)
}
