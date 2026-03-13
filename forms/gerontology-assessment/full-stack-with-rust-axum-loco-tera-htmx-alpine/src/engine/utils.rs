use super::types::AssessmentData;

/// Returns a human-readable label for a frailty level.
pub fn frailty_level_label(level: &str) -> &str {
    match level {
        "fit" => "Fit",
        "mildFrailty" => "Mild Frailty",
        "moderateFrailty" => "Moderate Frailty",
        "severeFrailty" => "Severe Frailty",
        "draft" => "Draft",
        _ => "Unknown",
    }
}

/// Calculate the Barthel Index score (0-20) from functional assessment items.
/// Each item is scored 0, 1, or 2.
pub fn calculate_barthel_score(data: &AssessmentData) -> u8 {
    let items = [
        data.functional_assessment.feeding,
        data.functional_assessment.bathing,
        data.functional_assessment.grooming,
        data.functional_assessment.dressing,
        data.functional_assessment.bowel_control,
        data.functional_assessment.bladder_control,
        data.functional_assessment.toilet_use,
        data.functional_assessment.transfers,
        data.functional_assessment.mobility,
        data.functional_assessment.stairs,
    ];
    items.iter().filter_map(|x| *x).sum()
}

/// Count the number of Katz ADL dependencies (0-6).
/// Each item answered "no" (not independent) counts as a dependency.
pub fn count_katz_dependencies(data: &AssessmentData) -> u8 {
    let items = [
        &data.functional_assessment.katz_bathing,
        &data.functional_assessment.katz_dressing,
        &data.functional_assessment.katz_toileting,
        &data.functional_assessment.katz_transferring,
        &data.functional_assessment.katz_continence,
        &data.functional_assessment.katz_feeding,
    ];
    items.iter().filter(|x| x.as_str() == "no").count() as u8
}

/// Count the number of IADL items where the person is not independent (0-8).
pub fn count_iadl_dependencies(data: &AssessmentData) -> u8 {
    let items = [
        &data.functional_assessment.iadl_telephone,
        &data.functional_assessment.iadl_shopping,
        &data.functional_assessment.iadl_food_preparation,
        &data.functional_assessment.iadl_housekeeping,
        &data.functional_assessment.iadl_laundry,
        &data.functional_assessment.iadl_transport,
        &data.functional_assessment.iadl_medications,
        &data.functional_assessment.iadl_finances,
    ];
    items
        .iter()
        .filter(|x| {
            let s = x.as_str();
            s == "needs_help" || s == "unable"
        })
        .count() as u8
}

/// Calculate the 4AT delirium screening score (0-12).
pub fn calculate_four_at_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.cognitive_screening.four_at_alertness,
        data.cognitive_screening.four_at_amts4,
        data.cognitive_screening.four_at_attention,
        data.cognitive_screening.four_at_acute_change,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Calculate the Tinetti balance score (0-12, from 6 items scored 0-2).
pub fn calculate_tinetti_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.falls_risk.tinetti_sitting_balance,
        data.falls_risk.tinetti_arising,
        data.falls_risk.tinetti_standing_balance,
        data.falls_risk.tinetti_nudge_test,
        data.falls_risk.tinetti_eyes_closed,
        data.falls_risk.tinetti_turning,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Calculate the MNA-SF score (0-14) from 6 items.
pub fn calculate_mna_score(data: &AssessmentData) -> Option<u8> {
    let items = [
        data.nutritional_assessment.appetite_loss,
        data.nutritional_assessment.weight_loss,
        data.nutritional_assessment.mobility_mna,
        data.nutritional_assessment.psychological_stress,
        data.nutritional_assessment.neuropsychological_problems,
        data.nutritional_assessment.bmi_category,
    ];
    let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
    if answered.is_empty() {
        return None;
    }
    Some(answered.iter().sum())
}

/// Calculate the GDS-15 depression score (0-15).
/// "Depressive" answers score 1 point each.
/// Items where "yes" = depressive: dropped_activities, life_feels_empty, often_bored,
///   afraid_something_bad, feels_helpless, prefers_staying_home, memory_problems,
///   feels_worthless, feels_hopeless, others_better_off
/// Items where "no" = depressive: satisfied_with_life, good_spirits, feels_happy,
///   wonderful_to_be_alive, feels_full_of_energy
pub fn calculate_gds_score(data: &AssessmentData) -> u8 {
    let mut score: u8 = 0;

    // Items where "no" is depressive
    let no_depressive = [
        &data.mood_assessment.gds_satisfied_with_life,
        &data.mood_assessment.gds_good_spirits,
        &data.mood_assessment.gds_feels_happy,
        &data.mood_assessment.gds_wonderful_to_be_alive,
        &data.mood_assessment.gds_feels_full_of_energy,
    ];
    for item in &no_depressive {
        if item.as_str() == "no" {
            score += 1;
        }
    }

    // Items where "yes" is depressive
    let yes_depressive = [
        &data.mood_assessment.gds_dropped_activities,
        &data.mood_assessment.gds_life_feels_empty,
        &data.mood_assessment.gds_often_bored,
        &data.mood_assessment.gds_afraid_something_bad,
        &data.mood_assessment.gds_feels_helpless,
        &data.mood_assessment.gds_prefers_staying_home,
        &data.mood_assessment.gds_memory_problems,
        &data.mood_assessment.gds_feels_worthless,
        &data.mood_assessment.gds_feels_hopeless,
        &data.mood_assessment.gds_others_better_off,
    ];
    for item in &yes_depressive {
        if item.as_str() == "yes" {
            score += 1;
        }
    }

    score
}

/// Count the minimum number of items answered across key assessment domains
/// to determine if the assessment is complete enough to grade.
pub fn count_answered_items(data: &AssessmentData) -> usize {
    let mut count = 0;

    // Barthel items
    let barthel = [
        data.functional_assessment.feeding,
        data.functional_assessment.bathing,
        data.functional_assessment.grooming,
        data.functional_assessment.dressing,
        data.functional_assessment.bowel_control,
        data.functional_assessment.bladder_control,
        data.functional_assessment.toilet_use,
        data.functional_assessment.transfers,
        data.functional_assessment.mobility,
        data.functional_assessment.stairs,
    ];
    count += barthel.iter().filter(|x| x.is_some()).count();

    // Cognitive
    if data.cognitive_screening.mmse_score.is_some() {
        count += 1;
    }

    // Falls
    if data.falls_risk.falls_last_12_months.is_some() {
        count += 1;
    }

    // Medications
    if data.medication_review.total_medications.is_some() {
        count += 1;
    }

    // CFS
    if data.clinical_review.clinical_frailty_scale.is_some() {
        count += 1;
    }

    count
}
