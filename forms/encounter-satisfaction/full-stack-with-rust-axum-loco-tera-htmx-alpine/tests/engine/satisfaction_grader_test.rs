use encounter_satisfaction_tera_crate::engine::satisfaction_grader::calculate_satisfaction;
use encounter_satisfaction_tera_crate::engine::satisfaction_rules::all_rules;
use encounter_satisfaction_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_satisfied_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Visit Information (non-scored)
    data.visit_information.visit_date = "2026-03-01".to_string();
    data.visit_information.department_name = "Cardiology".to_string();
    data.visit_information.provider_name = "Dr Smith".to_string();
    data.visit_information.provider_role = "doctor".to_string();
    data.visit_information.visit_type = "outpatient".to_string();
    data.visit_information.visit_duration = "30to60".to_string();
    data.visit_information.is_first_visit = "no".to_string();
    data.visit_information.referral_source = "gp".to_string();

    // Wait Time & Access — all 4s (Good)
    data.wait_time_access.ease_of_scheduling = Some(4);
    data.wait_time_access.appointment_wait_days = "4to7".to_string();
    data.wait_time_access.waiting_room_time = "15to30".to_string();
    data.wait_time_access.wait_time_acceptability = Some(4);
    data.wait_time_access.location_accessibility = Some(4);
    data.wait_time_access.signage_wayfinding = Some(4);

    // Communication — all 4s (Good)
    data.communication.provider_listening = Some(4);
    data.communication.provider_explaining = Some(4);
    data.communication.provider_respect = Some(4);
    data.communication.provider_time_adequacy = Some(4);
    data.communication.questions_encouraged = Some(4);
    data.communication.information_clarity = Some(4);
    data.communication.shared_decision_making = Some(4);

    // Care Quality — all 4s
    data.care_quality.thoroughness_of_examination = Some(4);
    data.care_quality.diagnosis_explanation = Some(4);
    data.care_quality.treatment_plan_clarity = Some(4);
    data.care_quality.confidence_in_provider = Some(4);
    data.care_quality.coordination_of_care = Some(4);
    data.care_quality.involvement_in_decisions = Some(4);

    // Staff Interaction — all 4s
    data.staff_interaction.reception_courtesy = Some(4);
    data.staff_interaction.nursing_responsiveness = Some(4);
    data.staff_interaction.staff_professionalism = Some(4);
    data.staff_interaction.staff_helpfulness = Some(4);
    data.staff_interaction.privacy_respected = Some(4);
    data.staff_interaction.team_coordination = Some(4);

    // Environment — all 4s
    data.environment.facility_cleanliness = Some(4);
    data.environment.facility_comfort = Some(4);
    data.environment.noise_level = Some(4);
    data.environment.privacy_adequacy = Some(4);
    data.environment.equipment_condition = Some(4);
    data.environment.overall_ambience = Some(4);

    // Medication & Treatment — all 4s
    data.medication_treatment.medication_explanation = Some(4);
    data.medication_treatment.side_effects_explained = Some(4);
    data.medication_treatment.pain_management = Some(4);
    data.medication_treatment.treatment_effectiveness = Some(4);
    data.medication_treatment.alternatives_discussed = Some(4);
    data.medication_treatment.medications_provided = "yes".to_string();

    // Discharge & Follow-up — all 4s
    data.discharge_follow_up.discharge_instruction_clarity = Some(4);
    data.discharge_follow_up.follow_up_plan_explained = Some(4);
    data.discharge_follow_up.self_care_instructions = Some(4);
    data.discharge_follow_up.warning_signs_explained = Some(4);
    data.discharge_follow_up.contact_information_provided = Some(4);
    data.discharge_follow_up.follow_up_appointment_scheduled = "yes".to_string();

    // Overall Experience — all 4s, NPS 8
    data.overall_experience.overall_satisfaction = Some(4);
    data.overall_experience.likelihood_to_recommend = Some(8);
    data.overall_experience.met_expectations = Some(4);
    data.overall_experience.would_return_for_care = Some(4);
    data.overall_experience.emotional_experience = "positive".to_string();

    // Demographics
    data.demographics_comments.patient_age = "35to44".to_string();
    data.demographics_comments.patient_sex = "female".to_string();
    data.demographics_comments.is_return_patient = "yes".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_satisfaction(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_satisfied_for_all_fours() {
    let data = create_satisfied_assessment();
    let (level, score, _fired_rules) = calculate_satisfaction(&data);
    assert_eq!(level, "satisfied");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn returns_very_satisfied_for_all_fives() {
    let mut data = create_satisfied_assessment();
    // Set all Likert items to 5
    data.wait_time_access.ease_of_scheduling = Some(5);
    data.wait_time_access.wait_time_acceptability = Some(5);
    data.wait_time_access.location_accessibility = Some(5);
    data.wait_time_access.signage_wayfinding = Some(5);
    data.communication.provider_listening = Some(5);
    data.communication.provider_explaining = Some(5);
    data.communication.provider_respect = Some(5);
    data.communication.provider_time_adequacy = Some(5);
    data.communication.questions_encouraged = Some(5);
    data.communication.information_clarity = Some(5);
    data.communication.shared_decision_making = Some(5);
    data.care_quality.thoroughness_of_examination = Some(5);
    data.care_quality.diagnosis_explanation = Some(5);
    data.care_quality.treatment_plan_clarity = Some(5);
    data.care_quality.confidence_in_provider = Some(5);
    data.care_quality.coordination_of_care = Some(5);
    data.care_quality.involvement_in_decisions = Some(5);
    data.staff_interaction.reception_courtesy = Some(5);
    data.staff_interaction.nursing_responsiveness = Some(5);
    data.staff_interaction.staff_professionalism = Some(5);
    data.staff_interaction.staff_helpfulness = Some(5);
    data.staff_interaction.privacy_respected = Some(5);
    data.staff_interaction.team_coordination = Some(5);
    data.environment.facility_cleanliness = Some(5);
    data.environment.facility_comfort = Some(5);
    data.environment.noise_level = Some(5);
    data.environment.privacy_adequacy = Some(5);
    data.environment.equipment_condition = Some(5);
    data.environment.overall_ambience = Some(5);
    data.medication_treatment.medication_explanation = Some(5);
    data.medication_treatment.side_effects_explained = Some(5);
    data.medication_treatment.pain_management = Some(5);
    data.medication_treatment.treatment_effectiveness = Some(5);
    data.medication_treatment.alternatives_discussed = Some(5);
    data.discharge_follow_up.discharge_instruction_clarity = Some(5);
    data.discharge_follow_up.follow_up_plan_explained = Some(5);
    data.discharge_follow_up.self_care_instructions = Some(5);
    data.discharge_follow_up.warning_signs_explained = Some(5);
    data.discharge_follow_up.contact_information_provided = Some(5);
    data.overall_experience.overall_satisfaction = Some(5);
    data.overall_experience.met_expectations = Some(5);
    data.overall_experience.would_return_for_care = Some(5);

    let (level, score, _fired_rules) = calculate_satisfaction(&data);
    assert_eq!(level, "verySatisfied");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_very_dissatisfied_for_all_ones() {
    let mut data = create_satisfied_assessment();
    // Set all Likert items to 1
    data.wait_time_access.ease_of_scheduling = Some(1);
    data.wait_time_access.wait_time_acceptability = Some(1);
    data.wait_time_access.location_accessibility = Some(1);
    data.wait_time_access.signage_wayfinding = Some(1);
    data.communication.provider_listening = Some(1);
    data.communication.provider_explaining = Some(1);
    data.communication.provider_respect = Some(1);
    data.communication.provider_time_adequacy = Some(1);
    data.communication.questions_encouraged = Some(1);
    data.communication.information_clarity = Some(1);
    data.communication.shared_decision_making = Some(1);
    data.care_quality.thoroughness_of_examination = Some(1);
    data.care_quality.diagnosis_explanation = Some(1);
    data.care_quality.treatment_plan_clarity = Some(1);
    data.care_quality.confidence_in_provider = Some(1);
    data.care_quality.coordination_of_care = Some(1);
    data.care_quality.involvement_in_decisions = Some(1);
    data.staff_interaction.reception_courtesy = Some(1);
    data.staff_interaction.nursing_responsiveness = Some(1);
    data.staff_interaction.staff_professionalism = Some(1);
    data.staff_interaction.staff_helpfulness = Some(1);
    data.staff_interaction.privacy_respected = Some(1);
    data.staff_interaction.team_coordination = Some(1);
    data.environment.facility_cleanliness = Some(1);
    data.environment.facility_comfort = Some(1);
    data.environment.noise_level = Some(1);
    data.environment.privacy_adequacy = Some(1);
    data.environment.equipment_condition = Some(1);
    data.environment.overall_ambience = Some(1);
    data.medication_treatment.medication_explanation = Some(1);
    data.medication_treatment.side_effects_explained = Some(1);
    data.medication_treatment.pain_management = Some(1);
    data.medication_treatment.treatment_effectiveness = Some(1);
    data.medication_treatment.alternatives_discussed = Some(1);
    data.discharge_follow_up.discharge_instruction_clarity = Some(1);
    data.discharge_follow_up.follow_up_plan_explained = Some(1);
    data.discharge_follow_up.self_care_instructions = Some(1);
    data.discharge_follow_up.warning_signs_explained = Some(1);
    data.discharge_follow_up.contact_information_provided = Some(1);
    data.overall_experience.overall_satisfaction = Some(1);
    data.overall_experience.likelihood_to_recommend = Some(0);
    data.overall_experience.met_expectations = Some(1);
    data.overall_experience.would_return_for_care = Some(1);

    let (level, score, fired_rules) = calculate_satisfaction(&data);
    assert_eq!(level, "veryDissatisfied");
    assert_eq!(score, 0.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn fires_nps_detractor_rule() {
    let mut data = create_satisfied_assessment();
    data.overall_experience.likelihood_to_recommend = Some(2);

    let (_level, _score, fired_rules) = calculate_satisfaction(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SR-002"));
}

#[test]
fn fires_nps_promoter_rule() {
    let mut data = create_satisfied_assessment();
    data.overall_experience.likelihood_to_recommend = Some(10);

    let (_level, _score, fired_rules) = calculate_satisfaction(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SR-016"));
}

#[test]
fn fires_communication_concern_for_low_scores() {
    let mut data = create_satisfied_assessment();
    // Set all communication items to 1 → score = 0%
    data.communication.provider_listening = Some(1);
    data.communication.provider_explaining = Some(1);
    data.communication.provider_respect = Some(1);
    data.communication.provider_time_adequacy = Some(1);
    data.communication.questions_encouraged = Some(1);
    data.communication.information_clarity = Some(1);
    data.communication.shared_decision_making = Some(1);

    let (_level, _score, fired_rules) = calculate_satisfaction(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SR-003")); // Communication below 40%
}

#[test]
fn fires_positive_rules_for_excellent_communication() {
    let mut data = create_satisfied_assessment();
    // Set all communication items to 5
    data.communication.provider_listening = Some(5);
    data.communication.provider_explaining = Some(5);
    data.communication.provider_respect = Some(5);
    data.communication.provider_time_adequacy = Some(5);
    data.communication.questions_encouraged = Some(5);
    data.communication.information_clarity = Some(5);
    data.communication.shared_decision_making = Some(5);

    let (_level, _score, fired_rules) = calculate_satisfaction(&data);
    assert!(fired_rules.iter().any(|r| r.id == "SR-019")); // All communication 4-5
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
fn returns_neutral_for_all_threes() {
    let mut data = create_satisfied_assessment();
    // Set all Likert items to 3
    data.wait_time_access.ease_of_scheduling = Some(3);
    data.wait_time_access.wait_time_acceptability = Some(3);
    data.wait_time_access.location_accessibility = Some(3);
    data.wait_time_access.signage_wayfinding = Some(3);
    data.communication.provider_listening = Some(3);
    data.communication.provider_explaining = Some(3);
    data.communication.provider_respect = Some(3);
    data.communication.provider_time_adequacy = Some(3);
    data.communication.questions_encouraged = Some(3);
    data.communication.information_clarity = Some(3);
    data.communication.shared_decision_making = Some(3);
    data.care_quality.thoroughness_of_examination = Some(3);
    data.care_quality.diagnosis_explanation = Some(3);
    data.care_quality.treatment_plan_clarity = Some(3);
    data.care_quality.confidence_in_provider = Some(3);
    data.care_quality.coordination_of_care = Some(3);
    data.care_quality.involvement_in_decisions = Some(3);
    data.staff_interaction.reception_courtesy = Some(3);
    data.staff_interaction.nursing_responsiveness = Some(3);
    data.staff_interaction.staff_professionalism = Some(3);
    data.staff_interaction.staff_helpfulness = Some(3);
    data.staff_interaction.privacy_respected = Some(3);
    data.staff_interaction.team_coordination = Some(3);
    data.environment.facility_cleanliness = Some(3);
    data.environment.facility_comfort = Some(3);
    data.environment.noise_level = Some(3);
    data.environment.privacy_adequacy = Some(3);
    data.environment.equipment_condition = Some(3);
    data.environment.overall_ambience = Some(3);
    data.medication_treatment.medication_explanation = Some(3);
    data.medication_treatment.side_effects_explained = Some(3);
    data.medication_treatment.pain_management = Some(3);
    data.medication_treatment.treatment_effectiveness = Some(3);
    data.medication_treatment.alternatives_discussed = Some(3);
    data.discharge_follow_up.discharge_instruction_clarity = Some(3);
    data.discharge_follow_up.follow_up_plan_explained = Some(3);
    data.discharge_follow_up.self_care_instructions = Some(3);
    data.discharge_follow_up.warning_signs_explained = Some(3);
    data.discharge_follow_up.contact_information_provided = Some(3);
    data.overall_experience.overall_satisfaction = Some(3);
    data.overall_experience.met_expectations = Some(3);
    data.overall_experience.would_return_for_care = Some(3);

    let (level, score, _fired_rules) = calculate_satisfaction(&data);
    assert_eq!(level, "neutral");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}
