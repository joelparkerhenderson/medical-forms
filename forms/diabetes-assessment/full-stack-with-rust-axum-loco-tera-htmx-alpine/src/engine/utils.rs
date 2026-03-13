use super::types::AssessmentData;

/// Returns a human-readable label for a control level.
pub fn control_level_label(level: &str) -> &str {
    match level {
        "wellControlled" => "Well Controlled",
        "suboptimal" => "Suboptimal",
        "poor" => "Poor",
        "veryPoor" => "Very Poor",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all scored items from the assessment data.
/// Returns a vector of Option<f64> values that contribute to the control score.
/// Items are: HbA1c deviation from target, complication burden, self-care scores,
/// medication adherence, psychological scores.
pub fn collect_scored_items(data: &AssessmentData) -> Vec<Option<f64>> {
    vec![
        // Medication adherence (1-5)
        data.medications.medication_adherence.map(|v| v as f64),
        // Diet adherence (1-5)
        data.self_care_lifestyle.diet_adherence.map(|v| v as f64),
        // Diabetes distress (1-5, inverted: lower is better)
        data.psychological_wellbeing.diabetes_distress.map(|v| v as f64),
        // Coping ability (1-5)
        data.psychological_wellbeing.coping_ability.map(|v| v as f64),
        // Fear of hypoglycaemia (1-5, inverted: lower is better)
        data.psychological_wellbeing.fear_of_hypoglycaemia.map(|v| v as f64),
        // Depression screening (0-10 scale, inverted: lower is better)
        data.psychological_wellbeing.depression_screening.map(|v| v as f64),
        // Anxiety screening (0-10 scale, inverted: lower is better)
        data.psychological_wellbeing.anxiety_screening.map(|v| v as f64),
        // Time in range (0-100%)
        data.glycaemic_control.time_in_range.map(|v| v as f64),
    ]
}

/// Calculate the composite control score (0-100) based on multiple factors.
/// Uses HbA1c as the primary driver, with modifiers from complications,
/// self-care adherence, and psychological wellbeing.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let mut score = 50.0_f64; // Start at midpoint
    let mut factors = 0;

    // HbA1c-based score (primary factor, 40% weight)
    if let Some(hba1c) = data.glycaemic_control.hba1c_value {
        let hba1c_mmol = if data.glycaemic_control.hba1c_unit == "percent" {
            // Convert % to mmol/mol: (% - 2.15) * 10.929
            (hba1c - 2.15) * 10.929
        } else {
            hba1c
        };

        // Score based on HbA1c mmol/mol:
        // <=48 (6.5%) = 100, 48-53 = 80, 53-64 = 60, 64-75 = 40, 75-86 = 20, >86 = 0
        let hba1c_score = if hba1c_mmol <= 48.0 {
            100.0
        } else if hba1c_mmol <= 53.0 {
            80.0
        } else if hba1c_mmol <= 64.0 {
            60.0
        } else if hba1c_mmol <= 75.0 {
            40.0
        } else if hba1c_mmol <= 86.0 {
            20.0
        } else {
            0.0
        };

        score = hba1c_score;
        factors += 4; // Weight of 4
    }

    // Medication adherence modifier (1-5 scale)
    if let Some(adherence) = data.medications.medication_adherence {
        let adherence_score = ((adherence as f64 - 1.0) / 4.0) * 100.0;
        score = (score * factors as f64 + adherence_score) / (factors + 1) as f64;
        factors += 1;
    }

    // Self-care / diet adherence modifier (1-5 scale)
    if let Some(diet) = data.self_care_lifestyle.diet_adherence {
        let diet_score = ((diet as f64 - 1.0) / 4.0) * 100.0;
        score = (score * factors as f64 + diet_score) / (factors + 1) as f64;
        factors += 1;
    }

    // Time in range modifier (0-100%)
    if let Some(tir) = data.glycaemic_control.time_in_range {
        let tir_score = tir as f64;
        score = (score * factors as f64 + tir_score) / (factors + 1) as f64;
        factors += 1;
    }

    // Complication penalty
    let complication_count = count_complications(data);
    if complication_count > 0 {
        let penalty = (complication_count as f64 * 5.0).min(30.0);
        score = (score - penalty).max(0.0);
    }

    if factors == 0 {
        return None;
    }

    Some(score.round())
}

/// Count the number of active complications.
pub fn count_complications(data: &AssessmentData) -> usize {
    let mut count = 0;
    if !data.complications_screening.retinopathy_status.is_empty()
        && data.complications_screening.retinopathy_status != "none"
    {
        count += 1;
    }
    if data.complications_screening.neuropathy_symptoms == "yes" {
        count += 1;
    }
    if let Some(egfr) = data.complications_screening.egfr {
        if egfr < 60.0 {
            count += 1;
        }
    }
    if data.foot_assessment.ulcer_present == "yes" {
        count += 1;
    }
    if data.cardiovascular_risk.previous_cvd_event == "yes" {
        count += 1;
    }
    if data.foot_assessment.previous_amputation == "yes" {
        count += 1;
    }
    count
}

/// Get the HbA1c value normalised to mmol/mol.
pub fn hba1c_mmol_mol(data: &AssessmentData) -> Option<f64> {
    data.glycaemic_control.hba1c_value.map(|v| {
        if data.glycaemic_control.hba1c_unit == "percent" {
            (v - 2.15) * 10.929
        } else {
            v
        }
    })
}
