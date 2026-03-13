use super::consent_rules::all_rules;
use super::types::{AssessmentData, ConsentStatus, FiredRule};
use super::utils::{calculate_completeness_score, collect_rated_items, field_filled};

/// Pure function: evaluates all consent rules against assessment data.
/// Returns the consent status, completeness score (0-100), and fired rules.
///
/// Consent statuses:
/// - "draft": fewer than 5 fields completed
/// - "incomplete": not all required fields filled
/// - "complete": all required fields filled but validity issues exist
/// - "valid": all required elements present, capacity confirmed, signed, voluntary
/// - "invalid": critical validity issues (capacity not confirmed, risks not explained, no signature, patient cannot explain procedure)
pub fn calculate_consent(data: &AssessmentData) -> (ConsentStatus, f64, Vec<FiredRule>) {
    // Check if enough items are answered for scoring
    let items = collect_rated_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    // Also check text fields
    let text_count = [
        field_filled(&data.patient_information.patient_name),
        field_filled(&data.procedure_details.procedure_name),
        field_filled(&data.signatures.patient_signature),
    ]
    .iter()
    .filter(|&&v| v)
    .count();

    if answered_count + text_count < 5 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Calculate completeness score
    let score = calculate_completeness_score(data);

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

    // Determine consent status
    let has_high_concern = fired_rules.iter().any(|r| r.concern_level == "high");
    let has_medium_concern = fired_rules.iter().any(|r| r.concern_level == "medium");

    let status = if has_high_concern {
        "invalid"
    } else if has_medium_concern {
        "incomplete"
    } else if score < 100.0 {
        "complete"
    } else {
        "valid"
    };

    (status.to_string(), score, fired_rules)
}
