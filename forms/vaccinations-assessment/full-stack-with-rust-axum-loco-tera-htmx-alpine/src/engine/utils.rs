use super::types::AssessmentData;

/// Returns a human-readable label for a vaccination level.
pub fn vaccination_level_label(level: &str) -> &str {
    match level {
        "upToDate" => "Up to Date",
        "partiallyComplete" => "Partially Complete",
        "overdue" => "Overdue",
        "contraindicated" => "Contraindicated",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Collect all completeness-indicator items from vaccination sections.
/// Each vaccine field uses: 0 = not given, 1 = partial, 2 = complete.
pub fn collect_vaccination_items(data: &AssessmentData) -> Vec<Option<u8>> {
    vec![
        // Childhood Vaccinations (7 items)
        data.childhood_vaccinations.dtap_ipv_hib_hepb,
        data.childhood_vaccinations.pneumococcal,
        data.childhood_vaccinations.rotavirus,
        data.childhood_vaccinations.meningitis_b,
        data.childhood_vaccinations.mmr,
        data.childhood_vaccinations.hib_menc,
        data.childhood_vaccinations.preschool_booster,
        // Adult Vaccinations (7 items)
        data.adult_vaccinations.td_ipv_booster,
        data.adult_vaccinations.hpv,
        data.adult_vaccinations.meningitis_acwy,
        data.adult_vaccinations.influenza_annual,
        data.adult_vaccinations.covid19,
        data.adult_vaccinations.shingles,
        data.adult_vaccinations.pneumococcal_ppv,
        // Consent quality (4 items)
        data.consent_information.information_provided,
        data.consent_information.risks_explained,
        data.consent_information.benefits_explained,
        data.consent_information.questions_answered,
        // Clinical review (1 item)
        data.clinical_review.post_vaccination_observation,
    ]
}

/// Calculate the composite vaccination completeness score (0-100).
/// Vaccine items use 0-2 scale (not given/partial/complete).
/// Consent and review items use 1-5 Likert scale.
/// Returns None if no items are answered.
pub fn calculate_composite_score(data: &AssessmentData) -> Option<f64> {
    let vaccine_items = vec![
        data.childhood_vaccinations.dtap_ipv_hib_hepb,
        data.childhood_vaccinations.pneumococcal,
        data.childhood_vaccinations.rotavirus,
        data.childhood_vaccinations.meningitis_b,
        data.childhood_vaccinations.mmr,
        data.childhood_vaccinations.hib_menc,
        data.childhood_vaccinations.preschool_booster,
        data.adult_vaccinations.td_ipv_booster,
        data.adult_vaccinations.hpv,
        data.adult_vaccinations.meningitis_acwy,
        data.adult_vaccinations.influenza_annual,
        data.adult_vaccinations.covid19,
        data.adult_vaccinations.shingles,
        data.adult_vaccinations.pneumococcal_ppv,
    ];

    let consent_items = vec![
        data.consent_information.information_provided,
        data.consent_information.risks_explained,
        data.consent_information.benefits_explained,
        data.consent_information.questions_answered,
    ];

    let answered_vaccines: Vec<u8> = vaccine_items.into_iter().flatten().collect();
    let answered_consent: Vec<u8> = consent_items.into_iter().flatten().collect();

    if answered_vaccines.is_empty() && answered_consent.is_empty() {
        return None;
    }

    // Vaccine score: 0-2 scale → 0-100
    let vaccine_score = if answered_vaccines.is_empty() {
        0.0
    } else {
        let sum: f64 = answered_vaccines.iter().map(|&v| v as f64).sum();
        let avg = sum / answered_vaccines.len() as f64;
        (avg / 2.0) * 100.0
    };

    // Consent score: 1-5 scale → 0-100
    let consent_score = if answered_consent.is_empty() {
        0.0
    } else {
        let sum: f64 = answered_consent.iter().map(|&v| v as f64).sum();
        let avg = sum / answered_consent.len() as f64;
        ((avg - 1.0) / 4.0) * 100.0
    };

    // Weight: 80% vaccines, 20% consent
    let total = if !answered_vaccines.is_empty() && !answered_consent.is_empty() {
        vaccine_score * 0.8 + consent_score * 0.2
    } else if !answered_vaccines.is_empty() {
        vaccine_score
    } else {
        consent_score
    };

    Some(total.round())
}

/// Calculate the childhood vaccination dimension score (0-100).
pub fn childhood_score(data: &AssessmentData) -> Option<f64> {
    dimension_score_02(&[
        data.childhood_vaccinations.dtap_ipv_hib_hepb,
        data.childhood_vaccinations.pneumococcal,
        data.childhood_vaccinations.rotavirus,
        data.childhood_vaccinations.meningitis_b,
        data.childhood_vaccinations.mmr,
        data.childhood_vaccinations.hib_menc,
        data.childhood_vaccinations.preschool_booster,
    ])
}

/// Calculate the adult vaccination dimension score (0-100).
pub fn adult_score(data: &AssessmentData) -> Option<f64> {
    dimension_score_02(&[
        data.adult_vaccinations.td_ipv_booster,
        data.adult_vaccinations.hpv,
        data.adult_vaccinations.meningitis_acwy,
        data.adult_vaccinations.influenza_annual,
        data.adult_vaccinations.covid19,
        data.adult_vaccinations.shingles,
        data.adult_vaccinations.pneumococcal_ppv,
    ])
}

/// Calculate the dimension score (0-100) for a set of 0-2 scale items.
pub fn dimension_score_02(items: &[Option<u8>]) -> Option<f64> {
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some(((avg / 2.0) * 100.0).round())
}

/// Calculate the consent quality score (0-100) for 1-5 Likert items.
pub fn consent_score(data: &AssessmentData) -> Option<f64> {
    let items = [
        data.consent_information.information_provided,
        data.consent_information.risks_explained,
        data.consent_information.benefits_explained,
        data.consent_information.questions_answered,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    let sum: f64 = answered.iter().map(|&v| v as f64).sum();
    let avg = sum / answered.len() as f64;
    Some((((avg - 1.0) / 4.0) * 100.0).round())
}

/// Completeness category for dashboard display.
pub fn completeness_category(score: f64) -> &'static str {
    if score >= 90.0 {
        "complete"
    } else if score >= 50.0 {
        "partial"
    } else {
        "overdue"
    }
}
