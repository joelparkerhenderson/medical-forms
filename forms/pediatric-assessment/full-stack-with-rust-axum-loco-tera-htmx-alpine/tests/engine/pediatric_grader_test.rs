use pediatric_assessment_tera_crate::engine::pediatric_grader::calculate_concern;
use pediatric_assessment_tera_crate::engine::pediatric_rules::all_rules;
use pediatric_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_healthy_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient & Parent Information (non-scored)
    data.patient_parent_information.patient_name = "Emma Johnson".to_string();
    data.patient_parent_information.date_of_birth = "2024-06-15".to_string();
    data.patient_parent_information.age_months = "13to24".to_string();
    data.patient_parent_information.sex = "female".to_string();
    data.patient_parent_information.parent_guardian_name = "Sarah Johnson".to_string();
    data.patient_parent_information.relationship = "mother".to_string();
    data.patient_parent_information.phone_number = "555-0123".to_string();
    data.patient_parent_information.pediatrician_name = "Dr Martinez".to_string();

    // Birth & Neonatal History (non-scored)
    data.birth_neonatal_history.gestational_age_weeks = Some(39);
    data.birth_neonatal_history.birth_weight_grams = Some(3200);
    data.birth_neonatal_history.delivery_type = "vaginal".to_string();
    data.birth_neonatal_history.birth_complications = "none".to_string();
    data.birth_neonatal_history.nicu_admission = "no".to_string();
    data.birth_neonatal_history.apgar_score_1min = Some(8);
    data.birth_neonatal_history.apgar_score_5min = Some(9);

    // Growth & Development — all 4s (Good)
    data.growth_development.weight_percentile = Some(4);
    data.growth_development.height_percentile = Some(4);
    data.growth_development.head_circumference_percentile = Some(4);
    data.growth_development.growth_trend = "steady".to_string();
    data.growth_development.weight_for_length = Some(4);
    data.growth_development.bmi_percentile = Some(4);

    // Immunization Status (non-scored)
    data.immunization_status.immunizations_up_to_date = "yes".to_string();
    data.immunization_status.missing_vaccines = "none".to_string();
    data.immunization_status.vaccine_refusal = "no".to_string();

    // Feeding & Nutrition — scored items at 4
    data.feeding_nutrition.feeding_type = "familyDiet".to_string();
    data.feeding_nutrition.feeding_difficulty = "no".to_string();
    data.feeding_nutrition.diet_variety = Some(4);
    data.feeding_nutrition.daily_milk_intake = "500to750ml".to_string();
    data.feeding_nutrition.vitamin_supplementation = "yes".to_string();
    data.feeding_nutrition.food_allergies = "none".to_string();
    data.feeding_nutrition.appetite_concern = Some(4);

    // Developmental Milestones — all 4s
    data.developmental_milestones.gross_motor = Some(4);
    data.developmental_milestones.fine_motor = Some(4);
    data.developmental_milestones.language_expressive = Some(4);
    data.developmental_milestones.language_receptive = Some(4);
    data.developmental_milestones.social_emotional = Some(4);
    data.developmental_milestones.cognitive = Some(4);
    data.developmental_milestones.self_care = Some(4);

    // Behavioral Assessment — all 4s
    data.behavioral_assessment.sleep_quality = Some(4);
    data.behavioral_assessment.sleep_hours = "10to12".to_string();
    data.behavioral_assessment.tantrums_frequency = Some(4);
    data.behavioral_assessment.screen_time_hours = "lessThan1".to_string();
    data.behavioral_assessment.social_interaction = Some(4);
    data.behavioral_assessment.attention_span = Some(4);
    data.behavioral_assessment.anxiety_level = Some(4);

    // Family & Social History — scored items at 4
    data.family_social_history.family_chronic_conditions = "none".to_string();
    data.family_social_history.family_mental_health = "none".to_string();
    data.family_social_history.household_size = "3to4".to_string();
    data.family_social_history.daycare_school = "daycare".to_string();
    data.family_social_history.secondhand_smoke = "no".to_string();
    data.family_social_history.home_safety = Some(4);
    data.family_social_history.parental_stress = Some(4);

    // Systems Review — all 4s
    data.systems_review.respiratory_concerns = Some(4);
    data.systems_review.gastrointestinal_concerns = Some(4);
    data.systems_review.skin_concerns = Some(4);
    data.systems_review.musculoskeletal_concerns = Some(4);
    data.systems_review.neurological_concerns = Some(4);
    data.systems_review.ent_concerns = Some(4);
    data.systems_review.urinary_concerns = Some(4);

    // Clinical Review — scored item at 4
    data.clinical_review.overall_health_impression = Some(4);
    data.clinical_review.current_medications = "none".to_string();
    data.clinical_review.known_allergies = "none".to_string();
    data.clinical_review.recent_hospitalizations = "none".to_string();
    data.clinical_review.specialist_referrals_needed = "no".to_string();
    data.clinical_review.follow_up_interval = "12months".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_concern(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_minor_concern_for_all_fours() {
    let data = create_healthy_assessment();
    let (level, score, _fired_rules) = calculate_concern(&data);
    assert_eq!(level, "minorConcern");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn returns_well_child_for_all_fives() {
    let mut data = create_healthy_assessment();
    // Set all Likert items to 5
    data.growth_development.weight_percentile = Some(5);
    data.growth_development.height_percentile = Some(5);
    data.growth_development.head_circumference_percentile = Some(5);
    data.feeding_nutrition.diet_variety = Some(5);
    data.feeding_nutrition.appetite_concern = Some(5);
    data.developmental_milestones.gross_motor = Some(5);
    data.developmental_milestones.fine_motor = Some(5);
    data.developmental_milestones.language_expressive = Some(5);
    data.developmental_milestones.language_receptive = Some(5);
    data.developmental_milestones.social_emotional = Some(5);
    data.developmental_milestones.cognitive = Some(5);
    data.developmental_milestones.self_care = Some(5);
    data.behavioral_assessment.sleep_quality = Some(5);
    data.behavioral_assessment.tantrums_frequency = Some(5);
    data.behavioral_assessment.social_interaction = Some(5);
    data.behavioral_assessment.attention_span = Some(5);
    data.behavioral_assessment.anxiety_level = Some(5);
    data.family_social_history.home_safety = Some(5);
    data.family_social_history.parental_stress = Some(5);
    data.systems_review.respiratory_concerns = Some(5);
    data.systems_review.gastrointestinal_concerns = Some(5);
    data.systems_review.skin_concerns = Some(5);
    data.systems_review.musculoskeletal_concerns = Some(5);
    data.systems_review.neurological_concerns = Some(5);
    data.systems_review.ent_concerns = Some(5);
    data.systems_review.urinary_concerns = Some(5);
    data.clinical_review.overall_health_impression = Some(5);

    let (level, score, _fired_rules) = calculate_concern(&data);
    assert_eq!(level, "wellChild");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_urgent_for_all_ones() {
    let mut data = create_healthy_assessment();
    // Set all Likert items to 1
    data.growth_development.weight_percentile = Some(1);
    data.growth_development.height_percentile = Some(1);
    data.growth_development.head_circumference_percentile = Some(1);
    data.feeding_nutrition.diet_variety = Some(1);
    data.feeding_nutrition.appetite_concern = Some(1);
    data.developmental_milestones.gross_motor = Some(1);
    data.developmental_milestones.fine_motor = Some(1);
    data.developmental_milestones.language_expressive = Some(1);
    data.developmental_milestones.language_receptive = Some(1);
    data.developmental_milestones.social_emotional = Some(1);
    data.developmental_milestones.cognitive = Some(1);
    data.developmental_milestones.self_care = Some(1);
    data.behavioral_assessment.sleep_quality = Some(1);
    data.behavioral_assessment.tantrums_frequency = Some(1);
    data.behavioral_assessment.social_interaction = Some(1);
    data.behavioral_assessment.attention_span = Some(1);
    data.behavioral_assessment.anxiety_level = Some(1);
    data.family_social_history.home_safety = Some(1);
    data.family_social_history.parental_stress = Some(1);
    data.systems_review.respiratory_concerns = Some(1);
    data.systems_review.gastrointestinal_concerns = Some(1);
    data.systems_review.skin_concerns = Some(1);
    data.systems_review.musculoskeletal_concerns = Some(1);
    data.systems_review.neurological_concerns = Some(1);
    data.systems_review.ent_concerns = Some(1);
    data.systems_review.urinary_concerns = Some(1);
    data.clinical_review.overall_health_impression = Some(1);

    let (level, score, fired_rules) = calculate_concern(&data);
    assert_eq!(level, "urgent");
    assert_eq!(score, 0.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_moderate_concern_for_all_threes() {
    let mut data = create_healthy_assessment();
    // Set all Likert items to 3
    data.growth_development.weight_percentile = Some(3);
    data.growth_development.height_percentile = Some(3);
    data.growth_development.head_circumference_percentile = Some(3);
    data.feeding_nutrition.diet_variety = Some(3);
    data.feeding_nutrition.appetite_concern = Some(3);
    data.developmental_milestones.gross_motor = Some(3);
    data.developmental_milestones.fine_motor = Some(3);
    data.developmental_milestones.language_expressive = Some(3);
    data.developmental_milestones.language_receptive = Some(3);
    data.developmental_milestones.social_emotional = Some(3);
    data.developmental_milestones.cognitive = Some(3);
    data.developmental_milestones.self_care = Some(3);
    data.behavioral_assessment.sleep_quality = Some(3);
    data.behavioral_assessment.tantrums_frequency = Some(3);
    data.behavioral_assessment.social_interaction = Some(3);
    data.behavioral_assessment.attention_span = Some(3);
    data.behavioral_assessment.anxiety_level = Some(3);
    data.family_social_history.home_safety = Some(3);
    data.family_social_history.parental_stress = Some(3);
    data.systems_review.respiratory_concerns = Some(3);
    data.systems_review.gastrointestinal_concerns = Some(3);
    data.systems_review.skin_concerns = Some(3);
    data.systems_review.musculoskeletal_concerns = Some(3);
    data.systems_review.neurological_concerns = Some(3);
    data.systems_review.ent_concerns = Some(3);
    data.systems_review.urinary_concerns = Some(3);
    data.clinical_review.overall_health_impression = Some(3);

    let (level, score, _fired_rules) = calculate_concern(&data);
    assert_eq!(level, "moderateConcern");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn fires_preterm_birth_rule() {
    let mut data = create_healthy_assessment();
    data.birth_neonatal_history.gestational_age_weeks = Some(28);

    let (_level, _score, fired_rules) = calculate_concern(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PED-003"));
}

#[test]
fn fires_immunization_concern_rule() {
    let mut data = create_healthy_assessment();
    data.immunization_status.immunizations_up_to_date = "no".to_string();

    let (_level, _score, fired_rules) = calculate_concern(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PED-006"));
}

#[test]
fn fires_language_delay_rule() {
    let mut data = create_healthy_assessment();
    data.developmental_milestones.language_expressive = Some(1);

    let (_level, _score, fired_rules) = calculate_concern(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PED-008")); // Language expressive 1-2
}

#[test]
fn fires_positive_rules_for_excellent_development() {
    let mut data = create_healthy_assessment();
    // Set all developmental milestones to 5
    data.developmental_milestones.gross_motor = Some(5);
    data.developmental_milestones.fine_motor = Some(5);
    data.developmental_milestones.language_expressive = Some(5);
    data.developmental_milestones.language_receptive = Some(5);
    data.developmental_milestones.social_emotional = Some(5);
    data.developmental_milestones.cognitive = Some(5);
    data.developmental_milestones.self_care = Some(5);

    let (_level, _score, fired_rules) = calculate_concern(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PED-017")); // All milestones 4-5
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
