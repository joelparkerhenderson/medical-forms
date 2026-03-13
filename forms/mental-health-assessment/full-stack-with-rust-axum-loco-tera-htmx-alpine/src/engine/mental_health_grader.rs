use super::mental_health_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SeverityLevel};
use super::utils::{calculate_composite_score, phq9_answered_count, gad7_answered_count, phq9_total, gad7_total};

/// Pure function: evaluates all mental health rules against assessment data.
/// Returns the severity level, composite score (0-100), and fired rules.
/// If fewer than 5 items are answered across PHQ-9 and GAD-7, returns "draft" status.
pub fn calculate_severity(data: &AssessmentData) -> (SeverityLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let answered_count = phq9_answered_count(data) + gad7_answered_count(data);

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

    // Determine severity level from PHQ-9 and GAD-7 composite score
    // PHQ-9 max = 27, GAD-7 max = 21, combined max = 48
    // Using the composite percentage score:
    // 0-10%  = minimal   (combined 0-4)
    // 11-25% = mild      (combined 5-12)
    // 26-45% = moderate   (combined 13-21)
    // 46-60% = moderatelySevere (combined 22-29)
    // 61+%   = severe     (combined 30+)
    let phq9 = phq9_total(data);
    let gad7 = gad7_total(data);
    let combined = phq9 as u16 + gad7 as u16;

    let level = if combined <= 4 {
        "minimal"
    } else if combined <= 12 {
        "mild"
    } else if combined <= 21 {
        "moderate"
    } else if combined <= 29 {
        "moderatelySevere"
    } else {
        "severe"
    };

    (level.to_string(), score, fired_rules)
}
