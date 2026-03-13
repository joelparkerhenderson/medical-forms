use allergy_assessment_tera_crate::engine::severity_grader::calculate_severity;
use allergy_assessment_tera_crate::engine::severity_rules::all_rules;
use allergy_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Jones".to_string();
    data.patient_information.gp_practice = "Riverside Medical Centre".to_string();

    // Allergy History
    data.allergy_history.age_of_onset = Some(25);
    data.allergy_history.family_allergy_history = "yes".to_string();
    data.allergy_history.atopic_history = "rhinitis".to_string();
    data.allergy_history.previous_anaphylaxis = "no".to_string();
    data.allergy_history.epi_pen_prescribed = "no".to_string();
    data.allergy_history.number_of_known_allergies = Some(2);

    // Current Allergies — moderate severity
    data.current_allergies.primary_allergen = "Pollen".to_string();
    data.current_allergies.allergen_category = "environmental".to_string();
    data.current_allergies.reaction_type = "rhinitis".to_string();
    data.current_allergies.severity_rating = Some(3);
    data.current_allergies.onset_timing = "rapid".to_string();
    data.current_allergies.last_reaction = "2026-02-15".to_string();

    // Symptoms — moderate (all 3s)
    data.symptoms_reactions.skin_symptoms = Some(2);
    data.symptoms_reactions.respiratory_symptoms = Some(3);
    data.symptoms_reactions.gastrointestinal_symptoms = Some(1);
    data.symptoms_reactions.cardiovascular_symptoms = Some(1);
    data.symptoms_reactions.anaphylaxis_risk = Some(2);
    data.symptoms_reactions.symptom_frequency = "seasonal".to_string();

    // Environmental Triggers
    data.environmental_triggers.pollen_sensitivity = Some(4);
    data.environmental_triggers.dust_mite_sensitivity = Some(2);
    data.environmental_triggers.pet_dander_sensitivity = Some(1);
    data.environmental_triggers.mold_sensitivity = Some(1);
    data.environmental_triggers.seasonal_pattern = "spring".to_string();
    data.environmental_triggers.indoor_outdoor_triggers = "outdoor".to_string();

    // Food & Drug — none
    data.food_drug_allergies.food_allergies = "none".to_string();
    data.food_drug_allergies.drug_allergies = "none".to_string();
    data.food_drug_allergies.cross_reactivity = "no".to_string();
    data.food_drug_allergies.allergy_verified = "yes".to_string();

    // Testing
    data.testing_results.skin_prick_test_done = "yes".to_string();
    data.testing_results.skin_prick_test_result = "positive".to_string();
    data.testing_results.specific_ige_level = Some(2.5);
    data.testing_results.total_ige_level = Some(120.0);

    // Treatment
    data.current_treatment.antihistamine_use = "seasonal".to_string();
    data.current_treatment.nasal_corticosteroid = "seasonal".to_string();
    data.current_treatment.immunotherapy = "no".to_string();
    data.current_treatment.epi_pen_carried = "no".to_string();

    // Emergency Plan
    data.emergency_plan.has_emergency_plan = "yes".to_string();
    data.emergency_plan.plan_review_date = "2026-06-01".to_string();
    data.emergency_plan.anaphylaxis_action_plan = "notApplicable".to_string();

    // Review
    data.review_assessment.clinician_name = "Dr Williams".to_string();
    data.review_assessment.review_date = "2026-03-01".to_string();
    data.review_assessment.overall_severity = Some(3);
    data.review_assessment.follow_up_interval = "6months".to_string();
    data.review_assessment.referral_needed = "no".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_moderate_for_moderate_symptoms() {
    let data = create_moderate_assessment();
    let (level, _score, _fired_rules) = calculate_severity(&data);
    // Average of [3,2,3,1,1,2,4,2,1,1,3] = 23/11 ≈ 2.09; score = (2.09-1)/4*100 ≈ 27%
    assert_eq!(level, "moderate");
}

#[test]
fn returns_mild_for_all_ones() {
    let mut data = create_moderate_assessment();
    data.current_allergies.severity_rating = Some(1);
    data.symptoms_reactions.skin_symptoms = Some(1);
    data.symptoms_reactions.respiratory_symptoms = Some(1);
    data.symptoms_reactions.gastrointestinal_symptoms = Some(1);
    data.symptoms_reactions.cardiovascular_symptoms = Some(1);
    data.symptoms_reactions.anaphylaxis_risk = Some(1);
    data.environmental_triggers.pollen_sensitivity = Some(1);
    data.environmental_triggers.dust_mite_sensitivity = Some(1);
    data.environmental_triggers.pet_dander_sensitivity = Some(1);
    data.environmental_triggers.mold_sensitivity = Some(1);
    data.review_assessment.overall_severity = Some(1);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
    assert_eq!(score, 0.0); // (1-1)/4 * 100 = 0
}

#[test]
fn returns_life_threatening_for_all_fives() {
    let mut data = create_moderate_assessment();
    data.current_allergies.severity_rating = Some(5);
    data.symptoms_reactions.skin_symptoms = Some(5);
    data.symptoms_reactions.respiratory_symptoms = Some(5);
    data.symptoms_reactions.gastrointestinal_symptoms = Some(5);
    data.symptoms_reactions.cardiovascular_symptoms = Some(5);
    data.symptoms_reactions.anaphylaxis_risk = Some(5);
    data.environmental_triggers.pollen_sensitivity = Some(5);
    data.environmental_triggers.dust_mite_sensitivity = Some(5);
    data.environmental_triggers.pet_dander_sensitivity = Some(5);
    data.environmental_triggers.mold_sensitivity = Some(5);
    data.review_assessment.overall_severity = Some(5);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "lifeThreatening");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_severe_for_high_symptoms() {
    let mut data = create_moderate_assessment();
    data.current_allergies.severity_rating = Some(4);
    data.symptoms_reactions.skin_symptoms = Some(3);
    data.symptoms_reactions.respiratory_symptoms = Some(4);
    data.symptoms_reactions.gastrointestinal_symptoms = Some(3);
    data.symptoms_reactions.cardiovascular_symptoms = Some(3);
    data.symptoms_reactions.anaphylaxis_risk = Some(4);
    data.environmental_triggers.pollen_sensitivity = Some(4);
    data.environmental_triggers.dust_mite_sensitivity = Some(3);
    data.environmental_triggers.pet_dander_sensitivity = Some(3);
    data.environmental_triggers.mold_sensitivity = Some(3);
    data.review_assessment.overall_severity = Some(4);

    let (level, _score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
}

#[test]
fn fires_anaphylaxis_rule() {
    let mut data = create_moderate_assessment();
    data.allergy_history.previous_anaphylaxis = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ALG-001"));
}

#[test]
fn fires_epipen_not_prescribed_rule() {
    let mut data = create_moderate_assessment();
    data.allergy_history.previous_anaphylaxis = "yes".to_string();
    data.allergy_history.epi_pen_prescribed = "no".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ALG-004"));
}

#[test]
fn fires_respiratory_concern_rule() {
    let mut data = create_moderate_assessment();
    data.symptoms_reactions.respiratory_symptoms = Some(4);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ALG-006"));
}

#[test]
fn fires_mild_skin_symptoms_rule() {
    let mut data = create_moderate_assessment();
    data.symptoms_reactions.skin_symptoms = Some(2);
    data.symptoms_reactions.respiratory_symptoms = Some(1);
    data.symptoms_reactions.cardiovascular_symptoms = Some(1);
    data.symptoms_reactions.gastrointestinal_symptoms = Some(1);
    data.symptoms_reactions.anaphylaxis_risk = Some(1);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ALG-016"));
}

#[test]
fn all_rule_ids_are_unique() {
    let rules = all_rules();
    let ids: Vec<&str> = rules.iter().map(|r| r.id).collect();
    let mut unique_ids = ids.clone();
    unique_ids.sort();
    unique_ids.dedup();
    assert_eq!(unique_ids.len(), ids.len());
}
