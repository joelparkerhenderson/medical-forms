use audiology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use audiology_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();

    data.hearing_history.onset_type = "gradual".to_string();
    data.hearing_history.noise_exposure_history = "no".to_string();
    data.hearing_history.ototoxic_medication = "no".to_string();
    data.hearing_history.family_history = "no".to_string();

    data.audiometric_results.right_ac_500 = Some(15);
    data.audiometric_results.right_ac_1000 = Some(10);
    data.audiometric_results.right_ac_2000 = Some(15);
    data.audiometric_results.right_ac_4000 = Some(20);

    data.audiometric_results.left_ac_500 = Some(15);
    data.audiometric_results.left_ac_1000 = Some(10);
    data.audiometric_results.left_ac_2000 = Some(15);
    data.audiometric_results.left_ac_4000 = Some(20);

    data.audiometric_results.right_bc_500 = Some(10);
    data.audiometric_results.right_bc_1000 = Some(10);
    data.audiometric_results.right_bc_2000 = Some(10);
    data.audiometric_results.right_bc_4000 = Some(15);

    data.audiometric_results.left_bc_500 = Some(10);
    data.audiometric_results.left_bc_1000 = Some(10);
    data.audiometric_results.left_bc_2000 = Some(10);
    data.audiometric_results.left_bc_4000 = Some(15);

    data.audiometric_results.right_wrs = Some(100);
    data.audiometric_results.left_wrs = Some(96);

    data.tinnitus.tinnitus_present = "no".to_string();
    data.balance_assessment.dizziness_present = "no".to_string();
    data.balance_assessment.falls_history = "no".to_string();
    data.otoscopic_examination.active_infection = "no".to_string();
    data.otoscopic_examination.right_tympanic_membrane = "normal".to_string();
    data.otoscopic_examination.left_tympanic_membrane = "normal".to_string();
    data.otoscopic_examination.right_cerumen = "none".to_string();
    data.otoscopic_examination.left_cerumen = "none".to_string();
    data.symptoms_assessment.ear_discharge = "no".to_string();
    data.hearing_aid_assessment.current_hearing_aid = "no".to_string();
    data.hearing_aid_assessment.interest_in_hearing_aid = "yes".to_string();

    data
}

#[test]
fn no_flags_for_normal_patient() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_sudden_hearing_loss() {
    let mut data = create_normal_assessment();
    data.hearing_history.onset_type = "sudden".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUD-001"));
}

#[test]
fn flags_asymmetric_loss() {
    let mut data = create_normal_assessment();
    data.audiometric_results.left_ac_500 = Some(50);
    data.audiometric_results.left_ac_1000 = Some(55);
    data.audiometric_results.left_ac_2000 = Some(55);
    data.audiometric_results.left_ac_4000 = Some(60);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUD-002"));
}

#[test]
fn flags_noise_exposure() {
    let mut data = create_normal_assessment();
    data.hearing_history.noise_exposure_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUD-003"));
}

#[test]
fn flags_ototoxic_medication() {
    let mut data = create_normal_assessment();
    data.hearing_history.ototoxic_medication = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUD-004"));
}

#[test]
fn flags_falls_risk() {
    let mut data = create_normal_assessment();
    data.balance_assessment.dizziness_present = "yes".to_string();
    data.balance_assessment.falls_history = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUD-005"));
}

#[test]
fn flags_active_infection() {
    let mut data = create_normal_assessment();
    data.otoscopic_examination.active_infection = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AUD-007"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.hearing_history.onset_type = "sudden".to_string(); // high
    data.hearing_history.noise_exposure_history = "yes".to_string(); // medium
    data.hearing_history.family_history = "yes".to_string(); // low

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
