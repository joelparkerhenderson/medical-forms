use rheumatology_assessment_tera_crate::engine::rheumatology_grader::calculate_activity;
use rheumatology_assessment_tera_crate::engine::rheumatology_rules::all_rules;
use rheumatology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_low_activity_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1980-05-15".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.referral_source = "gp".to_string();
    data.patient_information.diagnosis = "rheumatoidArthritis".to_string();
    data.patient_information.disease_duration_years = "5to10".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();
    data.patient_information.rheumatologist_name = "Dr Johnson".to_string();

    // Joint Assessment — low values (low activity)
    data.joint_assessment.swollen_joint_count = Some(2);
    data.joint_assessment.tender_joint_count = Some(3);
    data.joint_assessment.joint_deformity_present = "no".to_string();
    data.joint_assessment.joint_erosion_present = "no".to_string();
    data.joint_assessment.affected_joint_regions = "hands".to_string();
    data.joint_assessment.joint_range_of_motion = Some(2);

    // Morning Stiffness — mild
    data.morning_stiffness.stiffness_duration_minutes = Some(20);
    data.morning_stiffness.stiffness_severity = Some(2);
    data.morning_stiffness.stiffness_frequency = "sometimes".to_string();
    data.morning_stiffness.stiffness_impact_on_function = Some(2);
    data.morning_stiffness.stiffness_improvement_with_activity = "yes".to_string();

    // Disease Activity — low
    data.disease_activity.patient_global_assessment = Some(2);
    data.disease_activity.physician_global_assessment = Some(2);
    data.disease_activity.pain_vas_score = Some(3);
    data.disease_activity.fatigue_severity = Some(3);
    data.disease_activity.flare_frequency = "rare".to_string();
    data.disease_activity.das28_score = Some(2.8);

    // Laboratory Markers
    data.laboratory_markers.esr_value = Some(12.0);
    data.laboratory_markers.crp_value = Some(3.0);
    data.laboratory_markers.rheumatoid_factor_positive = "yes".to_string();
    data.laboratory_markers.anti_ccp_positive = "no".to_string();
    data.laboratory_markers.ana_positive = "no".to_string();
    data.laboratory_markers.hemoglobin_value = Some(13.5);

    // Imaging Findings
    data.imaging_findings.xray_erosions_present = "no".to_string();
    data.imaging_findings.xray_joint_space_narrowing = "no".to_string();
    data.imaging_findings.ultrasound_synovitis_present = "no".to_string();
    data.imaging_findings.mri_bone_edema_present = "no".to_string();
    data.imaging_findings.imaging_progression_since_last = "no".to_string();
    data.imaging_findings.overall_radiographic_stage = "stage1".to_string();

    // Functional Status — good
    data.functional_status.haq_score = Some(0.5);
    data.functional_status.grip_strength = Some(2);
    data.functional_status.walking_ability = Some(2);
    data.functional_status.self_care_ability = Some(1);
    data.functional_status.work_disability = "no".to_string();
    data.functional_status.assistive_devices_needed = "no".to_string();

    // Medication History
    data.medication_history.current_dmard_therapy = "methotrexate".to_string();
    data.medication_history.biologic_therapy = "none".to_string();
    data.medication_history.corticosteroid_use = "no".to_string();
    data.medication_history.nsaid_use = "yes".to_string();
    data.medication_history.medication_adherence = Some(8);
    data.medication_history.adverse_effects_reported = "no".to_string();

    // Comorbidities
    data.comorbidities.cardiovascular_disease = "no".to_string();
    data.comorbidities.osteoporosis = "no".to_string();
    data.comorbidities.interstitial_lung_disease = "no".to_string();
    data.comorbidities.infection_history = "no".to_string();
    data.comorbidities.mental_health_concerns = "no".to_string();

    // Clinical Review
    data.clinical_review.treatment_response = Some(7);
    data.clinical_review.treatment_goal_met = "yes".to_string();
    data.clinical_review.referral_needed = "no".to_string();
    data.clinical_review.patient_education_provided = "yes".to_string();
    data.clinical_review.follow_up_interval = "12weeks".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_activity(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_low_activity_for_mild_disease() {
    let data = create_low_activity_assessment();
    let (level, score, _fired_rules) = calculate_activity(&data);
    assert_eq!(level, "lowActivity");
    // Average of scored items: (2+3+2+2+2+2+2+3+3+2+2+1+7)/13 = 33/13 ≈ 2.538
    // Score: (2.538-1)/9 * 100 ≈ 17.1 → rounds to 17
    assert!(score > 0.0 && score <= 25.0, "Expected low activity score, got {score}");
}

#[test]
fn returns_severe_for_maximum_values() {
    let mut data = create_low_activity_assessment();
    // Set all scored items to 10 (maximum disease activity)
    data.joint_assessment.swollen_joint_count = Some(10);
    data.joint_assessment.tender_joint_count = Some(10);
    data.joint_assessment.joint_range_of_motion = Some(10);
    data.morning_stiffness.stiffness_severity = Some(10);
    data.morning_stiffness.stiffness_impact_on_function = Some(10);
    data.disease_activity.patient_global_assessment = Some(10);
    data.disease_activity.physician_global_assessment = Some(10);
    data.disease_activity.pain_vas_score = Some(10);
    data.disease_activity.fatigue_severity = Some(10);
    data.functional_status.grip_strength = Some(10);
    data.functional_status.walking_ability = Some(10);
    data.functional_status.self_care_ability = Some(10);
    data.clinical_review.treatment_response = Some(10);

    let (level, score, fired_rules) = calculate_activity(&data);
    assert_eq!(level, "severe");
    assert_eq!(score, 100.0);
    assert!(fired_rules.len() >= 3); // Multiple high concern rules should fire
}

#[test]
fn returns_remission_for_minimum_values() {
    let mut data = create_low_activity_assessment();
    // Set all scored items to 1 (minimum = remission)
    data.joint_assessment.swollen_joint_count = Some(1);
    data.joint_assessment.tender_joint_count = Some(1);
    data.joint_assessment.joint_range_of_motion = Some(1);
    data.morning_stiffness.stiffness_severity = Some(1);
    data.morning_stiffness.stiffness_impact_on_function = Some(1);
    data.disease_activity.patient_global_assessment = Some(1);
    data.disease_activity.physician_global_assessment = Some(1);
    data.disease_activity.pain_vas_score = Some(1);
    data.disease_activity.fatigue_severity = Some(1);
    data.functional_status.grip_strength = Some(1);
    data.functional_status.walking_ability = Some(1);
    data.functional_status.self_care_ability = Some(1);
    data.clinical_review.treatment_response = Some(1);
    data.disease_activity.das28_score = Some(1.5);

    let (level, score, _fired_rules) = calculate_activity(&data);
    assert_eq!(level, "remission");
    assert_eq!(score, 0.0); // (1-1)/9 * 100 = 0
}

#[test]
fn returns_moderate_activity_for_mid_values() {
    let mut data = create_low_activity_assessment();
    // Set all scored items to 5-6 (mid-range)
    data.joint_assessment.swollen_joint_count = Some(5);
    data.joint_assessment.tender_joint_count = Some(6);
    data.joint_assessment.joint_range_of_motion = Some(5);
    data.morning_stiffness.stiffness_severity = Some(5);
    data.morning_stiffness.stiffness_impact_on_function = Some(5);
    data.disease_activity.patient_global_assessment = Some(5);
    data.disease_activity.physician_global_assessment = Some(5);
    data.disease_activity.pain_vas_score = Some(6);
    data.disease_activity.fatigue_severity = Some(5);
    data.functional_status.grip_strength = Some(5);
    data.functional_status.walking_ability = Some(5);
    data.functional_status.self_care_ability = Some(5);
    data.clinical_review.treatment_response = Some(5);

    let (level, score, _fired_rules) = calculate_activity(&data);
    assert_eq!(level, "moderateActivity");
    // Average ≈ 5.15, Score: (5.15-1)/9 * 100 ≈ 46.2
    assert!(score > 25.0 && score <= 50.0, "Expected moderate score, got {score}");
}

#[test]
fn fires_high_das28_rule() {
    let mut data = create_low_activity_assessment();
    data.disease_activity.das28_score = Some(6.0);

    let (_level, _score, fired_rules) = calculate_activity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RHEUM-001"));
}

#[test]
fn fires_remission_das28_rule() {
    let mut data = create_low_activity_assessment();
    data.disease_activity.das28_score = Some(2.0);

    let (_level, _score, fired_rules) = calculate_activity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RHEUM-016"));
}

#[test]
fn fires_significant_polyarthritis_rule() {
    let mut data = create_low_activity_assessment();
    data.joint_assessment.swollen_joint_count = Some(10);

    let (_level, _score, fired_rules) = calculate_activity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RHEUM-002"));
}

#[test]
fn fires_treatment_goal_met_rule() {
    let data = create_low_activity_assessment();
    // treatment_goal_met is already "yes" in create_low_activity_assessment
    let (_level, _score, fired_rules) = calculate_activity(&data);
    assert!(fired_rules.iter().any(|r| r.id == "RHEUM-017"));
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
