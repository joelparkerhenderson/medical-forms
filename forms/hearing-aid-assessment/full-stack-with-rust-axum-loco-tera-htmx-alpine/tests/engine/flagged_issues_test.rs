use hearing_aid_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use hearing_aid_assessment_tera_crate::engine::types::*;

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.audiologist_name = "Dr Johnson".to_string();

    data.hearing_history.onset_duration = "5to10Years".to_string();
    data.hearing_history.hearing_loss_type = "sensorineural".to_string();
    data.hearing_history.affected_ear = "bilateral".to_string();
    data.hearing_history.tinnitus_present = "no".to_string();
    data.hearing_history.previous_hearing_aid_use = "never".to_string();
    data.hearing_history.noise_exposure = "past".to_string();
    data.hearing_history.medical_conditions = "no".to_string();

    data.audiometric_results.right_ear_pta = Some(45);
    data.audiometric_results.left_ear_pta = Some(50);
    data.audiometric_results.speech_recognition_right = Some(80);
    data.audiometric_results.speech_recognition_left = Some(75);

    data.communication_needs.quiet_conversation = Some(4);
    data.communication_needs.group_conversation = Some(4);
    data.communication_needs.telephone_use = Some(4);
    data.communication_needs.television_listening = Some(4);
    data.communication_needs.public_settings = Some(4);
    data.communication_needs.workplace_communication = Some(4);

    data.lifestyle_assessment.social_activity_level = Some(4);
    data.lifestyle_assessment.outdoor_activity_level = Some(4);
    data.lifestyle_assessment.technology_comfort = Some(4);
    data.lifestyle_assessment.manual_dexterity = Some(4);
    data.lifestyle_assessment.cosmetic_concern = Some(4);
    data.lifestyle_assessment.motivation_level = Some(4);

    data.current_hearing_aids.currently_wearing = "no".to_string();

    data.fitting_requirements.bilateral_fitting = "bilateral".to_string();
    data.fitting_requirements.ear_canal_suitability = Some(4);
    data.fitting_requirements.connectivity_needs = Some(4);

    data.expectations_goals.realistic_expectations = Some(4);
    data.expectations_goals.willingness_to_adapt = Some(4);
    data.expectations_goals.support_system = Some(4);
    data.expectations_goals.follow_up_commitment = Some(4);
    data.expectations_goals.overall_readiness = Some(4);

    data.trial_period.initial_comfort = Some(4);
    data.trial_period.sound_quality = Some(4);
    data.trial_period.feedback_management = Some(4);
    data.trial_period.daily_wear_compliance = Some(4);
    data.trial_period.reported_benefit = Some(4);

    data.clinical_review.aided_improvement = Some(4);
    data.clinical_review.patient_satisfaction = Some(4);
    data.clinical_review.recommendation_confidence = Some(4);
    data.clinical_review.additional_services_needed = "none".to_string();

    data
}

#[test]
fn no_flags_for_moderate_patient() {
    let data = create_moderate_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_tinnitus_present() {
    let mut data = create_moderate_assessment();
    data.hearing_history.tinnitus_present = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HIST-001"));
}

#[test]
fn flags_profound_hearing_loss() {
    let mut data = create_moderate_assessment();
    data.audiometric_results.right_ear_pta = Some(95);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUDIO-001"));
}

#[test]
fn flags_asymmetric_hearing_loss() {
    let mut data = create_moderate_assessment();
    data.audiometric_results.right_ear_pta = Some(30);
    data.audiometric_results.left_ear_pta = Some(60);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUDIO-002"));
}

#[test]
fn flags_poor_speech_recognition() {
    let mut data = create_moderate_assessment();
    data.audiometric_results.speech_recognition_left = Some(35);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUDIO-003"));
}

#[test]
fn flags_low_manual_dexterity() {
    let mut data = create_moderate_assessment();
    data.lifestyle_assessment.manual_dexterity = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LIFE-001"));
}

#[test]
fn flags_previous_hearing_aid_rejection() {
    let mut data = create_moderate_assessment();
    data.hearing_history.previous_hearing_aid_use = "triedRejected".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HIST-002"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_moderate_assessment();
    // Create flags of different priorities
    data.audiometric_results.right_ear_pta = Some(95); // high (FLAG-AUDIO-001)
    data.hearing_history.tinnitus_present = "yes".to_string(); // medium (FLAG-HIST-001)
    data.lifestyle_assessment.cosmetic_concern = Some(1); // low (FLAG-LIFE-002)
    data.lifestyle_assessment.manual_dexterity = Some(2); // medium (FLAG-LIFE-001)

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
