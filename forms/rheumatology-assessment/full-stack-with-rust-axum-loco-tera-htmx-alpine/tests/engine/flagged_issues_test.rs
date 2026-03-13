use rheumatology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use rheumatology_assessment_tera_crate::engine::types::*;

fn create_stable_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.diagnosis = "rheumatoidArthritis".to_string();
    data.patient_information.assessment_date = "2026-03-01".to_string();

    data.joint_assessment.swollen_joint_count = Some(2);
    data.joint_assessment.tender_joint_count = Some(3);
    data.joint_assessment.joint_deformity_present = "no".to_string();
    data.joint_assessment.joint_erosion_present = "no".to_string();
    data.joint_assessment.joint_range_of_motion = Some(2);

    data.morning_stiffness.stiffness_duration_minutes = Some(20);
    data.morning_stiffness.stiffness_severity = Some(2);

    data.disease_activity.patient_global_assessment = Some(2);
    data.disease_activity.physician_global_assessment = Some(2);
    data.disease_activity.pain_vas_score = Some(3);
    data.disease_activity.das28_score = Some(2.8);

    data.laboratory_markers.esr_value = Some(12.0);
    data.laboratory_markers.crp_value = Some(3.0);
    data.laboratory_markers.rheumatoid_factor_positive = "yes".to_string();
    data.laboratory_markers.anti_ccp_positive = "no".to_string();
    data.laboratory_markers.hemoglobin_value = Some(13.5);

    data.imaging_findings.xray_erosions_present = "no".to_string();
    data.imaging_findings.xray_joint_space_narrowing = "no".to_string();
    data.imaging_findings.mri_bone_edema_present = "no".to_string();
    data.imaging_findings.imaging_progression_since_last = "no".to_string();

    data.functional_status.work_disability = "no".to_string();
    data.functional_status.assistive_devices_needed = "no".to_string();

    data.medication_history.current_dmard_therapy = "methotrexate".to_string();
    data.medication_history.biologic_therapy = "none".to_string();
    data.medication_history.corticosteroid_use = "no".to_string();
    data.medication_history.adverse_effects_reported = "no".to_string();

    data.comorbidities.cardiovascular_disease = "no".to_string();
    data.comorbidities.osteoporosis = "no".to_string();
    data.comorbidities.interstitial_lung_disease = "no".to_string();
    data.comorbidities.infection_history = "no".to_string();
    data.comorbidities.mental_health_concerns = "no".to_string();

    data.clinical_review.patient_education_provided = "yes".to_string();

    data
}

#[test]
fn no_flags_for_stable_patient() {
    let data = create_stable_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_mri_bone_edema() {
    let mut data = create_stable_assessment();
    data.imaging_findings.mri_bone_edema_present = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IMG-002"));
}

#[test]
fn flags_prolonged_morning_stiffness() {
    let mut data = create_stable_assessment();
    data.morning_stiffness.stiffness_duration_minutes = Some(150);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-STIFF-001"));
}

#[test]
fn flags_severe_pain() {
    let mut data = create_stable_assessment();
    data.disease_activity.pain_vas_score = Some(10);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PAIN-001"));
}

#[test]
fn flags_anemia() {
    let mut data = create_stable_assessment();
    data.laboratory_markers.hemoglobin_value = Some(8.5);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-LAB-001"));
}

#[test]
fn flags_cardiovascular_comorbidity() {
    let mut data = create_stable_assessment();
    data.comorbidities.cardiovascular_disease = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-COMOR-001"));
}

#[test]
fn flags_work_disability() {
    let mut data = create_stable_assessment();
    data.functional_status.work_disability = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-FUNC-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_stable_assessment();
    // Create flags of different priorities
    data.imaging_findings.mri_bone_edema_present = "yes".to_string(); // high
    data.comorbidities.cardiovascular_disease = "yes".to_string(); // medium
    data.clinical_review.patient_education_provided = "no".to_string(); // low
    data.functional_status.assistive_devices_needed = "yes".to_string(); // low

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
