use allergy_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use allergy_assessment_tera_crate::engine::types::*;

fn create_mild_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();

    data.allergy_history.age_of_onset = Some(25);
    data.allergy_history.previous_anaphylaxis = "no".to_string();
    data.allergy_history.epi_pen_prescribed = "no".to_string();
    data.allergy_history.number_of_known_allergies = Some(1);

    data.current_allergies.primary_allergen = "Pollen".to_string();
    data.current_allergies.allergen_category = "environmental".to_string();
    data.current_allergies.severity_rating = Some(2);

    data.symptoms_reactions.skin_symptoms = Some(2);
    data.symptoms_reactions.respiratory_symptoms = Some(2);
    data.symptoms_reactions.gastrointestinal_symptoms = Some(1);
    data.symptoms_reactions.cardiovascular_symptoms = Some(1);
    data.symptoms_reactions.anaphylaxis_risk = Some(1);

    data.environmental_triggers.pollen_sensitivity = Some(3);
    data.environmental_triggers.dust_mite_sensitivity = Some(1);

    data.food_drug_allergies.food_allergies = "none".to_string();
    data.food_drug_allergies.drug_allergies = "none".to_string();
    data.food_drug_allergies.allergy_verified = "yes".to_string();

    data.testing_results.skin_prick_test_done = "yes".to_string();
    data.testing_results.skin_prick_test_result = "positive".to_string();

    data.current_treatment.antihistamine_use = "seasonal".to_string();
    data.current_treatment.nasal_corticosteroid = "seasonal".to_string();
    data.current_treatment.immunotherapy = "no".to_string();
    data.current_treatment.epi_pen_carried = "no".to_string();

    data.emergency_plan.has_emergency_plan = "yes".to_string();
    data.emergency_plan.plan_review_date = "2026-06-01".to_string();
    data.emergency_plan.anaphylaxis_action_plan = "notApplicable".to_string();

    data.review_assessment.overall_severity = Some(2);
    data.review_assessment.referral_needed = "no".to_string();

    data
}

#[test]
fn no_flags_for_mild_assessment() {
    let data = create_mild_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_anaphylaxis_without_epipen() {
    let mut data = create_mild_assessment();
    data.allergy_history.previous_anaphylaxis = "yes".to_string();
    data.current_treatment.epi_pen_carried = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANA-001"));
}

#[test]
fn flags_cardiovascular_symptoms() {
    let mut data = create_mild_assessment();
    data.symptoms_reactions.cardiovascular_symptoms = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANA-002"));
}

#[test]
fn flags_unverified_drug_allergy() {
    let mut data = create_mild_assessment();
    data.food_drug_allergies.drug_allergies = "penicillin".to_string();
    data.food_drug_allergies.allergy_verified = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DRUG-001"));
}

#[test]
fn flags_severe_respiratory_symptoms() {
    let mut data = create_mild_assessment();
    data.symptoms_reactions.respiratory_symptoms = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RESP-001"));
}

#[test]
fn flags_no_allergy_testing() {
    let mut data = create_mild_assessment();
    data.testing_results.skin_prick_test_done = "no".to_string();
    data.testing_results.specific_ige_level = None;
    data.testing_results.challenge_test_done = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TEST-001"));
}

#[test]
fn flags_no_emergency_plan_for_severe_allergy() {
    let mut data = create_mild_assessment();
    data.current_allergies.severity_rating = Some(4);
    data.emergency_plan.has_emergency_plan = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PLAN-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_mild_assessment();
    // Create flags of different priorities
    data.allergy_history.previous_anaphylaxis = "yes".to_string(); // high (FLAG-ANA-001)
    data.testing_results.skin_prick_test_done = "no".to_string(); // medium (FLAG-TEST-001)
    data.testing_results.specific_ige_level = None;
    data.testing_results.challenge_test_done = "no".to_string();

    let flags = detect_additional_flags(&data);
    let priorities: Vec<&str> = flags.iter().map(|f| f.priority.as_str()).collect();
    let mut sorted = priorities.clone();
    sorted.sort_by_key(|p| match *p {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });
    assert_eq!(priorities, sorted);
}
