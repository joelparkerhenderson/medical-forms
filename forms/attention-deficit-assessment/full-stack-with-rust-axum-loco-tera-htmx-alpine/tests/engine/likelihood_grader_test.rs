use attention_deficit_assessment_tera_crate::engine::likelihood_grader::calculate_likelihood;
use attention_deficit_assessment_tera_crate::engine::likelihood_rules::all_rules;
use attention_deficit_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_likely_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.patient_age = "35to44".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.referral_source = "gp".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();
    data.patient_information.clinician_name = "Dr Williams".to_string();
    data.patient_information.clinic_location = "Adult ADHD Service".to_string();

    // Developmental History - childhood onset confirmed
    data.developmental_history.childhood_symptoms_present = "yes".to_string();
    data.developmental_history.age_of_onset = "6to12".to_string();
    data.developmental_history.childhood_hyperactivity = Some(3);
    data.developmental_history.childhood_inattention = Some(3);
    data.developmental_history.childhood_impulsivity = Some(2);
    data.developmental_history.school_performance_issues = "yes".to_string();
    data.developmental_history.school_behavior_reports = "yes".to_string();
    data.developmental_history.learning_difficulties = "no".to_string();

    // Inattention Symptoms - moderate-high
    data.inattention_symptoms.difficulty_sustaining_attention = Some(3);
    data.inattention_symptoms.fails_to_give_close_attention = Some(3);
    data.inattention_symptoms.does_not_listen_when_spoken_to = Some(2);
    data.inattention_symptoms.fails_to_follow_through = Some(3);
    data.inattention_symptoms.difficulty_organizing_tasks = Some(3);
    data.inattention_symptoms.avoids_sustained_mental_effort = Some(3);
    data.inattention_symptoms.loses_things_necessary = Some(2);
    data.inattention_symptoms.easily_distracted = Some(3);
    data.inattention_symptoms.forgetful_in_daily_activities = Some(3);

    // Hyperactivity-Impulsivity - moderate
    data.hyperactivity_impulsivity.fidgets_or_squirms = Some(3);
    data.hyperactivity_impulsivity.leaves_seat_unexpectedly = Some(2);
    data.hyperactivity_impulsivity.feels_restless = Some(3);
    data.hyperactivity_impulsivity.difficulty_engaging_quietly = Some(2);
    data.hyperactivity_impulsivity.on_the_go_driven_by_motor = Some(3);
    data.hyperactivity_impulsivity.talks_excessively = Some(2);
    data.hyperactivity_impulsivity.blurts_out_answers = Some(2);
    data.hyperactivity_impulsivity.difficulty_waiting_turn = Some(2);
    data.hyperactivity_impulsivity.interrupts_or_intrudes = Some(2);

    // ASRS Screener - 5 out of 6 positive (above thresholds)
    // Q1-3 threshold >= 2, Q4-6 threshold >= 3
    data.asrs_screener.asrs_q1_wrapping_up = Some(3);       // >= 2 -> positive
    data.asrs_screener.asrs_q2_difficulty_ordering = Some(3); // >= 2 -> positive
    data.asrs_screener.asrs_q3_difficulty_remembering = Some(2); // >= 2 -> positive
    data.asrs_screener.asrs_q4_avoids_getting_started = Some(3); // >= 3 -> positive
    data.asrs_screener.asrs_q5_fidget_squirm = Some(3);     // >= 3 -> positive
    data.asrs_screener.asrs_q6_overly_active = Some(1);     // < 3 -> not positive

    // Functional Impact - moderate
    data.functional_impact.work_performance_impact = Some(2);
    data.functional_impact.academic_impact = Some(2);
    data.functional_impact.relationship_impact = Some(2);
    data.functional_impact.social_functioning_impact = Some(1);
    data.functional_impact.financial_management_impact = Some(2);
    data.functional_impact.driving_safety_concern = Some(1);
    data.functional_impact.daily_task_management = Some(2);
    data.functional_impact.self_esteem_impact = Some(2);

    // Comorbidities - minimal
    data.comorbidities.anxiety_symptoms = "no".to_string();
    data.comorbidities.depression_symptoms = "no".to_string();
    data.comorbidities.mood_disorder_history = "no".to_string();
    data.comorbidities.sleep_disorder = "no".to_string();
    data.comorbidities.substance_use_current = "no".to_string();
    data.comorbidities.substance_use_history = "no".to_string();
    data.comorbidities.autism_spectrum_traits = "no".to_string();
    data.comorbidities.tic_disorder = "no".to_string();

    // Previous Assessment
    data.previous_assessment.previously_assessed_for_adhd = "no".to_string();

    // Current Management
    data.current_management.currently_on_medication = "no".to_string();
    data.current_management.cardiac_history = "no".to_string();
    data.current_management.family_cardiac_history = "no".to_string();
    data.current_management.blood_pressure_status = "normal".to_string();

    // Clinical Review
    data.clinical_review.collateral_history_obtained = "yes".to_string();
    data.clinical_review.collateral_source = "Parent".to_string();
    data.clinical_review.physical_examination_done = "yes".to_string();
    data.clinical_review.ecg_done = "notRequired".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, asrs_score, positive_count, fired_rules) = calculate_likelihood(&data);
    assert_eq!(level, "draft");
    assert_eq!(asrs_score, 0);
    assert_eq!(positive_count, 0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_likely_for_five_positive_asrs() {
    let data = create_likely_assessment();
    let (level, _asrs_score, positive_count, _fired_rules) = calculate_likelihood(&data);
    assert_eq!(positive_count, 5);
    assert_eq!(level, "likely");
}

#[test]
fn returns_highly_likely_with_severe_functional_impact() {
    let mut data = create_likely_assessment();
    // Set all functional impact to very severe (4)
    data.functional_impact.work_performance_impact = Some(4);
    data.functional_impact.academic_impact = Some(4);
    data.functional_impact.relationship_impact = Some(4);
    data.functional_impact.social_functioning_impact = Some(4);
    data.functional_impact.financial_management_impact = Some(4);
    data.functional_impact.driving_safety_concern = Some(4);
    data.functional_impact.daily_task_management = Some(4);
    data.functional_impact.self_esteem_impact = Some(4);

    let (level, _asrs_score, positive_count, _fired_rules) = calculate_likelihood(&data);
    assert!(positive_count >= 4);
    assert_eq!(level, "highlyLikely");
}

#[test]
fn returns_unlikely_for_low_asrs() {
    let mut data = create_likely_assessment();
    // Set all ASRS items below thresholds
    data.asrs_screener.asrs_q1_wrapping_up = Some(0);
    data.asrs_screener.asrs_q2_difficulty_ordering = Some(1);
    data.asrs_screener.asrs_q3_difficulty_remembering = Some(0);
    data.asrs_screener.asrs_q4_avoids_getting_started = Some(1);
    data.asrs_screener.asrs_q5_fidget_squirm = Some(0);
    data.asrs_screener.asrs_q6_overly_active = Some(0);

    let (level, _asrs_score, positive_count, _fired_rules) = calculate_likelihood(&data);
    assert_eq!(positive_count, 0);
    assert_eq!(level, "unlikely");
}

#[test]
fn returns_possible_for_two_positive_asrs() {
    let mut data = create_likely_assessment();
    // Set only Q1 and Q2 above threshold
    data.asrs_screener.asrs_q1_wrapping_up = Some(3);
    data.asrs_screener.asrs_q2_difficulty_ordering = Some(2);
    data.asrs_screener.asrs_q3_difficulty_remembering = Some(0);
    data.asrs_screener.asrs_q4_avoids_getting_started = Some(1);
    data.asrs_screener.asrs_q5_fidget_squirm = Some(0);
    data.asrs_screener.asrs_q6_overly_active = Some(0);

    let (level, _asrs_score, positive_count, _fired_rules) = calculate_likelihood(&data);
    assert_eq!(positive_count, 2);
    assert_eq!(level, "possible");
}

#[test]
fn fires_asrs_positive_rule() {
    let data = create_likely_assessment();
    let (_level, _asrs_score, _positive_count, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ADHD-001")); // ASRS >= 4 positive
}

#[test]
fn fires_childhood_onset_rule() {
    let data = create_likely_assessment();
    let (_level, _asrs_score, _positive_count, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ADHD-005")); // Childhood onset + school issues
}

#[test]
fn fires_no_comorbidity_rule() {
    let data = create_likely_assessment();
    let (_level, _asrs_score, _positive_count, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ADHD-020")); // No comorbid conditions
}

#[test]
fn fires_substance_use_rule() {
    let mut data = create_likely_assessment();
    data.comorbidities.substance_use_current = "yes".to_string();
    let (_level, _asrs_score, _positive_count, fired_rules) = calculate_likelihood(&data);
    assert!(fired_rules.iter().any(|r| r.id == "ADHD-003")); // Substance use
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
