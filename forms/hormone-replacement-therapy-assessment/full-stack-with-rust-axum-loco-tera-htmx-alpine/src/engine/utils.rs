use super::types::AssessmentData;

/// Returns a human-readable label for a risk level.
pub fn risk_level_label(level: &str) -> &str {
    match level {
        "contraindicated" => "Contraindicated",
        "highRisk" => "High Risk",
        "moderateRisk" => "Moderate Risk",
        "lowRisk" => "Low Risk",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all 1-5 scored items from the assessment data.
/// These are the symptom severity scores and clinical ratings.
pub fn collect_scored_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Menopausal Symptoms (9 scored items)
        data.menopausal_symptoms.hot_flushes_severity,
        data.menopausal_symptoms.night_sweats_severity,
        data.menopausal_symptoms.sleep_disturbance_severity,
        data.menopausal_symptoms.mood_changes_severity,
        data.menopausal_symptoms.vaginal_dryness_severity,
        data.menopausal_symptoms.urinary_symptoms_severity,
        data.menopausal_symptoms.joint_pain_severity,
        data.menopausal_symptoms.cognitive_difficulty_severity,
        data.menopausal_symptoms.symptom_impact_on_daily_life,
        // Bone Health (1 scored item)
        data.bone_health.fall_risk_assessment,
        // Clinical Review (1 scored item)
        data.clinical_review.overall_risk_assessment,
    ]
}

/// Calculate the composite risk score (0-100) from scored items and risk factors.
/// Higher score = higher risk. Returns None if no items are answered.
pub fn calculate_risk_score(data: &AssessmentData) -> Option<f64> {
    let mut risk_points: f64 = 0.0;
    let mut max_points: f64 = 0.0;

    // Symptom severity contributes to need for treatment (weight: 20%)
    let symptom_items = [
        data.menopausal_symptoms.hot_flushes_severity,
        data.menopausal_symptoms.night_sweats_severity,
        data.menopausal_symptoms.sleep_disturbance_severity,
        data.menopausal_symptoms.mood_changes_severity,
        data.menopausal_symptoms.vaginal_dryness_severity,
        data.menopausal_symptoms.urinary_symptoms_severity,
        data.menopausal_symptoms.joint_pain_severity,
        data.menopausal_symptoms.cognitive_difficulty_severity,
        data.menopausal_symptoms.symptom_impact_on_daily_life,
    ];
    let answered_symptoms: Vec<u8> = symptom_items.iter().filter_map(|x| *x).collect();
    if answered_symptoms.is_empty() {
        return None;
    }

    // Medical history risk factors (weight: 40%)
    let medical_risk_factors = [
        (&data.medical_history.history_of_vte, 10.0),
        (&data.medical_history.history_of_stroke, 10.0),
        (&data.medical_history.history_of_mi, 10.0),
        (&data.medical_history.liver_disease, 8.0),
        (&data.medical_history.undiagnosed_vaginal_bleeding, 10.0),
        (&data.medical_history.migraine_with_aura, 5.0),
    ];

    for (field, points) in &medical_risk_factors {
        max_points += points;
        if field.as_str() == "yes" {
            risk_points += points;
        }
    }

    // Cardiovascular risk factors (weight: 20%)
    let cv_risk_factors = [
        (&data.cardiovascular_risk.smoking_status, "current", 5.0),
        (&data.cardiovascular_risk.bmi_category, "obese", 4.0),
        (&data.cardiovascular_risk.blood_pressure_status, "uncontrolledHigh", 5.0),
        (&data.cardiovascular_risk.cholesterol_status, "high", 3.0),
        (&data.cardiovascular_risk.family_history_cvd, "yes", 3.0),
    ];

    for (field, trigger, points) in &cv_risk_factors {
        max_points += points;
        if field.as_str() == *trigger {
            risk_points += points;
        }
    }

    // Breast health risk factors (weight: 20%)
    let breast_risk_factors = [
        (&data.breast_health.personal_breast_cancer_history, "yes", 10.0),
        (&data.breast_health.family_breast_cancer_history, "firstDegree", 5.0),
        (&data.breast_health.brca_gene_status, "positive", 10.0),
    ];

    for (field, trigger, points) in &breast_risk_factors {
        max_points += points;
        if field.as_str() == *trigger {
            risk_points += points;
        }
    }

    if max_points == 0.0 {
        return Some(0.0);
    }

    let score = (risk_points / max_points) * 100.0;
    Some(score.round())
}

/// Calculate the symptom burden score (0-100) from symptom severity ratings.
/// Higher score = more severe symptoms.
pub fn symptom_burden_score(data: &AssessmentData) -> Option<f64> {
    let items = [
        data.menopausal_symptoms.hot_flushes_severity,
        data.menopausal_symptoms.night_sweats_severity,
        data.menopausal_symptoms.sleep_disturbance_severity,
        data.menopausal_symptoms.mood_changes_severity,
        data.menopausal_symptoms.vaginal_dryness_severity,
        data.menopausal_symptoms.urinary_symptoms_severity,
        data.menopausal_symptoms.joint_pain_severity,
        data.menopausal_symptoms.cognitive_difficulty_severity,
        data.menopausal_symptoms.symptom_impact_on_daily_life,
    ];
    dimension_score(&items)
}

/// Calculate a dimension score (0-100) for a set of 1-5 items.
pub fn dimension_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg - 1.0) / 4.0) * 100.0)
}

/// Categorise the overall recommendation based on risk level.
pub fn recommendation_category(level: &str) -> &'static str {
    match level {
        "contraindicated" => "Do not prescribe HRT - absolute contraindication identified",
        "highRisk" => "Specialist referral recommended before HRT initiation",
        "moderateRisk" => "HRT may be considered with additional monitoring",
        "lowRisk" => "Suitable candidate for HRT initiation",
        "draft" => "Assessment incomplete",
        _ => "Unknown",
    }
}
