use super::types::AssessmentData;

/// Returns a human-readable label for an eligibility level.
pub fn eligibility_level_label(level: &str) -> &str {
    match level {
        "noContraindication" => "No Contraindication",
        "relativeContraindication" => "Relative Contraindication",
        "absoluteContraindication" => "Absolute Contraindication",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all UKMEC category values from the assessment data.
pub fn collect_ukmec_categories(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        data.ukmec_eligibility.coc_category,
        data.ukmec_eligibility.pop_category,
        data.ukmec_eligibility.patch_ring_category,
        data.ukmec_eligibility.dmpa_injectable_category,
        data.ukmec_eligibility.implant_category,
        data.ukmec_eligibility.lng_ius_category,
        data.ukmec_eligibility.cu_iud_category,
        data.ukmec_eligibility.barrier_category,
    ]
}

/// Calculate the highest UKMEC category across all methods.
/// Returns the worst-case category (highest number = most restrictive).
/// Returns None if no categories are set.
pub fn calculate_worst_ukmec_category(data: &AssessmentData) -> Option<u8> {
    let categories = collect_ukmec_categories(data);
    categories.into_iter().flatten().max()
}

/// Determine whether the patient has hypertension at or above a threshold.
pub fn has_severe_hypertension(data: &AssessmentData) -> bool {
    matches!(
        (data.cardiovascular_risk.systolic_bp, data.cardiovascular_risk.diastolic_bp),
        (Some(s), _) if s >= 160
    ) || matches!(
        (data.cardiovascular_risk.systolic_bp, data.cardiovascular_risk.diastolic_bp),
        (_, Some(d)) if d >= 100
    )
}

/// Determine whether BP is elevated but not severely.
pub fn has_elevated_bp(data: &AssessmentData) -> bool {
    let systolic_elevated = matches!(
        data.cardiovascular_risk.systolic_bp,
        Some(s) if (140..160).contains(&s)
    );
    let diastolic_elevated = matches!(
        data.cardiovascular_risk.diastolic_bp,
        Some(d) if (90..100).contains(&d)
    );
    systolic_elevated || diastolic_elevated
}

/// Calculate BMI from height and weight if both are available.
pub fn calculate_bmi(data: &AssessmentData) -> Option<f64> {
    match (data.smoking_bmi.height_cm, data.smoking_bmi.weight_kg) {
        (Some(h), Some(w)) if h > 0.0 => {
            let h_m = h / 100.0;
            Some((w / (h_m * h_m) * 10.0).round() / 10.0)
        }
        _ => data.smoking_bmi.bmi,
    }
}

/// Determine risk level label for the chosen method.
pub fn risk_level_for_category(category: Option<u8>) -> &'static str {
    match category {
        Some(1) => "low",
        Some(2) => "low",
        Some(3) => "medium",
        Some(4) => "high",
        _ => "unknown",
    }
}
