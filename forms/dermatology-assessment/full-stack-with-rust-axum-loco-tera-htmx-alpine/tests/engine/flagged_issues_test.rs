use dermatology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use dermatology_assessment_tera_crate::engine::types::*;

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.full_name = "Jane Smith".to_string();

    data.skin_history.primary_diagnosis = "psoriasis".to_string();
    data.skin_history.age_of_onset = Some(25);
    data.skin_history.skin_cancer_history = "none".to_string();

    data.current_condition.condition_status = "active".to_string();
    data.current_condition.body_area_affected = Some(15);
    data.current_condition.infection_signs = "no".to_string();

    data.affected_areas.head = Some(1);
    data.affected_areas.upper_limbs = Some(2);
    data.affected_areas.trunk = Some(2);
    data.affected_areas.lower_limbs = Some(2);
    data.affected_areas.hands = Some(1);
    data.affected_areas.feet = Some(0);
    data.affected_areas.genital_area = Some(0);
    data.affected_areas.nails = Some(1);

    data.symptom_severity.itching = Some(5);
    data.symptom_severity.pain = Some(3);

    // Moderate DLQI = 8
    data.quality_of_life.dlqi1_symptoms = Some(1);
    data.quality_of_life.dlqi2_embarrassment = Some(1);
    data.quality_of_life.dlqi3_shopping = Some(1);
    data.quality_of_life.dlqi4_clothing = Some(1);
    data.quality_of_life.dlqi5_social = Some(1);
    data.quality_of_life.dlqi6_sport = Some(1);
    data.quality_of_life.dlqi7_work = Some(0);
    data.quality_of_life.dlqi8_relationships = Some(1);
    data.quality_of_life.dlqi9_sex = Some(0);
    data.quality_of_life.dlqi10_treatment = Some(1);

    data.previous_treatments.systemic_therapy = "none".to_string();
    data.previous_treatments.biologic_therapy = "none".to_string();
    data.previous_treatments.treatment_failures = Some(1);

    data.current_treatment.treatment_adherence = Some(4);
    data.current_treatment.treatment_response = Some(3);
    data.current_treatment.emollient_use = Some(4);

    data.triggers_comorbidities.psoriasis_arthritis = "no".to_string();
    data.triggers_comorbidities.mental_health_impact = Some(2);

    data
}

#[test]
fn no_flags_for_moderate_patient() {
    let data = create_moderate_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_infection_signs() {
    let mut data = create_moderate_assessment();
    data.current_condition.infection_signs = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-INF-001"));
}

#[test]
fn flags_severe_pain() {
    let mut data = create_moderate_assessment();
    data.symptom_severity.pain = Some(9);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_mental_health_impact() {
    let mut data = create_moderate_assessment();
    data.triggers_comorbidities.mental_health_impact = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PSYCH-001"));
}

#[test]
fn flags_psoriatic_arthritis() {
    let mut data = create_moderate_assessment();
    data.triggers_comorbidities.psoriasis_arthritis = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ARTH-001"));
}

#[test]
fn flags_genital_involvement() {
    let mut data = create_moderate_assessment();
    data.affected_areas.genital_area = Some(2);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GENI-001"));
}

#[test]
fn flags_low_emollient_adherence() {
    let mut data = create_moderate_assessment();
    data.current_treatment.emollient_use = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ADH-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_moderate_assessment();
    // Create flags of different priorities
    data.current_condition.infection_signs = "yes".to_string(); // high
    data.triggers_comorbidities.psoriasis_arthritis = "yes".to_string(); // medium
    data.current_treatment.emollient_use = Some(1); // low

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
