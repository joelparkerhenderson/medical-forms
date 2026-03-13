use asthma_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use asthma_assessment_tera_crate::engine::types::*;

fn create_well_controlled_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Doe".to_string();

    data.asthma_history.previous_icu_admissions = Some(0);
    data.asthma_history.best_peak_flow = Some(500.0);

    data.symptom_assessment.daytime_symptoms = Some(0);
    data.symptom_assessment.night_waking = Some(0);
    data.symptom_assessment.reliever_use = Some(0);
    data.symptom_assessment.activity_limitation = Some(0);

    data.lung_function.fev1 = Some(3.2);
    data.lung_function.fev1_predicted = Some(3.5);

    data.triggers_exacerbations.exacerbations_last12_months = Some(0);
    data.triggers_exacerbations.oral_steroid_courses = Some(0);
    data.triggers_exacerbations.emergency_visits = Some(0);

    data.current_medications.ics_dose = "low".to_string();
    data.current_medications.preventer_adherence = Some(4);
    data.current_medications.gina_step = "2".to_string();

    data.inhaler_technique.technique_score = Some(4);

    data.comorbidities.rhinitis = "no".to_string();
    data.comorbidities.sinusitis = "no".to_string();
    data.comorbidities.gerd = "no".to_string();
    data.comorbidities.obesity = "no".to_string();
    data.comorbidities.obstructive_sleep_apnoea = "no".to_string();
    data.comorbidities.anxiety_depression = "no".to_string();

    data.lifestyle_environment.smoking_status = "never".to_string();

    data.review_management_plan.control_level = "wellControlled".to_string();
    data.review_management_plan.gina_step_recommended = "2".to_string();
    data.review_management_plan.action_plan_provided = "yes".to_string();

    data
}

#[test]
fn no_flags_for_well_controlled_patient() {
    let data = create_well_controlled_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_frequent_exacerbations() {
    let mut data = create_well_controlled_assessment();
    data.triggers_exacerbations.exacerbations_last12_months = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-EXAC-001"));
}

#[test]
fn flags_emergency_visit() {
    let mut data = create_well_controlled_assessment();
    data.triggers_exacerbations.emergency_visits = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-EXAC-002"));
}

#[test]
fn flags_severe_fev1() {
    let mut data = create_well_controlled_assessment();
    data.lung_function.fev1 = Some(1.5);
    data.lung_function.fev1_predicted = Some(3.5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LUNG-001"));
}

#[test]
fn flags_no_preventer_despite_symptoms() {
    let mut data = create_well_controlled_assessment();
    data.current_medications.ics_dose = "none".to_string();
    data.symptom_assessment.daytime_symptoms = Some(3);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MED-001"));
}

#[test]
fn flags_poor_inhaler_technique() {
    let mut data = create_well_controlled_assessment();
    data.inhaler_technique.technique_score = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TECH-001"));
}

#[test]
fn flags_current_smoker() {
    let mut data = create_well_controlled_assessment();
    data.lifestyle_environment.smoking_status = "current".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SMOKE-001"));
}

#[test]
fn flags_icu_history() {
    let mut data = create_well_controlled_assessment();
    data.asthma_history.previous_icu_admissions = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ICU-001"));
}

#[test]
fn flags_no_action_plan() {
    let mut data = create_well_controlled_assessment();
    data.review_management_plan.action_plan_provided = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PLAN-001"));
}

#[test]
fn flags_multiple_comorbidities() {
    let mut data = create_well_controlled_assessment();
    data.comorbidities.rhinitis = "yes".to_string();
    data.comorbidities.gerd = "yes".to_string();
    data.comorbidities.obesity = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COMOR-001"));
}

#[test]
fn flags_gina_step_4_specialist_referral() {
    let mut data = create_well_controlled_assessment();
    data.current_medications.gina_step = "4".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-STEP-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_well_controlled_assessment();
    // Create flags of different priorities
    data.asthma_history.previous_icu_admissions = Some(1); // high (FLAG-ICU-001)
    data.lifestyle_environment.smoking_status = "current".to_string(); // medium (FLAG-SMOKE-001)
    data.review_management_plan.action_plan_provided = "no".to_string(); // medium (FLAG-PLAN-001)

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
