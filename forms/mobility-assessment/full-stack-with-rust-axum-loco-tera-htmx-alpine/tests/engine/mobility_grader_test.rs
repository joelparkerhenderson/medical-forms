use mobility_assessment_tera_crate::engine::mobility_grader::calculate_mobility;
use mobility_assessment_tera_crate::engine::mobility_rules::all_rules;
use mobility_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_minimal_assistance_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1958-06-15".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.referral_source = "consultant".to_string();
    data.patient_information.primary_diagnosis = "Hip fracture".to_string();
    data.patient_information.assessor_name = "Dr Johnson".to_string();
    data.patient_information.assessor_role = "physiotherapist".to_string();
    data.patient_information.setting = "inpatient".to_string();

    // Mobility History — all 4s
    data.mobility_history.pre_morbid_mobility = Some(4);
    data.mobility_history.current_mobility_level = Some(4);
    data.mobility_history.mobility_change_onset = "acute".to_string();
    data.mobility_history.mobility_change_duration = "1to4Weeks".to_string();
    data.mobility_history.pain_with_movement = Some(4);
    data.mobility_history.endurance_level = Some(4);

    // Balance Assessment — all 4s
    data.balance_assessment.static_sitting_balance = Some(4);
    data.balance_assessment.dynamic_sitting_balance = Some(4);
    data.balance_assessment.static_standing_balance = Some(4);
    data.balance_assessment.dynamic_standing_balance = Some(4);
    data.balance_assessment.single_leg_stance = Some(4);
    data.balance_assessment.tandem_stance = Some(4);

    // Gait Analysis — all 4s
    data.gait_analysis.gait_pattern_quality = Some(4);
    data.gait_analysis.gait_speed = Some(4);
    data.gait_analysis.step_length_symmetry = Some(4);
    data.gait_analysis.turning_ability = Some(4);
    data.gait_analysis.outdoor_walking = Some(4);
    data.gait_analysis.walking_endurance = Some(4);

    // Transfers & Bed Mobility — all 4s
    data.transfers_bed_mobility.bed_mobility = Some(4);
    data.transfers_bed_mobility.sit_to_stand = Some(4);
    data.transfers_bed_mobility.stand_to_sit = Some(4);
    data.transfers_bed_mobility.chair_transfer = Some(4);
    data.transfers_bed_mobility.toilet_transfer = Some(4);
    data.transfers_bed_mobility.car_transfer = Some(4);

    // Stairs & Obstacles — all 4s
    data.stairs_obstacles.stair_ascent = Some(4);
    data.stairs_obstacles.stair_descent = Some(4);
    data.stairs_obstacles.curb_negotiation = Some(4);
    data.stairs_obstacles.uneven_surfaces = Some(4);
    data.stairs_obstacles.obstacle_avoidance = Some(4);
    data.stairs_obstacles.ramp_navigation = Some(4);

    // Upper Limb Function — all 4s
    data.upper_limb_function.reaching_overhead = Some(4);
    data.upper_limb_function.grip_strength = Some(4);
    data.upper_limb_function.fine_motor_control = Some(4);
    data.upper_limb_function.bilateral_coordination = Some(4);
    data.upper_limb_function.upper_limb_weight_bearing = Some(4);
    data.upper_limb_function.functional_reach = Some(4);

    // Assistive Devices — all 4s
    data.assistive_devices.current_device_type = "walkingStick".to_string();
    data.assistive_devices.device_usage_competence = Some(4);
    data.assistive_devices.device_condition = Some(4);
    data.assistive_devices.wheelchair_skills = Some(4);

    // Falls Risk Assessment — low risk
    data.falls_risk_assessment.falls_in_past_year = "none".to_string();
    data.falls_risk_assessment.fear_of_falling = Some(4);
    data.falls_risk_assessment.medication_fall_risk = Some(4);
    data.falls_risk_assessment.postural_hypotension = Some(4);
    data.falls_risk_assessment.vision_impairment = Some(4);
    data.falls_risk_assessment.cognitive_impact_on_mobility = Some(4);

    // Clinical Review — all 4s
    data.clinical_review.overall_mobility_rating = Some(4);
    data.clinical_review.rehabilitation_potential = Some(4);

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_mobility(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_minimal_assistance_for_all_fours() {
    let data = create_minimal_assistance_assessment();
    let (level, score, _fired_rules) = calculate_mobility(&data);
    assert_eq!(level, "minimalAssistance");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn returns_independent_for_all_fives() {
    let mut data = create_minimal_assistance_assessment();
    // Set all Likert items to 5
    data.mobility_history.pre_morbid_mobility = Some(5);
    data.mobility_history.current_mobility_level = Some(5);
    data.mobility_history.pain_with_movement = Some(5);
    data.mobility_history.endurance_level = Some(5);
    data.balance_assessment.static_sitting_balance = Some(5);
    data.balance_assessment.dynamic_sitting_balance = Some(5);
    data.balance_assessment.static_standing_balance = Some(5);
    data.balance_assessment.dynamic_standing_balance = Some(5);
    data.balance_assessment.single_leg_stance = Some(5);
    data.balance_assessment.tandem_stance = Some(5);
    data.gait_analysis.gait_pattern_quality = Some(5);
    data.gait_analysis.gait_speed = Some(5);
    data.gait_analysis.step_length_symmetry = Some(5);
    data.gait_analysis.turning_ability = Some(5);
    data.gait_analysis.outdoor_walking = Some(5);
    data.gait_analysis.walking_endurance = Some(5);
    data.transfers_bed_mobility.bed_mobility = Some(5);
    data.transfers_bed_mobility.sit_to_stand = Some(5);
    data.transfers_bed_mobility.stand_to_sit = Some(5);
    data.transfers_bed_mobility.chair_transfer = Some(5);
    data.transfers_bed_mobility.toilet_transfer = Some(5);
    data.transfers_bed_mobility.car_transfer = Some(5);
    data.stairs_obstacles.stair_ascent = Some(5);
    data.stairs_obstacles.stair_descent = Some(5);
    data.stairs_obstacles.curb_negotiation = Some(5);
    data.stairs_obstacles.uneven_surfaces = Some(5);
    data.stairs_obstacles.obstacle_avoidance = Some(5);
    data.stairs_obstacles.ramp_navigation = Some(5);
    data.upper_limb_function.reaching_overhead = Some(5);
    data.upper_limb_function.grip_strength = Some(5);
    data.upper_limb_function.fine_motor_control = Some(5);
    data.upper_limb_function.bilateral_coordination = Some(5);
    data.upper_limb_function.upper_limb_weight_bearing = Some(5);
    data.upper_limb_function.functional_reach = Some(5);
    data.assistive_devices.device_usage_competence = Some(5);
    data.assistive_devices.device_condition = Some(5);
    data.assistive_devices.wheelchair_skills = Some(5);
    data.falls_risk_assessment.fear_of_falling = Some(5);
    data.falls_risk_assessment.medication_fall_risk = Some(5);
    data.falls_risk_assessment.postural_hypotension = Some(5);
    data.falls_risk_assessment.vision_impairment = Some(5);
    data.falls_risk_assessment.cognitive_impact_on_mobility = Some(5);
    data.clinical_review.overall_mobility_rating = Some(5);
    data.clinical_review.rehabilitation_potential = Some(5);

    let (level, score, _fired_rules) = calculate_mobility(&data);
    assert_eq!(level, "independent");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_dependent_for_all_ones() {
    let mut data = create_minimal_assistance_assessment();
    // Set all Likert items to 1
    data.mobility_history.pre_morbid_mobility = Some(1);
    data.mobility_history.current_mobility_level = Some(1);
    data.mobility_history.pain_with_movement = Some(1);
    data.mobility_history.endurance_level = Some(1);
    data.balance_assessment.static_sitting_balance = Some(1);
    data.balance_assessment.dynamic_sitting_balance = Some(1);
    data.balance_assessment.static_standing_balance = Some(1);
    data.balance_assessment.dynamic_standing_balance = Some(1);
    data.balance_assessment.single_leg_stance = Some(1);
    data.balance_assessment.tandem_stance = Some(1);
    data.gait_analysis.gait_pattern_quality = Some(1);
    data.gait_analysis.gait_speed = Some(1);
    data.gait_analysis.step_length_symmetry = Some(1);
    data.gait_analysis.turning_ability = Some(1);
    data.gait_analysis.outdoor_walking = Some(1);
    data.gait_analysis.walking_endurance = Some(1);
    data.transfers_bed_mobility.bed_mobility = Some(1);
    data.transfers_bed_mobility.sit_to_stand = Some(1);
    data.transfers_bed_mobility.stand_to_sit = Some(1);
    data.transfers_bed_mobility.chair_transfer = Some(1);
    data.transfers_bed_mobility.toilet_transfer = Some(1);
    data.transfers_bed_mobility.car_transfer = Some(1);
    data.stairs_obstacles.stair_ascent = Some(1);
    data.stairs_obstacles.stair_descent = Some(1);
    data.stairs_obstacles.curb_negotiation = Some(1);
    data.stairs_obstacles.uneven_surfaces = Some(1);
    data.stairs_obstacles.obstacle_avoidance = Some(1);
    data.stairs_obstacles.ramp_navigation = Some(1);
    data.upper_limb_function.reaching_overhead = Some(1);
    data.upper_limb_function.grip_strength = Some(1);
    data.upper_limb_function.fine_motor_control = Some(1);
    data.upper_limb_function.bilateral_coordination = Some(1);
    data.upper_limb_function.upper_limb_weight_bearing = Some(1);
    data.upper_limb_function.functional_reach = Some(1);
    data.assistive_devices.device_usage_competence = Some(1);
    data.assistive_devices.device_condition = Some(1);
    data.assistive_devices.wheelchair_skills = Some(1);
    data.falls_risk_assessment.falls_in_past_year = "twoOrMore".to_string();
    data.falls_risk_assessment.fear_of_falling = Some(1);
    data.falls_risk_assessment.medication_fall_risk = Some(1);
    data.falls_risk_assessment.postural_hypotension = Some(1);
    data.falls_risk_assessment.vision_impairment = Some(1);
    data.falls_risk_assessment.cognitive_impact_on_mobility = Some(1);
    data.clinical_review.overall_mobility_rating = Some(1);
    data.clinical_review.rehabilitation_potential = Some(1);

    let (level, score, fired_rules) = calculate_mobility(&data);
    assert_eq!(level, "dependent");
    assert_eq!(score, 0.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_moderate_assistance_for_all_threes() {
    let mut data = create_minimal_assistance_assessment();
    // Set all Likert items to 3
    data.mobility_history.pre_morbid_mobility = Some(3);
    data.mobility_history.current_mobility_level = Some(3);
    data.mobility_history.pain_with_movement = Some(3);
    data.mobility_history.endurance_level = Some(3);
    data.balance_assessment.static_sitting_balance = Some(3);
    data.balance_assessment.dynamic_sitting_balance = Some(3);
    data.balance_assessment.static_standing_balance = Some(3);
    data.balance_assessment.dynamic_standing_balance = Some(3);
    data.balance_assessment.single_leg_stance = Some(3);
    data.balance_assessment.tandem_stance = Some(3);
    data.gait_analysis.gait_pattern_quality = Some(3);
    data.gait_analysis.gait_speed = Some(3);
    data.gait_analysis.step_length_symmetry = Some(3);
    data.gait_analysis.turning_ability = Some(3);
    data.gait_analysis.outdoor_walking = Some(3);
    data.gait_analysis.walking_endurance = Some(3);
    data.transfers_bed_mobility.bed_mobility = Some(3);
    data.transfers_bed_mobility.sit_to_stand = Some(3);
    data.transfers_bed_mobility.stand_to_sit = Some(3);
    data.transfers_bed_mobility.chair_transfer = Some(3);
    data.transfers_bed_mobility.toilet_transfer = Some(3);
    data.transfers_bed_mobility.car_transfer = Some(3);
    data.stairs_obstacles.stair_ascent = Some(3);
    data.stairs_obstacles.stair_descent = Some(3);
    data.stairs_obstacles.curb_negotiation = Some(3);
    data.stairs_obstacles.uneven_surfaces = Some(3);
    data.stairs_obstacles.obstacle_avoidance = Some(3);
    data.stairs_obstacles.ramp_navigation = Some(3);
    data.upper_limb_function.reaching_overhead = Some(3);
    data.upper_limb_function.grip_strength = Some(3);
    data.upper_limb_function.fine_motor_control = Some(3);
    data.upper_limb_function.bilateral_coordination = Some(3);
    data.upper_limb_function.upper_limb_weight_bearing = Some(3);
    data.upper_limb_function.functional_reach = Some(3);
    data.assistive_devices.device_usage_competence = Some(3);
    data.assistive_devices.device_condition = Some(3);
    data.assistive_devices.wheelchair_skills = Some(3);
    data.falls_risk_assessment.fear_of_falling = Some(3);
    data.falls_risk_assessment.medication_fall_risk = Some(3);
    data.falls_risk_assessment.postural_hypotension = Some(3);
    data.falls_risk_assessment.vision_impairment = Some(3);
    data.falls_risk_assessment.cognitive_impact_on_mobility = Some(3);
    data.clinical_review.overall_mobility_rating = Some(3);
    data.clinical_review.rehabilitation_potential = Some(3);

    let (level, score, _fired_rules) = calculate_mobility(&data);
    assert_eq!(level, "moderateAssistance");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn fires_recurrent_falls_rule() {
    let mut data = create_minimal_assistance_assessment();
    data.falls_risk_assessment.falls_in_past_year = "twoOrMore".to_string();

    let (_level, _score, fired_rules) = calculate_mobility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MOB-011"));
}

#[test]
fn fires_recurrent_falls_with_fear_high_concern_rule() {
    let mut data = create_minimal_assistance_assessment();
    data.falls_risk_assessment.falls_in_past_year = "twoOrMore".to_string();
    data.falls_risk_assessment.fear_of_falling = Some(1);

    let (_level, _score, fired_rules) = calculate_mobility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MOB-003"));
}

#[test]
fn fires_positive_balance_rule_for_excellent_scores() {
    let mut data = create_minimal_assistance_assessment();
    // Set all balance items to 5
    data.balance_assessment.static_sitting_balance = Some(5);
    data.balance_assessment.dynamic_sitting_balance = Some(5);
    data.balance_assessment.static_standing_balance = Some(5);
    data.balance_assessment.dynamic_standing_balance = Some(5);
    data.balance_assessment.single_leg_stance = Some(5);
    data.balance_assessment.tandem_stance = Some(5);

    let (_level, _score, fired_rules) = calculate_mobility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MOB-017")); // All balance 4-5
}

#[test]
fn fires_no_falls_low_concern_rule() {
    let mut data = create_minimal_assistance_assessment();
    data.falls_risk_assessment.falls_in_past_year = "none".to_string();
    data.falls_risk_assessment.fear_of_falling = Some(5);

    let (_level, _score, fired_rules) = calculate_mobility(&data);
    assert!(fired_rules.iter().any(|r| r.id == "MOB-020"));
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
