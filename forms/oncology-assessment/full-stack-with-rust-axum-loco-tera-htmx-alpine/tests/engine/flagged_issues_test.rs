use oncology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use oncology_assessment_tera_crate::engine::types::*;

fn create_stable_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.assessment_date = "2026-03-10".to_string();

    data.cancer_diagnosis.cancer_type = "breast".to_string();
    data.cancer_diagnosis.genetic_testing_done = "yes".to_string();
    data.cancer_diagnosis.family_cancer_history = "no".to_string();

    data.staging_grading.overall_stage = "I".to_string();

    data.current_treatment.current_treatment_type = "hormoneTherapy".to_string();
    data.current_treatment.clinical_trial_enrollment = "no".to_string();
    data.current_treatment.treatment_modifications = "none".to_string();

    data.side_effects_toxicity.nausea_severity = Some(1);
    data.side_effects_toxicity.fatigue_severity = Some(1);
    data.side_effects_toxicity.pain_severity = Some(1);
    data.side_effects_toxicity.neuropathy_severity = Some(1);
    data.side_effects_toxicity.mucositis_severity = Some(1);
    data.side_effects_toxicity.skin_toxicity_severity = Some(1);
    data.side_effects_toxicity.hematologic_toxicity = "none".to_string();
    data.side_effects_toxicity.weight_change = "stable".to_string();

    data.performance_status.ecog_score = Some(0);
    data.performance_status.self_care_ability = Some(1);
    data.performance_status.daily_activity_level = Some(1);
    data.performance_status.nutritional_status = Some(1);
    data.performance_status.cognitive_function = Some(1);
    data.performance_status.sleep_quality = Some(1);

    data.psychosocial_assessment.anxiety_level = Some(1);
    data.psychosocial_assessment.depression_screening = Some(1);
    data.psychosocial_assessment.distress_thermometer = Some(1);
    data.psychosocial_assessment.social_support = Some(2);
    data.psychosocial_assessment.financial_toxicity = Some(1);
    data.psychosocial_assessment.coping_ability = Some(1);
    data.psychosocial_assessment.caregiver_burden = "none".to_string();

    data.palliative_care_needs.symptom_burden = Some(1);
    data.palliative_care_needs.pain_management_adequacy = Some(1);
    data.palliative_care_needs.advance_directive_status = "completed".to_string();
    data.palliative_care_needs.goals_of_care_discussed = "yes".to_string();
    data.palliative_care_needs.hospice_referral_indicated = "no".to_string();
    data.palliative_care_needs.quality_of_life_score = Some(1);

    data.clinical_review.tumor_board_reviewed = "yes".to_string();

    data
}

#[test]
fn no_flags_for_stable_patient() {
    let data = create_stable_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_hematologic_toxicity_grade3() {
    let mut data = create_stable_assessment();
    data.side_effects_toxicity.hematologic_toxicity = "grade3".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TOX-001"));
}

#[test]
fn flags_significant_weight_loss() {
    let mut data = create_stable_assessment();
    data.side_effects_toxicity.weight_change = "significantLoss".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TOX-002"));
}

#[test]
fn flags_severe_neuropathy() {
    let mut data = create_stable_assessment();
    data.side_effects_toxicity.neuropathy_severity = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TOX-003"));
}

#[test]
fn flags_high_distress() {
    let mut data = create_stable_assessment();
    data.psychosocial_assessment.distress_thermometer = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PSY-001"));
}

#[test]
fn flags_no_advance_directive() {
    let mut data = create_stable_assessment();
    data.palliative_care_needs.advance_directive_status = "none".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAL-001"));
}

#[test]
fn flags_genetic_testing_not_done() {
    let mut data = create_stable_assessment();
    data.cancer_diagnosis.genetic_testing_done = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DX-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_stable_assessment();
    // Create flags of different priorities
    data.side_effects_toxicity.hematologic_toxicity = "grade4".to_string(); // high
    data.cancer_diagnosis.genetic_testing_done = "no".to_string(); // low
    data.palliative_care_needs.advance_directive_status = "none".to_string(); // medium
    data.cancer_diagnosis.family_cancer_history = "yes".to_string(); // low

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
