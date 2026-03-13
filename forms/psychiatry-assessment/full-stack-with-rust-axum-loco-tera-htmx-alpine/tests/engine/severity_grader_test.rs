use psychiatry_assessment_tera_crate::engine::severity_grader::calculate_severity;
use psychiatry_assessment_tera_crate::engine::severity_rules::all_rules;
use psychiatry_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_moderate_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.patient_age = "36to50".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.referral_source = "gp".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.clinician_name = "Dr Jones".to_string();
    data.patient_information.clinician_role = "psychiatrist".to_string();

    // Presenting Complaint — moderate scores (3)
    data.presenting_complaint.chief_complaint = "Low mood and anxiety".to_string();
    data.presenting_complaint.onset_duration = "chronic".to_string();
    data.presenting_complaint.symptom_severity = Some(3);
    data.presenting_complaint.functional_impact = Some(3);
    data.presenting_complaint.symptom_progression = "stable".to_string();

    // Psychiatric History
    data.psychiatric_history.previous_diagnoses = "Depression".to_string();
    data.psychiatric_history.previous_hospitalizations = "none".to_string();
    data.psychiatric_history.hospitalization_count = "0".to_string();
    data.psychiatric_history.treatment_response = Some(3);
    data.psychiatric_history.therapy_history = "cbt".to_string();

    // Mental State Examination — all 3s (moderate)
    data.mental_state_examination.appearance_behaviour = Some(3);
    data.mental_state_examination.speech_assessment = Some(3);
    data.mental_state_examination.mood_rating = Some(3);
    data.mental_state_examination.affect_congruence = Some(3);
    data.mental_state_examination.thought_form = Some(3);
    data.mental_state_examination.thought_content = Some(3);
    data.mental_state_examination.perception = Some(3);
    data.mental_state_examination.cognition = Some(3);
    data.mental_state_examination.insight_judgement = Some(3);

    // Risk Assessment — all 3s (moderate)
    data.risk_assessment.suicidal_ideation = Some(3);
    data.risk_assessment.self_harm_risk = Some(3);
    data.risk_assessment.harm_to_others = Some(3);
    data.risk_assessment.safeguarding_concerns = Some(3);
    data.risk_assessment.risk_plan_specificity = Some(3);
    data.risk_assessment.protective_factors = Some(3);

    // Substance Use — all 3s
    data.substance_use.alcohol_use = Some(3);
    data.substance_use.drug_use = Some(3);
    data.substance_use.tobacco_use = "never".to_string();
    data.substance_use.substance_impact = Some(3);
    data.substance_use.withdrawal_risk = Some(3);
    data.substance_use.readiness_to_change = Some(3);

    // Social & Functional — all 3s
    data.social_functional.living_situation = "withFamily".to_string();
    data.social_functional.employment_status = "employed".to_string();
    data.social_functional.social_support = Some(3);
    data.social_functional.daily_functioning = Some(3);
    data.social_functional.relationship_quality = Some(3);

    // Family History
    data.family_history.family_psychiatric_history = "depression".to_string();
    data.family_history.family_suicide_history = "no".to_string();
    data.family_history.family_substance_use = "no".to_string();
    data.family_history.adverse_childhood_experiences = Some(3);
    data.family_history.family_support_level = Some(3);

    // Current Treatment — all 3s
    data.current_treatment.current_medications = "Sertraline 100mg".to_string();
    data.current_treatment.medication_adherence = Some(3);
    data.current_treatment.side_effects_severity = Some(3);
    data.current_treatment.therapy_engagement = Some(3);
    data.current_treatment.treatment_satisfaction = Some(3);

    // Clinical Review — all 3s
    data.clinical_review.overall_severity = Some(3);
    data.clinical_review.treatment_urgency = Some(3);
    data.clinical_review.prognosis_outlook = Some(3);
    data.clinical_review.clinical_notes = "Moderate depression".to_string();

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
fn returns_moderate_for_all_threes() {
    let data = create_moderate_assessment();
    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "moderate");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}

#[test]
fn returns_stable_for_all_ones() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 1
    data.presenting_complaint.symptom_severity = Some(1);
    data.presenting_complaint.functional_impact = Some(1);
    data.psychiatric_history.treatment_response = Some(1);
    data.mental_state_examination.appearance_behaviour = Some(1);
    data.mental_state_examination.speech_assessment = Some(1);
    data.mental_state_examination.mood_rating = Some(1);
    data.mental_state_examination.affect_congruence = Some(1);
    data.mental_state_examination.thought_form = Some(1);
    data.mental_state_examination.thought_content = Some(1);
    data.mental_state_examination.perception = Some(1);
    data.mental_state_examination.cognition = Some(1);
    data.mental_state_examination.insight_judgement = Some(1);
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
    data.substance_use.readiness_to_change = Some(1);
    data.social_functional.social_support = Some(1);
    data.social_functional.daily_functioning = Some(1);
    data.social_functional.relationship_quality = Some(1);
    data.family_history.adverse_childhood_experiences = Some(1);
    data.family_history.family_support_level = Some(1);
    data.current_treatment.medication_adherence = Some(1);
    data.current_treatment.side_effects_severity = Some(1);
    data.current_treatment.therapy_engagement = Some(1);
    data.current_treatment.treatment_satisfaction = Some(1);
    data.clinical_review.overall_severity = Some(1);
    data.clinical_review.treatment_urgency = Some(1);
    data.clinical_review.prognosis_outlook = Some(1);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "stable");
    assert_eq!(score, 0.0);
}

#[test]
fn returns_crisis_for_all_fives() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 5
    data.presenting_complaint.symptom_severity = Some(5);
    data.presenting_complaint.functional_impact = Some(5);
    data.psychiatric_history.treatment_response = Some(5);
    data.mental_state_examination.appearance_behaviour = Some(5);
    data.mental_state_examination.speech_assessment = Some(5);
    data.mental_state_examination.mood_rating = Some(5);
    data.mental_state_examination.affect_congruence = Some(5);
    data.mental_state_examination.thought_form = Some(5);
    data.mental_state_examination.thought_content = Some(5);
    data.mental_state_examination.perception = Some(5);
    data.mental_state_examination.cognition = Some(5);
    data.mental_state_examination.insight_judgement = Some(5);
    data.risk_assessment.suicidal_ideation = Some(5);
    data.risk_assessment.self_harm_risk = Some(5);
    data.risk_assessment.harm_to_others = Some(5);
    data.risk_assessment.safeguarding_concerns = Some(5);
    data.risk_assessment.risk_plan_specificity = Some(5);
    data.risk_assessment.protective_factors = Some(5);
    data.substance_use.alcohol_use = Some(5);
    data.substance_use.drug_use = Some(5);
    data.substance_use.substance_impact = Some(5);
    data.substance_use.withdrawal_risk = Some(5);
    data.substance_use.readiness_to_change = Some(5);
    data.social_functional.social_support = Some(5);
    data.social_functional.daily_functioning = Some(5);
    data.social_functional.relationship_quality = Some(5);
    data.family_history.adverse_childhood_experiences = Some(5);
    data.family_history.family_support_level = Some(5);
    data.current_treatment.medication_adherence = Some(5);
    data.current_treatment.side_effects_severity = Some(5);
    data.current_treatment.therapy_engagement = Some(5);
    data.current_treatment.treatment_satisfaction = Some(5);
    data.clinical_review.overall_severity = Some(5);
    data.clinical_review.treatment_urgency = Some(5);
    data.clinical_review.prognosis_outlook = Some(5);

    let (level, score, fired_rules) = calculate_severity(&data);
    assert_eq!(level, "crisis");
    assert_eq!(score, 100.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn returns_mild_for_all_twos() {
    let mut data = create_moderate_assessment();
    // Set all Likert items to 2
    data.presenting_complaint.symptom_severity = Some(2);
    data.presenting_complaint.functional_impact = Some(2);
    data.psychiatric_history.treatment_response = Some(2);
    data.mental_state_examination.appearance_behaviour = Some(2);
    data.mental_state_examination.speech_assessment = Some(2);
    data.mental_state_examination.mood_rating = Some(2);
    data.mental_state_examination.affect_congruence = Some(2);
    data.mental_state_examination.thought_form = Some(2);
    data.mental_state_examination.thought_content = Some(2);
    data.mental_state_examination.perception = Some(2);
    data.mental_state_examination.cognition = Some(2);
    data.mental_state_examination.insight_judgement = Some(2);
    data.risk_assessment.suicidal_ideation = Some(2);
    data.risk_assessment.self_harm_risk = Some(2);
    data.risk_assessment.harm_to_others = Some(2);
    data.risk_assessment.safeguarding_concerns = Some(2);
    data.risk_assessment.risk_plan_specificity = Some(2);
    data.risk_assessment.protective_factors = Some(2);
    data.substance_use.alcohol_use = Some(2);
    data.substance_use.drug_use = Some(2);
    data.substance_use.substance_impact = Some(2);
    data.substance_use.withdrawal_risk = Some(2);
    data.substance_use.readiness_to_change = Some(2);
    data.social_functional.social_support = Some(2);
    data.social_functional.daily_functioning = Some(2);
    data.social_functional.relationship_quality = Some(2);
    data.family_history.adverse_childhood_experiences = Some(2);
    data.family_history.family_support_level = Some(2);
    data.current_treatment.medication_adherence = Some(2);
    data.current_treatment.side_effects_severity = Some(2);
    data.current_treatment.therapy_engagement = Some(2);
    data.current_treatment.treatment_satisfaction = Some(2);
    data.clinical_review.overall_severity = Some(2);
    data.clinical_review.treatment_urgency = Some(2);
    data.clinical_review.prognosis_outlook = Some(2);

    let (level, score, _fired_rules) = calculate_severity(&data);
    assert_eq!(level, "mild");
    assert_eq!(score, 25.0); // (2-1)/4 * 100 = 25
}

#[test]
fn fires_suicidal_ideation_rule() {
    let mut data = create_moderate_assessment();
    data.risk_assessment.suicidal_ideation = Some(5);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PSY-001"));
}

#[test]
fn fires_self_harm_rule() {
    let mut data = create_moderate_assessment();
    data.risk_assessment.self_harm_risk = Some(5);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PSY-002"));
}

#[test]
fn fires_positive_therapy_engagement_rule() {
    let mut data = create_moderate_assessment();
    data.current_treatment.therapy_engagement = Some(5);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PSY-016"));
}

#[test]
fn fires_positive_prognosis_rule() {
    let mut data = create_moderate_assessment();
    data.clinical_review.prognosis_outlook = Some(1);

    let (_level, _score, fired_rules) = calculate_severity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "PSY-020"));
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
