use super::types::AssessmentData;

/// Returns a human-readable label for a risk level.
pub fn risk_level_label(level: &str) -> &str {
    match level {
        "urgent" => "Urgent",
        "highRisk" => "High Risk",
        "moderateRisk" => "Moderate Risk",
        "lowRisk" => "Low Risk",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all scored risk indicators from the assessment data.
/// Each indicator contributes a risk weight (0 = no concern, 1 = concern present).
pub fn collect_risk_indicators(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Obstetric History risk factors
        bool_to_risk(&data.obstetric_history.previous_caesarean),
        bool_to_risk(&data.obstetric_history.previous_preterm_birth),
        bool_to_risk(&data.obstetric_history.previous_stillbirth),
        bool_to_risk(&data.obstetric_history.previous_preeclampsia),
        bool_to_risk(&data.obstetric_history.recurrent_miscarriage),
        // Current Pregnancy risk factors
        bool_to_risk(&data.current_pregnancy.vaginal_bleeding),
        bool_to_risk(&data.current_pregnancy.severe_nausea),
        pregnancy_type_risk(&data.current_pregnancy.pregnancy_type),
        // Physical Examination risk factors
        blood_pressure_risk(data.physical_examination.blood_pressure_systolic, data.physical_examination.blood_pressure_diastolic),
        bmi_risk(data.physical_examination.bmi),
        proteinuria_risk(&data.physical_examination.proteinuria),
        // Antenatal Screening risk factors
        screening_risk(&data.antenatal_screening.combined_screening_result),
        screening_risk(&data.antenatal_screening.anomaly_scan_result),
        screening_risk(&data.antenatal_screening.nipt_result),
        // Blood Tests risk factors
        haemoglobin_risk(data.blood_tests.haemoglobin),
        // Ultrasound Findings risk factors
        screening_risk(&data.ultrasound_findings.fetal_growth_centile),
        screening_risk(&data.ultrasound_findings.structural_abnormalities),
        // Mental Health risk factors
        phq2_risk(data.mental_health_wellbeing.phq2_score),
        gad2_risk(data.mental_health_wellbeing.gad2_score),
        bool_to_risk(&data.mental_health_wellbeing.substance_use),
        // Clinical Review
        clinical_risk_assessment(data.clinical_review.overall_risk_assessment),
    ]
}

/// Calculate the composite risk score (0-100) from risk indicators.
/// Higher score = higher risk. Returns None if no indicators are evaluable.
pub fn calculate_risk_score(data: &AssessmentData) -> Option<f64> {
    let items = collect_risk_indicators(data);
    let answered: Vec<u8> = items.into_iter().flatten().collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let score = (sum / answered.len() as f64) * 100.0;
    Some(score.round())
}

/// Convert a yes/no string to a risk indicator.
fn bool_to_risk(value: &str) -> Option<u8> {
    match value {
        "yes" => Some(1),
        "no" => Some(0),
        _ => None,
    }
}

/// Multiple pregnancy is a risk factor.
fn pregnancy_type_risk(value: &str) -> Option<u8> {
    match value {
        "singleton" => Some(0),
        "twins" | "triplets" | "higherOrder" => Some(1),
        _ => None,
    }
}

/// Blood pressure risk: systolic >= 140 or diastolic >= 90 is concerning.
fn blood_pressure_risk(systolic: Option<u16>, diastolic: Option<u16>) -> Option<u8> {
    match (systolic, diastolic) {
        (Some(s), Some(d)) => {
            if s >= 140 || d >= 90 {
                Some(1)
            } else {
                Some(0)
            }
        }
        _ => None,
    }
}

/// BMI risk: < 18.5 or >= 35 is concerning.
fn bmi_risk(bmi: Option<f64>) -> Option<u8> {
    match bmi {
        Some(b) if b < 18.5 || b >= 35.0 => Some(1),
        Some(_) => Some(0),
        None => None,
    }
}

/// Proteinuria risk.
fn proteinuria_risk(value: &str) -> Option<u8> {
    match value {
        "negative" | "trace" => Some(0),
        "1plus" | "2plus" | "3plus" => Some(1),
        _ => None,
    }
}

/// Screening result risk: abnormal/high-risk is concerning.
pub fn screening_risk(value: &str) -> Option<u8> {
    match value {
        "normal" | "lowRisk" | "negative" | "none" => Some(0),
        "abnormal" | "highRisk" | "positive" | "detected" | "belowTenth" | "aboveNinetieth" => Some(1),
        _ => None,
    }
}

/// Haemoglobin risk: < 105 g/L is anaemia in pregnancy.
fn haemoglobin_risk(hb: Option<f64>) -> Option<u8> {
    match hb {
        Some(h) if h < 105.0 => Some(1),
        Some(_) => Some(0),
        None => None,
    }
}

/// PHQ-2 risk: score >= 3 is positive screening.
fn phq2_risk(score: Option<u8>) -> Option<u8> {
    match score {
        Some(s) if s >= 3 => Some(1),
        Some(_) => Some(0),
        None => None,
    }
}

/// GAD-2 risk: score >= 3 is positive screening.
fn gad2_risk(score: Option<u8>) -> Option<u8> {
    match score {
        Some(s) if s >= 3 => Some(1),
        Some(_) => Some(0),
        None => None,
    }
}

/// Clinical overall risk assessment (1-5 scale): 4-5 is high risk.
fn clinical_risk_assessment(score: Option<u8>) -> Option<u8> {
    match score {
        Some(4..=5) => Some(1),
        Some(_) => Some(0),
        None => None,
    }
}

/// Get the obstetric history risk dimension score.
pub fn obstetric_risk_score(data: &AssessmentData) -> Option<f64> {
    let items = [
        bool_to_risk(&data.obstetric_history.previous_caesarean),
        bool_to_risk(&data.obstetric_history.previous_preterm_birth),
        bool_to_risk(&data.obstetric_history.previous_stillbirth),
        bool_to_risk(&data.obstetric_history.previous_preeclampsia),
        bool_to_risk(&data.obstetric_history.recurrent_miscarriage),
    ];
    dimension_risk_score(&items)
}

/// Get the mental health risk dimension score.
pub fn mental_health_risk_score(data: &AssessmentData) -> Option<f64> {
    let items = [
        phq2_risk(data.mental_health_wellbeing.phq2_score),
        gad2_risk(data.mental_health_wellbeing.gad2_score),
        bool_to_risk(&data.mental_health_wellbeing.substance_use),
    ];
    dimension_risk_score(&items)
}

/// Calculate a dimension risk score (0-100) from a set of indicators.
pub fn dimension_risk_score(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    Some((sum / answered.len() as f64) * 100.0)
}
