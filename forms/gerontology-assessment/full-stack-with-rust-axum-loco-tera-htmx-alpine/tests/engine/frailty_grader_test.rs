use gerontology_assessment_tera_crate::engine::frailty_grader::calculate_frailty;
use gerontology_assessment_tera_crate::engine::frailty_rules::all_rules;
use gerontology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_fit_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Margaret Jones".to_string();
    data.patient_information.date_of_birth = "1942-05-15".to_string();
    data.patient_information.age = Some(83);
    data.patient_information.sex = "female".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();
    data.patient_information.assessor_name = "Dr Smith".to_string();
    data.patient_information.referral_source = "gp".to_string();
    data.patient_information.living_situation = "ownHome".to_string();

    // Functional Assessment — all independent (Barthel 20/20)
    data.functional_assessment.feeding = Some(2);
    data.functional_assessment.bathing = Some(2);
    data.functional_assessment.grooming = Some(2);
    data.functional_assessment.dressing = Some(2);
    data.functional_assessment.bowel_control = Some(2);
    data.functional_assessment.bladder_control = Some(2);
    data.functional_assessment.toilet_use = Some(2);
    data.functional_assessment.transfers = Some(2);
    data.functional_assessment.mobility = Some(2);
    data.functional_assessment.stairs = Some(2);

    // Katz ADL — all independent
    data.functional_assessment.katz_bathing = "yes".to_string();
    data.functional_assessment.katz_dressing = "yes".to_string();
    data.functional_assessment.katz_toileting = "yes".to_string();
    data.functional_assessment.katz_transferring = "yes".to_string();
    data.functional_assessment.katz_continence = "yes".to_string();
    data.functional_assessment.katz_feeding = "yes".to_string();

    // IADL — all independent
    data.functional_assessment.iadl_telephone = "independent".to_string();
    data.functional_assessment.iadl_shopping = "independent".to_string();
    data.functional_assessment.iadl_food_preparation = "independent".to_string();
    data.functional_assessment.iadl_housekeeping = "independent".to_string();
    data.functional_assessment.iadl_laundry = "independent".to_string();
    data.functional_assessment.iadl_transport = "independent".to_string();
    data.functional_assessment.iadl_medications = "independent".to_string();
    data.functional_assessment.iadl_finances = "independent".to_string();

    // Cognitive — normal
    data.cognitive_screening.mmse_score = Some(28);
    data.cognitive_screening.four_at_alertness = Some(0);
    data.cognitive_screening.four_at_amts4 = Some(0);
    data.cognitive_screening.four_at_attention = Some(0);
    data.cognitive_screening.four_at_acute_change = Some(0);
    data.cognitive_screening.memory_concerns = "no".to_string();
    data.cognitive_screening.orientation_impaired = "no".to_string();
    data.cognitive_screening.decision_making_capacity = "intact".to_string();
    data.cognitive_screening.known_dementia_diagnosis = "no".to_string();

    // Falls — none
    data.falls_risk.falls_last_12_months = Some(0);
    data.falls_risk.falls_with_injury = Some(0);
    data.falls_risk.fear_of_falling = "no".to_string();
    data.falls_risk.uses_walking_aid = "no".to_string();
    data.falls_risk.tinetti_sitting_balance = Some(2);
    data.falls_risk.tinetti_arising = Some(2);
    data.falls_risk.tinetti_standing_balance = Some(2);
    data.falls_risk.tinetti_nudge_test = Some(2);
    data.falls_risk.tinetti_eyes_closed = Some(2);
    data.falls_risk.tinetti_turning = Some(2);
    data.falls_risk.postural_hypotension = "no".to_string();
    data.falls_risk.footwear_appropriate = "yes".to_string();
    data.falls_risk.home_hazards_identified = "no".to_string();

    // Medications — few
    data.medication_review.total_medications = Some(3);
    data.medication_review.high_risk_medications = "no".to_string();
    data.medication_review.anticholinergic_burden = "none".to_string();
    data.medication_review.medication_adherence = "good".to_string();
    data.medication_review.recent_medication_changes = "no".to_string();
    data.medication_review.medication_side_effects = "no".to_string();
    data.medication_review.prescribing_cascade_risk = "no".to_string();

    // Nutrition — normal (MNA-SF 14/14)
    data.nutritional_assessment.appetite_loss = Some(2);
    data.nutritional_assessment.weight_loss = Some(3);
    data.nutritional_assessment.mobility_mna = Some(2);
    data.nutritional_assessment.psychological_stress = Some(2);
    data.nutritional_assessment.neuropsychological_problems = Some(2);
    data.nutritional_assessment.bmi_category = Some(3);
    data.nutritional_assessment.swallowing_difficulty = "no".to_string();
    data.nutritional_assessment.fluid_intake_adequate = "yes".to_string();
    data.nutritional_assessment.oral_health_concerns = "no".to_string();

    // Mood — no depression (GDS 0)
    data.mood_assessment.gds_satisfied_with_life = "yes".to_string();
    data.mood_assessment.gds_dropped_activities = "no".to_string();
    data.mood_assessment.gds_life_feels_empty = "no".to_string();
    data.mood_assessment.gds_often_bored = "no".to_string();
    data.mood_assessment.gds_good_spirits = "yes".to_string();
    data.mood_assessment.gds_afraid_something_bad = "no".to_string();
    data.mood_assessment.gds_feels_happy = "yes".to_string();
    data.mood_assessment.gds_feels_helpless = "no".to_string();
    data.mood_assessment.gds_prefers_staying_home = "no".to_string();
    data.mood_assessment.gds_memory_problems = "no".to_string();
    data.mood_assessment.gds_wonderful_to_be_alive = "yes".to_string();
    data.mood_assessment.gds_feels_worthless = "no".to_string();
    data.mood_assessment.gds_feels_full_of_energy = "yes".to_string();
    data.mood_assessment.gds_feels_hopeless = "no".to_string();
    data.mood_assessment.gds_others_better_off = "no".to_string();
    data.mood_assessment.sleep_disturbance = "no".to_string();
    data.mood_assessment.anxiety_symptoms = "no".to_string();
    data.mood_assessment.social_isolation = "no".to_string();

    // Social — good support
    data.social_circumstances.housing_type = "house".to_string();
    data.social_circumstances.lives_alone = "no".to_string();
    data.social_circumstances.primary_carer = "no".to_string();
    data.social_circumstances.carer_stress = "no".to_string();
    data.social_circumstances.formal_care_package = "no".to_string();
    data.social_circumstances.social_activities = "yes".to_string();
    data.social_circumstances.safeguarding_concerns = "no".to_string();
    data.social_circumstances.advance_care_plan = "no".to_string();
    data.social_circumstances.driving_status = "stoppedRecently".to_string();

    // Continence — normal
    data.continence_assessment.urinary_incontinence = "no".to_string();
    data.continence_assessment.faecal_incontinence = "no".to_string();
    data.continence_assessment.continence_impact_on_quality = "none".to_string();

    // Clinical Review — CFS 2 (Well)
    data.clinical_review.clinical_frailty_scale = Some(2);
    data.clinical_review.comorbidity_count = Some(2);
    data.clinical_review.sensory_impairment_vision = "none".to_string();
    data.clinical_review.sensory_impairment_hearing = "mild".to_string();
    data.clinical_review.pain_assessment = "no".to_string();
    data.clinical_review.skin_integrity = "intact".to_string();
    data.clinical_review.pressure_ulcer_risk = "low".to_string();
    data.clinical_review.palliative_care_needs = "no".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, fired_rules) = calculate_frailty(&data);
    assert_eq!(level, "draft");
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_fit_for_healthy_elderly() {
    let data = create_fit_assessment();
    let (level, _fired_rules) = calculate_frailty(&data);
    assert_eq!(level, "fit");
}

#[test]
fn returns_severe_frailty_for_cfs_7() {
    let mut data = create_fit_assessment();
    data.clinical_review.clinical_frailty_scale = Some(7);
    let (level, fired_rules) = calculate_frailty(&data);
    assert_eq!(level, "severeFrailty");
    assert!(fired_rules.iter().any(|r| r.id == "GER-001"));
}

#[test]
fn returns_moderate_frailty_for_cfs_5() {
    let mut data = create_fit_assessment();
    data.clinical_review.clinical_frailty_scale = Some(5);
    let (level, fired_rules) = calculate_frailty(&data);
    assert_eq!(level, "moderateFrailty");
    assert!(fired_rules.iter().any(|r| r.id == "GER-006"));
}

#[test]
fn returns_mild_frailty_for_cfs_4() {
    let mut data = create_fit_assessment();
    data.clinical_review.clinical_frailty_scale = Some(4);
    let (level, _fired_rules) = calculate_frailty(&data);
    assert_eq!(level, "mildFrailty");
}

#[test]
fn fires_recurrent_falls_rule() {
    let mut data = create_fit_assessment();
    data.falls_risk.falls_last_12_months = Some(3);
    data.falls_risk.falls_with_injury = Some(1);
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-002"));
}

#[test]
fn fires_cognitive_safety_risk_rule() {
    let mut data = create_fit_assessment();
    data.cognitive_screening.mmse_score = Some(18);
    data.cognitive_screening.known_dementia_diagnosis = "yes".to_string();
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-003"));
}

#[test]
fn fires_malnutrition_rule() {
    let mut data = create_fit_assessment();
    // MNA-SF: all items = 0 => total = 0, well below 7
    data.nutritional_assessment.appetite_loss = Some(0);
    data.nutritional_assessment.weight_loss = Some(0);
    data.nutritional_assessment.mobility_mna = Some(0);
    data.nutritional_assessment.psychological_stress = Some(0);
    data.nutritional_assessment.neuropsychological_problems = Some(0);
    data.nutritional_assessment.bmi_category = Some(0);
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-004"));
}

#[test]
fn fires_adl_dependence_rule() {
    let mut data = create_fit_assessment();
    data.functional_assessment.katz_bathing = "no".to_string();
    data.functional_assessment.katz_dressing = "no".to_string();
    data.functional_assessment.katz_toileting = "no".to_string();
    data.functional_assessment.katz_transferring = "no".to_string();
    data.functional_assessment.katz_continence = "no".to_string();
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-005"));
}

#[test]
fn fires_polypharmacy_rule() {
    let mut data = create_fit_assessment();
    data.medication_review.total_medications = Some(8);
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-008"));
}

#[test]
fn fires_depression_rule() {
    let mut data = create_fit_assessment();
    // Set depressive answers (GDS >= 5)
    data.mood_assessment.gds_satisfied_with_life = "no".to_string();
    data.mood_assessment.gds_good_spirits = "no".to_string();
    data.mood_assessment.gds_feels_happy = "no".to_string();
    data.mood_assessment.gds_wonderful_to_be_alive = "no".to_string();
    data.mood_assessment.gds_feels_full_of_energy = "no".to_string();
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-010"));
}

#[test]
fn fires_normal_nutrition_rule() {
    let data = create_fit_assessment();
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-018")); // MNA 14 = normal
}

#[test]
fn fires_normal_cognition_rule() {
    let data = create_fit_assessment();
    let (_level, fired_rules) = calculate_frailty(&data);
    assert!(fired_rules.iter().any(|r| r.id == "GER-020")); // MMSE 28 >= 25
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
