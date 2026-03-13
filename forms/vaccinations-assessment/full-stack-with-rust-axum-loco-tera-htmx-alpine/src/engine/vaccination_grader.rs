use super::vaccination_rules::all_rules;
use super::types::{AssessmentData, FiredRule, VaccinationLevel};
use super::utils::{calculate_composite_score, collect_vaccination_items};

/// Pure function: evaluates all vaccination rules against assessment data.
/// Returns the vaccination level, composite score (0-100), and fired rules.
/// If fewer than 5 items are answered, returns "draft" status.
pub fn calculate_vaccination_status(data: &AssessmentData) -> (VaccinationLevel, f64, Vec<FiredRule>) {
    // Check if enough items are answered
    let items = collect_vaccination_items(data);
    let answered_count = items.iter().filter(|x| x.is_some()).count();

    if answered_count < 5 {
        return ("draft".to_string(), 0.0, vec![]);
    }

    // Check for contraindications first
    let has_anaphylaxis = data.contraindications_allergies.previous_anaphylaxis == "yes";
    let is_pregnant = data.contraindications_allergies.pregnant == "yes";
    let is_immunocompromised = data.immunization_history.immunocompromised == "yes";

    if has_anaphylaxis && (is_pregnant || is_immunocompromised) {
        let score = calculate_composite_score(data).unwrap_or(0.0);
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
        return ("contraindicated".to_string(), score, fired_rules);
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

    // Determine vaccination level from composite score
    let level = if has_anaphylaxis {
        "contraindicated"
    } else if score >= 80.0 {
        "upToDate"
    } else if score >= 40.0 {
        "partiallyComplete"
    } else {
        "overdue"
    };

    (level.to_string(), score, fired_rules)
}
