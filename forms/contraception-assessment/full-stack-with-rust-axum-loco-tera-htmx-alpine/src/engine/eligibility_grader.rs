use super::eligibility_rules::all_rules;
use super::types::{AssessmentData, EligibilityLevel, FiredRule};
use super::utils::calculate_worst_ukmec_category;

/// Pure function: evaluates all eligibility rules against assessment data.
/// Returns the eligibility level, worst UKMEC category, and fired rules.
/// If fewer than 3 fields are meaningfully completed, returns "draft" status.
pub fn calculate_eligibility(data: &AssessmentData) -> (EligibilityLevel, u8, Vec<FiredRule>) {
    // Check if enough data is provided to make an assessment
    let has_patient_info = !data.patient_information.patient_name.is_empty();
    let has_medical_history = data.medical_history.vte_history != ""
        || data.medical_history.breast_cancer_current != ""
        || data.medical_history.breast_cancer_history != "";
    let has_cv_risk = data.cardiovascular_risk.systolic_bp.is_some()
        || data.cardiovascular_risk.migraine_with_aura != "";

    if !has_patient_info && !has_medical_history && !has_cv_risk {
        return ("draft".to_string(), 0, vec![]);
    }

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

    // Determine worst UKMEC category from explicitly set categories
    let worst_ukmec = calculate_worst_ukmec_category(data).unwrap_or(1);

    // Determine eligibility level:
    // - If any high concern rule fires or UKMEC 4: absoluteContraindication
    // - If any medium concern rule fires or UKMEC 3: relativeContraindication
    // - Otherwise: noContraindication
    let has_high_concern = fired_rules.iter().any(|r| r.concern_level == "high");
    let has_medium_concern = fired_rules.iter().any(|r| r.concern_level == "medium");

    let level = if has_high_concern || worst_ukmec >= 4 {
        "absoluteContraindication"
    } else if has_medium_concern || worst_ukmec == 3 {
        "relativeContraindication"
    } else {
        "noContraindication"
    };

    (level.to_string(), worst_ukmec, fired_rules)
}
