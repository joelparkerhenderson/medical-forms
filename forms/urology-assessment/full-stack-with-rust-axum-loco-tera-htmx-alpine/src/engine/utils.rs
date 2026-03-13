use super::types::AssessmentData;

/// Returns a human-readable label for a severity level.
pub fn severity_level_label(level: &str) -> &str {
    match level {
        "urgent" => "Urgent",
        "severe" => "Severe",
        "moderate" => "Moderate",
        "mild" => "Mild",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate the IPSS total score (0-35) from the 7 IPSS items.
/// Each item is scored 0-5. Returns None if no items are answered.
pub fn calculate_ipss_total(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.urinary_symptoms.incomplete_emptying,
        data.urinary_symptoms.frequency,
        data.urinary_symptoms.intermittency,
        data.urinary_symptoms.urgency,
        data.urinary_symptoms.weak_stream,
        data.urinary_symptoms.straining,
        data.urinary_symptoms.nocturia,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().map(|&v| v).sum())
}

/// Collect all scored clinical items from the assessment data.
/// These items contribute to the overall severity scoring.
pub fn collect_scored_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // IPSS items (7 items, scored 0-5)
        data.urinary_symptoms.incomplete_emptying,
        data.urinary_symptoms.frequency,
        data.urinary_symptoms.intermittency,
        data.urinary_symptoms.urgency,
        data.urinary_symptoms.weak_stream,
        data.urinary_symptoms.straining,
        data.urinary_symptoms.nocturia,
        // Quality of life (1 item, scored 0-6)
        data.urinary_symptoms.quality_of_life,
        // Incontinence severity (1 item, scored 1-5)
        data.lower_urinary_tract.incontinence_severity,
        // UTI frequency (1 item)
        data.lower_urinary_tract.uti_frequency_per_year,
        // Stone pain (1 item, scored 0-10)
        data.stone_disease.current_pain_level,
        // ED severity (1 item, scored 1-5)
        data.sexual_function.ed_severity,
    ]
}

/// Calculate the composite severity score (0-100) from clinical indicators.
/// Higher score = more severe presentation.
/// This uses a weighted approach across key clinical domains.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let mut total_weight = 0.0_f64;
    let mut weighted_sum = 0.0_f64;

    // IPSS total (0-35) → normalized to 0-100, weight 30%
    if let Some(ipss) = calculate_ipss_total(data) {
        let normalized = (ipss as f64 / 35.0) * 100.0;
        weighted_sum += normalized * 0.30;
        total_weight += 0.30;
    }

    // Quality of life (0-6) → normalized to 0-100, weight 10%
    if let Some(qol) = data.urinary_symptoms.quality_of_life {
        let normalized = (qol as f64 / 6.0) * 100.0;
        weighted_sum += normalized * 0.10;
        total_weight += 0.10;
    }

    // Incontinence severity (1-5) → normalized to 0-100, weight 10%
    if let Some(inc) = data.lower_urinary_tract.incontinence_severity {
        let normalized = ((inc as f64 - 1.0) / 4.0) * 100.0;
        weighted_sum += normalized * 0.10;
        total_weight += 0.10;
    }

    // PSA level contribution, weight 15%
    if let Some(psa) = data.prostate_assessment.psa_level {
        // PSA: 0-4 normal, 4-10 elevated, >10 high, >20 very high
        let normalized = if psa <= 4.0 {
            (psa / 4.0) * 25.0
        } else if psa <= 10.0 {
            25.0 + ((psa - 4.0) / 6.0) * 25.0
        } else if psa <= 20.0 {
            50.0 + ((psa - 10.0) / 10.0) * 25.0
        } else {
            75.0 + ((psa - 20.0) / 80.0).min(1.0) * 25.0
        };
        weighted_sum += normalized * 0.15;
        total_weight += 0.15;
    }

    // Stone pain (0-10) → normalized to 0-100, weight 10%
    if let Some(pain) = data.stone_disease.current_pain_level {
        let normalized = (pain as f64 / 10.0) * 100.0;
        weighted_sum += normalized * 0.10;
        total_weight += 0.10;
    }

    // eGFR contribution (inverted: lower eGFR = higher severity), weight 15%
    if let Some(egfr) = data.renal_function.egfr {
        // eGFR >90 normal, 60-89 mild, 30-59 moderate, 15-29 severe, <15 failure
        let normalized = if egfr >= 90 {
            0.0
        } else if egfr >= 60 {
            ((90 - egfr) as f64 / 30.0) * 25.0
        } else if egfr >= 30 {
            25.0 + ((60 - egfr) as f64 / 30.0) * 25.0
        } else if egfr >= 15 {
            50.0 + ((30 - egfr) as f64 / 15.0) * 25.0
        } else {
            75.0 + ((15 - egfr) as f64 / 15.0).min(1.0) * 25.0
        };
        weighted_sum += normalized * 0.15;
        total_weight += 0.15;
    }

    // ED severity (1-5) → normalized to 0-100, weight 5%
    if let Some(ed) = data.sexual_function.ed_severity {
        let normalized = ((ed as f64 - 1.0) / 4.0) * 100.0;
        weighted_sum += normalized * 0.05;
        total_weight += 0.05;
    }

    // UTI frequency contribution, weight 5%
    if let Some(uti) = data.lower_urinary_tract.uti_frequency_per_year {
        let normalized = ((uti as f64).min(10.0) / 10.0) * 100.0;
        weighted_sum += normalized * 0.05;
        total_weight += 0.05;
    }

    if total_weight == 0.0 {
        return None;
    }

    // Scale to full 100 if not all weights are present
    let score = weighted_sum / total_weight;
    Some(score.round())
}

/// Calculate the IPSS dimension score (0-100).
pub fn ipss_score(data: &AssessmentData) -> Option<f64> {
    let total = calculate_ipss_total(data)?;
    Some((total as f64 / 35.0) * 100.0)
}

/// IPSS category from total score.
pub fn ipss_category(total: Option<u8>) -> &'static str {
    match total {
        Some(0..=7) => "mild",
        Some(8..=19) => "moderate",
        Some(20..=35) => "severe",
        _ => "unknown",
    }
}
