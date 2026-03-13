use dermatology_assessment_tera_crate::engine::dermatology_grader::calculate_severity;
use dermatology_assessment_tera_crate::engine::dermatology_rules::all_rules;
use dermatology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.full_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_name = "Dr Brown".to_string();
    data.patient_information.gp_practice = "Riverside Surgery".to_string();

    // Skin History
    data.skin_history.primary_diagnosis = "psoriasis".to_string();
    data.skin_history.age_of_onset = Some(25);
    data.skin_history.duration_years = Some(10);
    data.skin_history.family_history = "yes".to_string();
    data.skin_history.previous_biopsies = "no".to_string();
    data.skin_history.skin_cancer_history = "none".to_string();

    // Current Condition
    data.current_condition.condition_status = "active".to_string();
    data.current_condition.lesion_type = "plaques".to_string();
    data.current_condition.lesion_distribution = "symmetrical".to_string();
    data.current_condition.body_area_affected = Some(15);
    data.current_condition.infection_signs = "no".to_string();
    data.current_condition.scarring = "no".to_string();

    // Affected Areas
    data.affected_areas.head = Some(1);
    data.affected_areas.upper_limbs = Some(2);
    data.affected_areas.trunk = Some(2);
    data.affected_areas.lower_limbs = Some(2);
    data.affected_areas.hands = Some(1);
    data.affected_areas.feet = Some(0);
    data.affected_areas.genital_area = Some(0);
    data.affected_areas.nails = Some(1);

    // Symptom Severity
    data.symptom_severity.itching = Some(5);
    data.symptom_severity.pain = Some(3);
    data.symptom_severity.burning = Some(2);
    data.symptom_severity.dryness = Some(3);
    data.symptom_severity.scaling = Some(3);
    data.symptom_severity.erythema = Some(3);
    data.symptom_severity.thickness = Some(2);
    data.symptom_severity.sleep_disturbance = Some(2);

    // Quality of Life (DLQI) — moderate effect (total = 8)
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

    // Previous Treatments
    data.previous_treatments.topical_steroids_used = "yes".to_string();
    data.previous_treatments.topical_steroid_response = "partial".to_string();
    data.previous_treatments.emollients_used = "Cetraben".to_string();
    data.previous_treatments.phototherapy = "no".to_string();
    data.previous_treatments.systemic_therapy = "none".to_string();
    data.previous_treatments.biologic_therapy = "none".to_string();
    data.previous_treatments.treatment_failures = Some(1);

    // Current Treatment
    data.current_treatment.current_topical = "betamethasone 0.1%".to_string();
    data.current_treatment.current_systemic = "none".to_string();
    data.current_treatment.current_biologic = "none".to_string();
    data.current_treatment.treatment_adherence = Some(4);
    data.current_treatment.treatment_response = Some(3);
    data.current_treatment.side_effects = "".to_string();
    data.current_treatment.emollient_use = Some(4);

    // Triggers & Comorbidities
    data.triggers_comorbidities.stress_trigger = "yes".to_string();
    data.triggers_comorbidities.weather_trigger = "cold".to_string();
    data.triggers_comorbidities.contact_allergens = "".to_string();
    data.triggers_comorbidities.psoriasis_arthritis = "no".to_string();
    data.triggers_comorbidities.mental_health_impact = Some(2);
    data.triggers_comorbidities.allergic_rhinitis = "no".to_string();
    data.triggers_comorbidities.asthma = "no".to_string();
    data.triggers_comorbidities.metabolic_syndrome = "no".to_string();

    // Clinical Review
    data.clinical_review.clinician_name = "Dr A. Patel".to_string();
    data.clinical_review.review_date = "2026-03-09".to_string();
    data.clinical_review.clinical_severity = Some(3);
    data.clinical_review.dlqi_total = Some(8);
    data.clinical_review.clinical_notes = "Stable plaque psoriasis".to_string();
    data.clinical_review.treatment_plan = "Continue current topical regimen".to_string();
    data.clinical_review.referral_needed = "no".to_string();
    data.clinical_review.next_review_date = "2026-06-09".to_string();

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
fn returns_moderate_for_dlqi_8() {
    let data = create_moderate_assessment();
    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderate");
    assert_eq!(score, 8.0); // DLQI total = 8
}

#[test]
fn returns_clear_for_dlqi_0() {
    let mut data = create_moderate_assessment();
    // Set all DLQI items to 0
    data.quality_of_life.dlqi1_symptoms = Some(0);
    data.quality_of_life.dlqi2_embarrassment = Some(0);
    data.quality_of_life.dlqi3_shopping = Some(0);
    data.quality_of_life.dlqi4_clothing = Some(0);
    data.quality_of_life.dlqi5_social = Some(0);
    data.quality_of_life.dlqi6_sport = Some(0);
    data.quality_of_life.dlqi7_work = Some(0);
    data.quality_of_life.dlqi8_relationships = Some(0);
    data.quality_of_life.dlqi9_sex = Some(0);
    data.quality_of_life.dlqi10_treatment = Some(0);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "clear");
    assert_eq!(score, 0.0);
}

#[test]
fn returns_very_severe_for_dlqi_30() {
    let mut data = create_moderate_assessment();
    // Set all DLQI items to 3 (maximum)
    data.quality_of_life.dlqi1_symptoms = Some(3);
    data.quality_of_life.dlqi2_embarrassment = Some(3);
    data.quality_of_life.dlqi3_shopping = Some(3);
    data.quality_of_life.dlqi4_clothing = Some(3);
    data.quality_of_life.dlqi5_social = Some(3);
    data.quality_of_life.dlqi6_sport = Some(3);
    data.quality_of_life.dlqi7_work = Some(3);
    data.quality_of_life.dlqi8_relationships = Some(3);
    data.quality_of_life.dlqi9_sex = Some(3);
    data.quality_of_life.dlqi10_treatment = Some(3);

    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "verySevere");
    assert_eq!(score, 30.0);
    assert!(fired_rules.iter().any(|r| r.id == "DERM-001")); // DLQI >= 21
}

#[test]
fn returns_mild_for_dlqi_3() {
    let mut data = create_moderate_assessment();
    // Set DLQI total to 3
    data.quality_of_life.dlqi1_symptoms = Some(1);
    data.quality_of_life.dlqi2_embarrassment = Some(1);
    data.quality_of_life.dlqi3_shopping = Some(1);
    data.quality_of_life.dlqi4_clothing = Some(0);
    data.quality_of_life.dlqi5_social = Some(0);
    data.quality_of_life.dlqi6_sport = Some(0);
    data.quality_of_life.dlqi7_work = Some(0);
    data.quality_of_life.dlqi8_relationships = Some(0);
    data.quality_of_life.dlqi9_sex = Some(0);
    data.quality_of_life.dlqi10_treatment = Some(0);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
    assert_eq!(score, 3.0);
}

#[test]
fn returns_severe_for_dlqi_15() {
    let mut data = create_moderate_assessment();
    // Set DLQI total to 15
    data.quality_of_life.dlqi1_symptoms = Some(2);
    data.quality_of_life.dlqi2_embarrassment = Some(2);
    data.quality_of_life.dlqi3_shopping = Some(1);
    data.quality_of_life.dlqi4_clothing = Some(2);
    data.quality_of_life.dlqi5_social = Some(2);
    data.quality_of_life.dlqi6_sport = Some(1);
    data.quality_of_life.dlqi7_work = Some(1);
    data.quality_of_life.dlqi8_relationships = Some(1);
    data.quality_of_life.dlqi9_sex = Some(1);
    data.quality_of_life.dlqi10_treatment = Some(2);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "severe");
    assert_eq!(score, 15.0);
}

#[test]
fn fires_high_bsa_rule() {
    let mut data = create_moderate_assessment();
    data.current_condition.body_area_affected = Some(40);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DERM-002")); // BSA > 30%
}

#[test]
fn fires_severe_symptoms_rule() {
    let mut data = create_moderate_assessment();
    data.symptom_severity.itching = Some(9);
    data.symptom_severity.pain = Some(9);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DERM-003")); // Severe itching+pain
}

#[test]
fn fires_infection_rule() {
    let mut data = create_moderate_assessment();
    data.current_condition.infection_signs = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DERM-004")); // Infection signs
}

#[test]
fn fires_remission_positive_rule() {
    let mut data = create_moderate_assessment();
    data.current_condition.condition_status = "remission".to_string();
    data.current_treatment.treatment_response = Some(4);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "DERM-017")); // Remission
    assert!(fired_rules.iter().any(|r| r.id == "DERM-018")); // Good response
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
