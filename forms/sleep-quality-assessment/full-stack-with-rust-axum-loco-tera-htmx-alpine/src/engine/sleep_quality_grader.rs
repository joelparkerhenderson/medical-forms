use super::sleep_quality_rules::all_rules;
use super::types::{AssessmentData, FiredRule, SleepQuality};
use super::utils::{calculate_psqi_score, psqi_answered_count, calculate_ess_score, calculate_stop_bang_score};

/// Pure function: evaluates all sleep quality rules against assessment data.
/// Returns the sleep quality level, PSQI score, ESS score, STOP-BANG score, and fired rules.
/// If fewer than 3 PSQI components are answered, returns "draft" status.
pub fn calculate_sleep_quality(data: &AssessmentData) -> (SleepQuality, u8, u8, u8, Vec<FiredRule>) {
    // Check if enough PSQI components are answered
    let answered = psqi_answered_count(data);

    if answered < 3 {
        return ("draft".to_string(), 0, 0, 0, vec![]);
    }

    // Calculate scores
    let psqi_score = calculate_psqi_score(data);
    let ess_score = calculate_ess_score(data);
    let stop_bang_score = calculate_stop_bang_score(data);

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

    // Determine sleep quality level from PSQI global score (0-21)
    let level = if psqi_score <= 5 {
        "good"
    } else if psqi_score <= 10 {
        "fair"
    } else if psqi_score <= 15 {
        "poor"
    } else {
        "veryPoor"
    };

    (level.to_string(), psqi_score, ess_score, stop_bang_score, fired_rules)
}
