use encounter_satisfaction_tera_crate::engine::flagged_issues::detect_additional_flags;
use encounter_satisfaction_tera_crate::engine::types::*;

fn create_satisfied_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.visit_information.visit_date = "2026-03-01".to_string();
    data.visit_information.department_name = "Cardiology".to_string();
    data.visit_information.provider_name = "Dr Smith".to_string();

    data.wait_time_access.ease_of_scheduling = Some(4);
    data.wait_time_access.appointment_wait_days = "4to7".to_string();
    data.wait_time_access.waiting_room_time = "15to30".to_string();
    data.wait_time_access.wait_time_acceptability = Some(4);
    data.wait_time_access.location_accessibility = Some(4);
    data.wait_time_access.signage_wayfinding = Some(4);

    data.communication.provider_listening = Some(4);
    data.communication.provider_explaining = Some(4);
    data.communication.provider_respect = Some(4);
    data.communication.provider_time_adequacy = Some(4);
    data.communication.questions_encouraged = Some(4);
    data.communication.information_clarity = Some(4);
    data.communication.shared_decision_making = Some(4);

    data.care_quality.thoroughness_of_examination = Some(4);
    data.care_quality.diagnosis_explanation = Some(4);
    data.care_quality.treatment_plan_clarity = Some(4);
    data.care_quality.confidence_in_provider = Some(4);
    data.care_quality.coordination_of_care = Some(4);
    data.care_quality.involvement_in_decisions = Some(4);

    data.staff_interaction.reception_courtesy = Some(4);
    data.staff_interaction.nursing_responsiveness = Some(4);
    data.staff_interaction.staff_professionalism = Some(4);
    data.staff_interaction.staff_helpfulness = Some(4);
    data.staff_interaction.privacy_respected = Some(4);
    data.staff_interaction.team_coordination = Some(4);

    data.environment.facility_cleanliness = Some(4);
    data.environment.facility_comfort = Some(4);
    data.environment.noise_level = Some(4);
    data.environment.privacy_adequacy = Some(4);
    data.environment.equipment_condition = Some(4);
    data.environment.overall_ambience = Some(4);

    data.medication_treatment.medication_explanation = Some(4);
    data.medication_treatment.side_effects_explained = Some(4);
    data.medication_treatment.pain_management = Some(4);
    data.medication_treatment.treatment_effectiveness = Some(4);
    data.medication_treatment.alternatives_discussed = Some(4);
    data.medication_treatment.medications_provided = "yes".to_string();

    data.discharge_follow_up.discharge_instruction_clarity = Some(4);
    data.discharge_follow_up.follow_up_plan_explained = Some(4);
    data.discharge_follow_up.self_care_instructions = Some(4);
    data.discharge_follow_up.warning_signs_explained = Some(4);
    data.discharge_follow_up.contact_information_provided = Some(4);
    data.discharge_follow_up.follow_up_appointment_scheduled = "yes".to_string();

    data.overall_experience.overall_satisfaction = Some(4);
    data.overall_experience.likelihood_to_recommend = Some(8);
    data.overall_experience.met_expectations = Some(4);
    data.overall_experience.would_return_for_care = Some(4);

    data.demographics_comments.has_disability = "no".to_string();

    data
}

#[test]
fn no_flags_for_satisfied_patient() {
    let data = create_satisfied_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_excessive_appointment_wait() {
    let mut data = create_satisfied_assessment();
    data.wait_time_access.appointment_wait_days = "moreThan30".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-WAIT-001"));
}

#[test]
fn flags_excessive_waiting_room_time() {
    let mut data = create_satisfied_assessment();
    data.wait_time_access.waiting_room_time = "moreThan60".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-WAIT-002"));
}

#[test]
fn flags_provider_not_listening() {
    let mut data = create_satisfied_assessment();
    data.communication.provider_listening = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COMM-001"));
}

#[test]
fn flags_no_confidence_in_provider() {
    let mut data = create_satisfied_assessment();
    data.care_quality.confidence_in_provider = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CARE-001"));
}

#[test]
fn flags_cleanliness_concern() {
    let mut data = create_satisfied_assessment();
    data.environment.facility_cleanliness = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ENV-001"));
}

#[test]
fn flags_disability_for_accessibility_review() {
    let mut data = create_satisfied_assessment();
    data.demographics_comments.has_disability = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DEMO-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_satisfied_assessment();
    // Create flags of different priorities
    data.communication.provider_listening = Some(1); // high
    data.environment.noise_level = Some(1); // low
    data.communication.questions_encouraged = Some(2); // medium
    data.demographics_comments.has_disability = "yes".to_string(); // low

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
