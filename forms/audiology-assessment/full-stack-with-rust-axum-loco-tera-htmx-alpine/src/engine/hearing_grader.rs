use super::hearing_rules::all_rules;
use super::types::{AssessmentData, FiredRule, HearingLevel};
use super::utils::better_ear_pta;

/// Pure function: evaluates all hearing rules against assessment data.
/// Returns the hearing level, pure-tone average (dB HL), and fired rules.
/// If insufficient audiometric data is available, returns "draft" status.
pub fn calculate_hearing_level(data: &AssessmentData) -> (HearingLevel, f64, Vec<FiredRule>) {
    // Calculate the better-ear PTA
    let pta = match better_ear_pta(data) {
        Some(pta) => pta,
        None => return ("draft".to_string(), 0.0, vec![]),
    };

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

    // Determine hearing level from better-ear PTA (WHO classification)
    let level = if pta <= 25.0 {
        "normal"
    } else if pta <= 40.0 {
        "mild"
    } else if pta <= 55.0 {
        "moderate"
    } else if pta <= 70.0 {
        "moderatelySevere"
    } else if pta <= 90.0 {
        "severe"
    } else {
        "profound"
    };

    (level.to_string(), pta, fired_rules)
}
