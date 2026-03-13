use psychiatry_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use psychiatry_assessment_tera_crate::engine::types::*;

fn create_low_risk_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.clinician_name = "Dr Jones".to_string();

    data.presenting_complaint.symptom_severity = Some(2);
    data.presenting_complaint.functional_impact = Some(2);

    data.mental_state_examination.appearance_behaviour = Some(2);
    data.mental_state_examination.speech_assessment = Some(2);
    data.mental_state_examination.mood_rating = Some(2);
    data.mental_state_examination.affect_congruence = Some(2);
    data.mental_state_examination.thought_form = Some(2);
    data.mental_state_examination.thought_content = Some(2);
    data.mental_state_examination.perception = Some(2);
    data.mental_state_examination.cognition = Some(2);
    data.mental_state_examination.insight_judgement = Some(2);

    data.risk_assessment.suicidal_ideation = Some(1);
    data.risk_assessment.self_harm_risk = Some(1);
    data.risk_assessment.harm_to_others = Some(1);
    data.risk_assessment.safeguarding_concerns = Some(1);
    data.risk_assessment.risk_plan_specificity = Some(1);
    data.risk_assessment.protective_factors = Some(1);

    data.substance_use.alcohol_use = Some(1);
    data.substance_use.drug_use = Some(1);
    data.substance_use.substance_impact = Some(1);
    data.substance_use.withdrawal_risk = Some(1);
    data.substance_use.readiness_to_change = Some(3);

    data.social_functional.social_support = Some(2);
    data.social_functional.daily_functioning = Some(2);
    data.social_functional.relationship_quality = Some(2);

    data.family_history.adverse_childhood_experiences = Some(1);
    data.family_history.family_support_level = Some(2);

    data.current_treatment.medication_adherence = Some(4);
    data.current_treatment.side_effects_severity = Some(1);
    data.current_treatment.therapy_engagement = Some(4);
    data.current_treatment.treatment_satisfaction = Some(4);

    data.clinical_review.overall_severity = Some(2);
    data.clinical_review.treatment_urgency = Some(2);
    data.clinical_review.prognosis_outlook = Some(2);

    data
}

#[test]
fn no_flags_for_low_risk_patient() {
    let data = create_low_risk_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_active_suicidal_ideation() {
    let mut data = create_low_risk_assessment();
    data.risk_assessment.suicidal_ideation = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RISK-001"));
}

#[test]
fn flags_specific_risk_plan() {
    let mut data = create_low_risk_assessment();
    data.risk_assessment.risk_plan_specificity = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RISK-002"));
}

#[test]
fn flags_self_harm_risk() {
    let mut data = create_low_risk_assessment();
    data.risk_assessment.self_harm_risk = Some(4);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RISK-003"));
}

#[test]
fn flags_psychotic_features() {
    let mut data = create_low_risk_assessment();
    data.mental_state_examination.perception = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MSE-001"));
}

#[test]
fn flags_withdrawal_risk() {
    let mut data = create_low_risk_assessment();
    data.substance_use.withdrawal_risk = Some(5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SUB-001"));
}

#[test]
fn flags_medication_non_adherence() {
    let mut data = create_low_risk_assessment();
    data.current_treatment.medication_adherence = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-TRT-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_low_risk_assessment();
    // Create flags of different priorities
    data.risk_assessment.suicidal_ideation = Some(5); // high (FLAG-RISK-001)
    data.mental_state_examination.thought_content = Some(5); // medium (FLAG-MSE-002)
    data.social_functional.social_support = Some(5); // low (FLAG-SOC-001)
    data.family_history.adverse_childhood_experiences = Some(5); // low (FLAG-FAM-001)

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
