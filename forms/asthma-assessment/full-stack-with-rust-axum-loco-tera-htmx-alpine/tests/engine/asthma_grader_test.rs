use asthma_assessment_tera_crate::engine::asthma_grader::calculate_control;
use asthma_assessment_tera_crate::engine::asthma_rules::all_rules;
use asthma_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_well_controlled_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.full_name = "Jane Doe".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Smith".to_string();
    data.patient_information.gp_practice = "Riverside Medical Centre".to_string();

    // Asthma History
    data.asthma_history.age_at_diagnosis = Some(8);
    data.asthma_history.years_with_asthma = Some(26);
    data.asthma_history.family_asthma_history = "yes".to_string();
    data.asthma_history.allergy_history = "hayfever".to_string();
    data.asthma_history.previous_hospitalisations = Some(0);
    data.asthma_history.previous_icu_admissions = Some(0);
    data.asthma_history.best_peak_flow = Some(500.0);

    // Symptom Assessment - well controlled: all 0
    data.symptom_assessment.daytime_symptoms = Some(0);
    data.symptom_assessment.night_waking = Some(0);
    data.symptom_assessment.reliever_use = Some(0);
    data.symptom_assessment.activity_limitation = Some(0);
    data.symptom_assessment.symptom_free_days = Some(7);
    data.symptom_assessment.cough_severity = Some(1);
    data.symptom_assessment.wheeze_severity = Some(1);
    data.symptom_assessment.breathlessness = Some(1);

    // Lung Function - good
    data.lung_function.current_peak_flow = Some(480.0);
    data.lung_function.predicted_peak_flow = Some(500.0);
    data.lung_function.fev1 = Some(3.2);
    data.lung_function.fev1_predicted = Some(3.5);
    data.lung_function.fev1_fvc_ratio = Some(78.0);
    data.lung_function.reversibility_test = "negative".to_string();

    // Triggers
    data.triggers_exacerbations.exercise_trigger = "no".to_string();
    data.triggers_exacerbations.cold_air_trigger = "no".to_string();
    data.triggers_exacerbations.allergen_trigger = "yes".to_string();
    data.triggers_exacerbations.infection_trigger = "no".to_string();
    data.triggers_exacerbations.emotional_trigger = "no".to_string();
    data.triggers_exacerbations.exacerbations_last12_months = Some(0);
    data.triggers_exacerbations.oral_steroid_courses = Some(0);
    data.triggers_exacerbations.emergency_visits = Some(0);

    // Medications
    data.current_medications.saba_use = "rarely".to_string();
    data.current_medications.ics_dose = "low".to_string();
    data.current_medications.ics_name = "Beclometasone".to_string();
    data.current_medications.laba_use = "no".to_string();
    data.current_medications.ltra_use = "no".to_string();
    data.current_medications.biologic_therapy = "".to_string();
    data.current_medications.preventer_adherence = Some(4);
    data.current_medications.gina_step = "2".to_string();

    // Inhaler Technique
    data.inhaler_technique.inhaler_type = "mdi".to_string();
    data.inhaler_technique.technique_assessed = "yes".to_string();
    data.inhaler_technique.technique_score = Some(4);
    data.inhaler_technique.spacer_used = "yes".to_string();
    data.inhaler_technique.education_provided = "yes".to_string();

    // Comorbidities
    data.comorbidities.rhinitis = "no".to_string();
    data.comorbidities.sinusitis = "no".to_string();
    data.comorbidities.gerd = "no".to_string();
    data.comorbidities.obesity = "no".to_string();
    data.comorbidities.obstructive_sleep_apnoea = "no".to_string();
    data.comorbidities.anxiety_depression = "no".to_string();

    // Lifestyle
    data.lifestyle_environment.smoking_status = "never".to_string();
    data.lifestyle_environment.second_hand_smoke = "no".to_string();
    data.lifestyle_environment.occupational_exposure = "no".to_string();
    data.lifestyle_environment.exercise_frequency = "3to5PerWeek".to_string();

    // Management Plan
    data.review_management_plan.clinician_name = "Dr Williams".to_string();
    data.review_management_plan.review_date = "2026-03-09".to_string();
    data.review_management_plan.control_level = "wellControlled".to_string();
    data.review_management_plan.gina_step_recommended = "2".to_string();
    data.review_management_plan.action_plan_provided = "yes".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, gina_count, fired_rules) = calculate_control(&data);
    assert_eq!(level, "draft");
    assert_eq!(gina_count, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_well_controlled_for_no_gina_criteria() {
    let data = create_well_controlled_assessment();
    let (level, gina_count, _fired_rules) = calculate_control(&data);
    assert_eq!(level, "wellControlled");
    assert_eq!(gina_count, 0);
}

#[test]
fn returns_partly_controlled_for_one_criterion() {
    let mut data = create_well_controlled_assessment();
    // Night waking 1/month = criteria met
    data.symptom_assessment.night_waking = Some(1);

    let (level, gina_count, _fired_rules) = calculate_control(&data);
    assert_eq!(level, "partlyControlled");
    assert_eq!(gina_count, 1);
}

#[test]
fn returns_partly_controlled_for_two_criteria() {
    let mut data = create_well_controlled_assessment();
    data.symptom_assessment.night_waking = Some(2);
    data.symptom_assessment.activity_limitation = Some(1);

    let (level, gina_count, _fired_rules) = calculate_control(&data);
    assert_eq!(level, "partlyControlled");
    assert_eq!(gina_count, 2);
}

#[test]
fn returns_uncontrolled_for_three_criteria() {
    let mut data = create_well_controlled_assessment();
    data.symptom_assessment.daytime_symptoms = Some(4); // daily
    data.symptom_assessment.night_waking = Some(3); // 2-3/week
    data.symptom_assessment.reliever_use = Some(4); // daily
    data.symptom_assessment.activity_limitation = Some(0); // none

    let (level, gina_count, fired_rules) = calculate_control(&data);
    assert_eq!(level, "uncontrolled");
    assert_eq!(gina_count, 3);
    assert!(fired_rules.iter().any(|r| r.id == "AST-001"));
}

#[test]
fn returns_uncontrolled_for_all_four_criteria() {
    let mut data = create_well_controlled_assessment();
    data.symptom_assessment.daytime_symptoms = Some(4); // daily
    data.symptom_assessment.night_waking = Some(4); // most nights
    data.symptom_assessment.reliever_use = Some(4); // daily
    data.symptom_assessment.activity_limitation = Some(3); // severe

    let (level, gina_count, fired_rules) = calculate_control(&data);
    assert_eq!(level, "uncontrolled");
    assert_eq!(gina_count, 4);
    assert!(fired_rules.iter().any(|r| r.id == "AST-001"));
}

#[test]
fn fires_icu_admission_rule() {
    let mut data = create_well_controlled_assessment();
    data.asthma_history.previous_icu_admissions = Some(1);

    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-002"));
}

#[test]
fn fires_low_fev1_rule() {
    let mut data = create_well_controlled_assessment();
    data.lung_function.fev1 = Some(1.8);
    data.lung_function.fev1_predicted = Some(3.5);

    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-003")); // FEV1 < 60%
}

#[test]
fn fires_frequent_exacerbations_rule() {
    let mut data = create_well_controlled_assessment();
    data.triggers_exacerbations.exacerbations_last12_months = Some(4);

    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-004"));
}

#[test]
fn fires_oral_steroid_rule() {
    let mut data = create_well_controlled_assessment();
    data.triggers_exacerbations.oral_steroid_courses = Some(3);

    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-005"));
}

#[test]
fn fires_good_inhaler_technique_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-017")); // technique_score = 4
}

#[test]
fn fires_action_plan_provided_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-018"));
}

#[test]
fn fires_non_smoker_rule() {
    let data = create_well_controlled_assessment();
    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-020"));
}

#[test]
fn fires_smoker_rule() {
    let mut data = create_well_controlled_assessment();
    data.lifestyle_environment.smoking_status = "current".to_string();

    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-013"));
    // Non-smoker rule should not fire
    assert!(!fired_rules.iter().any(|r| r.id == "AST-020"));
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

#[test]
fn fires_fev1_above_80_rule_for_good_lung_function() {
    let data = create_well_controlled_assessment();
    // FEV1 = 3.2 / 3.5 = 91.4%
    let (_level, _gina_count, fired_rules) = calculate_control(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AST-019"));
}
