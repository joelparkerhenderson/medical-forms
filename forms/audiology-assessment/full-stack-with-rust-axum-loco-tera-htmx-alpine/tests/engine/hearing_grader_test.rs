use audiology_assessment_tera_crate::engine::hearing_grader::calculate_hearing_level;
use audiology_assessment_tera_crate::engine::hearing_rules::all_rules;
use audiology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_normal_hearing_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1985-06-15".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.assessment_date = "2026-03-09".to_string();
    data.patient_information.audiologist_name = "Dr Jones".to_string();
    data.patient_information.clinic_location = "Main Clinic".to_string();

    // Hearing History
    data.hearing_history.onset_type = "gradual".to_string();
    data.hearing_history.affected_ear = "both".to_string();
    data.hearing_history.family_history = "no".to_string();
    data.hearing_history.noise_exposure_history = "no".to_string();
    data.hearing_history.ototoxic_medication = "no".to_string();

    // Normal hearing thresholds (all <= 20 dB HL)
    data.audiometric_results.right_ac_250 = Some(10);
    data.audiometric_results.right_ac_500 = Some(15);
    data.audiometric_results.right_ac_1000 = Some(10);
    data.audiometric_results.right_ac_2000 = Some(15);
    data.audiometric_results.right_ac_4000 = Some(20);
    data.audiometric_results.right_ac_8000 = Some(20);

    data.audiometric_results.left_ac_250 = Some(10);
    data.audiometric_results.left_ac_500 = Some(15);
    data.audiometric_results.left_ac_1000 = Some(10);
    data.audiometric_results.left_ac_2000 = Some(15);
    data.audiometric_results.left_ac_4000 = Some(20);
    data.audiometric_results.left_ac_8000 = Some(25);

    // Normal bone conduction
    data.audiometric_results.right_bc_500 = Some(10);
    data.audiometric_results.right_bc_1000 = Some(10);
    data.audiometric_results.right_bc_2000 = Some(10);
    data.audiometric_results.right_bc_4000 = Some(15);

    data.audiometric_results.left_bc_500 = Some(10);
    data.audiometric_results.left_bc_1000 = Some(10);
    data.audiometric_results.left_bc_2000 = Some(10);
    data.audiometric_results.left_bc_4000 = Some(15);

    // Speech audiometry
    data.audiometric_results.right_srt = Some(15);
    data.audiometric_results.right_wrs = Some(100);
    data.audiometric_results.left_srt = Some(15);
    data.audiometric_results.left_wrs = Some(96);

    // Normal tympanometry
    data.audiometric_results.right_tympanogram_type = "A".to_string();
    data.audiometric_results.left_tympanogram_type = "A".to_string();

    // No tinnitus
    data.tinnitus.tinnitus_present = "no".to_string();

    // No dizziness
    data.balance_assessment.dizziness_present = "no".to_string();

    // Minimal communication impact
    data.communication_impact.difficulty_understanding_speech = Some(1);
    data.communication_impact.social_withdrawal = Some(1);
    data.communication_impact.frustration_level = Some(1);
    data.communication_impact.asking_to_repeat = Some(1);
    data.communication_impact.avoiding_situations = Some(1);
    data.communication_impact.impact_on_work = Some(1);
    data.communication_impact.impact_on_relationships = Some(1);

    // No hearing aid
    data.hearing_aid_assessment.current_hearing_aid = "no".to_string();
    data.hearing_aid_assessment.interest_in_hearing_aid = "no".to_string();

    // Otoscopic
    data.otoscopic_examination.active_infection = "no".to_string();
    data.otoscopic_examination.right_tympanic_membrane = "normal".to_string();
    data.otoscopic_examination.left_tympanic_membrane = "normal".to_string();
    data.otoscopic_examination.right_cerumen = "none".to_string();
    data.otoscopic_examination.left_cerumen = "none".to_string();

    // Clinical review
    data.clinical_review.loss_type_right = "normal".to_string();
    data.clinical_review.loss_type_left = "normal".to_string();

    // Symptoms
    data.symptoms_assessment.ear_discharge = "no".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, pta, fired_rules) = calculate_hearing_level(&data);
    assert_eq!(level, "draft");
    assert_eq!(pta, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_normal_for_normal_thresholds() {
    let data = create_normal_hearing_assessment();
    let (level, pta, _fired_rules) = calculate_hearing_level(&data);
    assert_eq!(level, "normal");
    assert!(pta <= 25.0, "PTA should be <= 25 for normal hearing, got {}", pta);
}

#[test]
fn returns_mild_for_mild_thresholds() {
    let mut data = create_normal_hearing_assessment();
    // Set right ear to mild loss (PTA ~35 dB)
    data.audiometric_results.right_ac_500 = Some(30);
    data.audiometric_results.right_ac_1000 = Some(35);
    data.audiometric_results.right_ac_2000 = Some(35);
    data.audiometric_results.right_ac_4000 = Some(40);
    // Left ear stays normal, so better-ear PTA is left (~15)
    // To get mild, set left ear too
    data.audiometric_results.left_ac_500 = Some(30);
    data.audiometric_results.left_ac_1000 = Some(30);
    data.audiometric_results.left_ac_2000 = Some(35);
    data.audiometric_results.left_ac_4000 = Some(40);

    let (level, pta, _fired_rules) = calculate_hearing_level(&data);
    assert_eq!(level, "mild");
    assert!(pta > 25.0 && pta <= 40.0, "PTA should be 26-40 for mild, got {}", pta);
}

#[test]
fn returns_moderate_for_moderate_thresholds() {
    let mut data = create_normal_hearing_assessment();
    // Set both ears to moderate loss (PTA ~50 dB)
    data.audiometric_results.right_ac_500 = Some(45);
    data.audiometric_results.right_ac_1000 = Some(50);
    data.audiometric_results.right_ac_2000 = Some(50);
    data.audiometric_results.right_ac_4000 = Some(55);

    data.audiometric_results.left_ac_500 = Some(45);
    data.audiometric_results.left_ac_1000 = Some(50);
    data.audiometric_results.left_ac_2000 = Some(50);
    data.audiometric_results.left_ac_4000 = Some(55);

    let (level, pta, _fired_rules) = calculate_hearing_level(&data);
    assert_eq!(level, "moderate");
    assert!(pta > 40.0 && pta <= 55.0, "PTA should be 41-55 for moderate, got {}", pta);
}

#[test]
fn returns_severe_for_severe_thresholds() {
    let mut data = create_normal_hearing_assessment();
    // Set both ears to severe loss (PTA ~80 dB)
    data.audiometric_results.right_ac_500 = Some(75);
    data.audiometric_results.right_ac_1000 = Some(80);
    data.audiometric_results.right_ac_2000 = Some(80);
    data.audiometric_results.right_ac_4000 = Some(85);

    data.audiometric_results.left_ac_500 = Some(75);
    data.audiometric_results.left_ac_1000 = Some(80);
    data.audiometric_results.left_ac_2000 = Some(80);
    data.audiometric_results.left_ac_4000 = Some(85);

    let (level, pta, _fired_rules) = calculate_hearing_level(&data);
    assert_eq!(level, "severe");
    assert!(pta > 70.0 && pta <= 90.0, "PTA should be 71-90 for severe, got {}", pta);
}

#[test]
fn returns_profound_for_profound_thresholds() {
    let mut data = create_normal_hearing_assessment();
    // Set both ears to profound loss (PTA > 90 dB)
    data.audiometric_results.right_ac_500 = Some(95);
    data.audiometric_results.right_ac_1000 = Some(100);
    data.audiometric_results.right_ac_2000 = Some(100);
    data.audiometric_results.right_ac_4000 = Some(105);

    data.audiometric_results.left_ac_500 = Some(95);
    data.audiometric_results.left_ac_1000 = Some(100);
    data.audiometric_results.left_ac_2000 = Some(100);
    data.audiometric_results.left_ac_4000 = Some(105);

    let (level, pta, _fired_rules) = calculate_hearing_level(&data);
    assert_eq!(level, "profound");
    assert!(pta > 90.0, "PTA should be >90 for profound, got {}", pta);
}

#[test]
fn fires_asymmetric_loss_rule() {
    let mut data = create_normal_hearing_assessment();
    // Right ear normal, left ear moderate loss -> asymmetry > 15 dB
    data.audiometric_results.left_ac_500 = Some(45);
    data.audiometric_results.left_ac_1000 = Some(50);
    data.audiometric_results.left_ac_2000 = Some(50);
    data.audiometric_results.left_ac_4000 = Some(55);

    let (_level, _pta, fired_rules) = calculate_hearing_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AUD-002"),
            "Should fire AUD-002 for asymmetric hearing loss");
}

#[test]
fn fires_noise_exposure_rule() {
    let mut data = create_normal_hearing_assessment();
    data.hearing_history.noise_exposure_history = "yes".to_string();
    data.hearing_history.hearing_protection_use = "never".to_string();

    let (_level, _pta, fired_rules) = calculate_hearing_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AUD-011"),
            "Should fire AUD-011 for noise exposure without protection");
}

#[test]
fn fires_normal_hearing_rule_for_normal_thresholds() {
    let data = create_normal_hearing_assessment();
    let (_level, _pta, fired_rules) = calculate_hearing_level(&data);
    assert!(fired_rules.iter().any(|r| r.id == "AUD-016"),
            "Should fire AUD-016 for normal hearing thresholds");
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
