use occupational_therapy_assessment_tera_crate::engine::ot_grader::calculate_function_level;
use occupational_therapy_assessment_tera_crate::engine::ot_rules::all_rules;
use occupational_therapy_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1960-05-15".to_string();
    data.patient_information.gender = "female".to_string();
    data.patient_information.referral_source = "physician".to_string();
    data.patient_information.referral_date = "2026-02-20".to_string();
    data.patient_information.diagnosis = "CVA".to_string();
    data.patient_information.therapist_name = "Sarah Johnson, OTR/L".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();

    // Occupational Profile (non-scored)
    data.occupational_profile.living_situation = "withSpouse".to_string();
    data.occupational_profile.primary_roles = "Homemaker".to_string();
    data.occupational_profile.prior_functional_level = "independent".to_string();
    data.occupational_profile.current_concerns = "Difficulty with self-care".to_string();
    data.occupational_profile.patient_goals = "Return to independent living".to_string();
    data.occupational_profile.support_system = "Spouse, adult daughter".to_string();

    // Daily Living Activities — all 4s (Minimal Assist)
    data.daily_living_activities.feeding = Some(4);
    data.daily_living_activities.bathing = Some(4);
    data.daily_living_activities.dressing_upper = Some(4);
    data.daily_living_activities.dressing_lower = Some(4);
    data.daily_living_activities.grooming = Some(4);
    data.daily_living_activities.toileting = Some(4);
    data.daily_living_activities.transfers = Some(4);
    data.daily_living_activities.mobility = Some(4);

    // Instrumental Activities — all 4s
    data.instrumental_activities.meal_preparation = Some(4);
    data.instrumental_activities.household_management = Some(4);
    data.instrumental_activities.medication_management = Some(4);
    data.instrumental_activities.financial_management = Some(4);
    data.instrumental_activities.community_mobility = Some(4);
    data.instrumental_activities.shopping = Some(4);
    data.instrumental_activities.telephone_use = Some(4);

    // Cognitive & Perceptual — all 4s
    data.cognitive_perceptual.orientation = Some(4);
    data.cognitive_perceptual.attention = Some(4);
    data.cognitive_perceptual.memory = Some(4);
    data.cognitive_perceptual.problem_solving = Some(4);
    data.cognitive_perceptual.safety_awareness = Some(4);
    data.cognitive_perceptual.visual_perception = Some(4);
    data.cognitive_perceptual.sequencing = Some(4);

    // Motor & Sensory — all 4s
    data.motor_sensory.upper_extremity_strength = Some(4);
    data.motor_sensory.lower_extremity_strength = Some(4);
    data.motor_sensory.range_of_motion = Some(4);
    data.motor_sensory.fine_motor_coordination = Some(4);
    data.motor_sensory.gross_motor_coordination = Some(4);
    data.motor_sensory.balance = Some(4);
    data.motor_sensory.sensation = Some(4);
    data.motor_sensory.endurance = Some(4);

    // Home Environment — all 4s
    data.home_environment.home_accessibility = Some(4);
    data.home_environment.bathroom_safety = Some(4);
    data.home_environment.kitchen_safety = Some(4);
    data.home_environment.fall_risk_factors = Some(4);
    data.home_environment.adaptive_equipment_needs = "None".to_string();
    data.home_environment.home_modification_needs = "None".to_string();

    // Work & Leisure — all 4s
    data.work_leisure.employment_status = "retired".to_string();
    data.work_leisure.return_to_work_potential = Some(4);
    data.work_leisure.leisure_participation = Some(4);
    data.work_leisure.social_participation = Some(4);
    data.work_leisure.community_integration = Some(4);

    // Goals & Priorities
    data.goals_priorities.short_term_goals = "Independent dressing".to_string();
    data.goals_priorities.long_term_goals = "Return to meal preparation".to_string();
    data.goals_priorities.motivation_level = Some(4);

    // Clinical Review
    data.clinical_review.pain_level = Some(2);
    data.clinical_review.fatigue_level = Some(2);
    data.clinical_review.emotional_status = Some(4);
    data.clinical_review.skin_integrity = Some(4);
    data.clinical_review.recommended_frequency = "3xWeek".to_string();
    data.clinical_review.recommended_duration = "8weeks".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_function_level(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_independent_for_all_fours() {
    let data = create_moderate_assessment();
    let (level, score, _fired_rules) = calculate_function_level(&data);
    assert_eq!(level, "independent");
    assert_eq!(score, 73.0); // Most items are 4, but pain=2 and fatigue=2 lower the average
}

#[test]
fn returns_independent_for_all_fives() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 5
    data.daily_living_activities.feeding = Some(5);
    data.daily_living_activities.bathing = Some(5);
    data.daily_living_activities.dressing_upper = Some(5);
    data.daily_living_activities.dressing_lower = Some(5);
    data.daily_living_activities.grooming = Some(5);
    data.daily_living_activities.toileting = Some(5);
    data.daily_living_activities.transfers = Some(5);
    data.daily_living_activities.mobility = Some(5);
    data.instrumental_activities.meal_preparation = Some(5);
    data.instrumental_activities.household_management = Some(5);
    data.instrumental_activities.medication_management = Some(5);
    data.instrumental_activities.financial_management = Some(5);
    data.instrumental_activities.community_mobility = Some(5);
    data.instrumental_activities.shopping = Some(5);
    data.instrumental_activities.telephone_use = Some(5);
    data.cognitive_perceptual.orientation = Some(5);
    data.cognitive_perceptual.attention = Some(5);
    data.cognitive_perceptual.memory = Some(5);
    data.cognitive_perceptual.problem_solving = Some(5);
    data.cognitive_perceptual.safety_awareness = Some(5);
    data.cognitive_perceptual.visual_perception = Some(5);
    data.cognitive_perceptual.sequencing = Some(5);
    data.motor_sensory.upper_extremity_strength = Some(5);
    data.motor_sensory.lower_extremity_strength = Some(5);
    data.motor_sensory.range_of_motion = Some(5);
    data.motor_sensory.fine_motor_coordination = Some(5);
    data.motor_sensory.gross_motor_coordination = Some(5);
    data.motor_sensory.balance = Some(5);
    data.motor_sensory.sensation = Some(5);
    data.motor_sensory.endurance = Some(5);
    data.home_environment.home_accessibility = Some(5);
    data.home_environment.bathroom_safety = Some(5);
    data.home_environment.kitchen_safety = Some(5);
    data.home_environment.fall_risk_factors = Some(5);
    data.work_leisure.return_to_work_potential = Some(5);
    data.work_leisure.leisure_participation = Some(5);
    data.work_leisure.social_participation = Some(5);
    data.work_leisure.community_integration = Some(5);
    data.goals_priorities.motivation_level = Some(5);
    data.clinical_review.pain_level = Some(5);
    data.clinical_review.fatigue_level = Some(5);
    data.clinical_review.emotional_status = Some(5);
    data.clinical_review.skin_integrity = Some(5);

    let (level, score, _fired_rules) = calculate_function_level(&data);
    assert_eq!(level, "independent");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_dependent_for_all_ones() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 1
    data.daily_living_activities.feeding = Some(1);
    data.daily_living_activities.bathing = Some(1);
    data.daily_living_activities.dressing_upper = Some(1);
    data.daily_living_activities.dressing_lower = Some(1);
    data.daily_living_activities.grooming = Some(1);
    data.daily_living_activities.toileting = Some(1);
    data.daily_living_activities.transfers = Some(1);
    data.daily_living_activities.mobility = Some(1);
    data.instrumental_activities.meal_preparation = Some(1);
    data.instrumental_activities.household_management = Some(1);
    data.instrumental_activities.medication_management = Some(1);
    data.instrumental_activities.financial_management = Some(1);
    data.instrumental_activities.community_mobility = Some(1);
    data.instrumental_activities.shopping = Some(1);
    data.instrumental_activities.telephone_use = Some(1);
    data.cognitive_perceptual.orientation = Some(1);
    data.cognitive_perceptual.attention = Some(1);
    data.cognitive_perceptual.memory = Some(1);
    data.cognitive_perceptual.problem_solving = Some(1);
    data.cognitive_perceptual.safety_awareness = Some(1);
    data.cognitive_perceptual.visual_perception = Some(1);
    data.cognitive_perceptual.sequencing = Some(1);
    data.motor_sensory.upper_extremity_strength = Some(1);
    data.motor_sensory.lower_extremity_strength = Some(1);
    data.motor_sensory.range_of_motion = Some(1);
    data.motor_sensory.fine_motor_coordination = Some(1);
    data.motor_sensory.gross_motor_coordination = Some(1);
    data.motor_sensory.balance = Some(1);
    data.motor_sensory.sensation = Some(1);
    data.motor_sensory.endurance = Some(1);
    data.home_environment.home_accessibility = Some(1);
    data.home_environment.bathroom_safety = Some(1);
    data.home_environment.kitchen_safety = Some(1);
    data.home_environment.fall_risk_factors = Some(1);
    data.work_leisure.return_to_work_potential = Some(1);
    data.work_leisure.leisure_participation = Some(1);
    data.work_leisure.social_participation = Some(1);
    data.work_leisure.community_integration = Some(1);
    data.goals_priorities.motivation_level = Some(1);
    data.clinical_review.pain_level = Some(1);
    data.clinical_review.fatigue_level = Some(1);
    data.clinical_review.emotional_status = Some(1);
    data.clinical_review.skin_integrity = Some(1);

    let (level, score, fired_rules) = calculate_function_level(&data);
    assert_eq!(level, "dependent");
    assert_eq!(score, 0.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_modified_for_all_threes() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 3
    data.daily_living_activities.feeding = Some(3);
    data.daily_living_activities.bathing = Some(3);
    data.daily_living_activities.dressing_upper = Some(3);
    data.daily_living_activities.dressing_lower = Some(3);
    data.daily_living_activities.grooming = Some(3);
    data.daily_living_activities.toileting = Some(3);
    data.daily_living_activities.transfers = Some(3);
    data.daily_living_activities.mobility = Some(3);
    data.instrumental_activities.meal_preparation = Some(3);
    data.instrumental_activities.household_management = Some(3);
    data.instrumental_activities.medication_management = Some(3);
    data.instrumental_activities.financial_management = Some(3);
    data.instrumental_activities.community_mobility = Some(3);
    data.instrumental_activities.shopping = Some(3);
    data.instrumental_activities.telephone_use = Some(3);
    data.cognitive_perceptual.orientation = Some(3);
    data.cognitive_perceptual.attention = Some(3);
    data.cognitive_perceptual.memory = Some(3);
    data.cognitive_perceptual.problem_solving = Some(3);
    data.cognitive_perceptual.safety_awareness = Some(3);
    data.cognitive_perceptual.visual_perception = Some(3);
    data.cognitive_perceptual.sequencing = Some(3);
    data.motor_sensory.upper_extremity_strength = Some(3);
    data.motor_sensory.lower_extremity_strength = Some(3);
    data.motor_sensory.range_of_motion = Some(3);
    data.motor_sensory.fine_motor_coordination = Some(3);
    data.motor_sensory.gross_motor_coordination = Some(3);
    data.motor_sensory.balance = Some(3);
    data.motor_sensory.sensation = Some(3);
    data.motor_sensory.endurance = Some(3);
    data.home_environment.home_accessibility = Some(3);
    data.home_environment.bathroom_safety = Some(3);
    data.home_environment.kitchen_safety = Some(3);
    data.home_environment.fall_risk_factors = Some(3);
    data.work_leisure.return_to_work_potential = Some(3);
    data.work_leisure.leisure_participation = Some(3);
    data.work_leisure.social_participation = Some(3);
    data.work_leisure.community_integration = Some(3);
    data.goals_priorities.motivation_level = Some(3);
    data.clinical_review.pain_level = Some(3);
    data.clinical_review.fatigue_level = Some(3);
    data.clinical_review.emotional_status = Some(3);
    data.clinical_review.skin_integrity = Some(3);

    let (level, score, _fired_rules) = calculate_function_level(&data);
    assert_eq!(level, "modified");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn fires_safety_awareness_rule() {
    let mut data = create_moderate_assessment();
    data.cognitive_perceptual.safety_awareness = Some(1);

    let (_level, _score, fired_rules) = calculate_function_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OT-001"));
}

#[test]
fn fires_balance_concern_rule() {
    let mut data = create_moderate_assessment();
    data.motor_sensory.balance = Some(1);

    let (_level, _score, fired_rules) = calculate_function_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OT-005"));
}

#[test]
fn fires_positive_adl_rule_for_high_scores() {
    let mut data = create_moderate_assessment();
    // All ADL items at 5
    data.daily_living_activities.feeding = Some(5);
    data.daily_living_activities.bathing = Some(5);
    data.daily_living_activities.dressing_upper = Some(5);
    data.daily_living_activities.dressing_lower = Some(5);
    data.daily_living_activities.grooming = Some(5);
    data.daily_living_activities.toileting = Some(5);
    data.daily_living_activities.transfers = Some(5);
    data.daily_living_activities.mobility = Some(5);

    let (_level, _score, fired_rules) = calculate_function_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OT-016")); // All ADL 4-5
}

#[test]
fn fires_motivation_rule_for_excellent() {
    let mut data = create_moderate_assessment();
    data.goals_priorities.motivation_level = Some(5);

    let (_level, _score, fired_rules) = calculate_function_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OT-018"));
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
