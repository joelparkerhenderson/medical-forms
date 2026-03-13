use opthamology_assessment_tera_crate::engine::ophthalmology_grader::calculate_impairment;
use opthamology_assessment_tera_crate::engine::ophthalmology_rules::all_rules;
use opthamology_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.exam_date = "2026-03-01".to_string();
    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.date_of_birth = "1960-05-15".to_string();
    data.patient_information.patient_age = "65".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.referring_clinician = "Dr Jones".to_string();
    data.patient_information.reason_for_visit = "Routine eye examination".to_string();

    // Visual Acuity (non-scored, string-based)
    data.visual_acuity.right_uncorrected = "6/9".to_string();
    data.visual_acuity.left_uncorrected = "6/9".to_string();
    data.visual_acuity.right_best_corrected = "6/6".to_string();
    data.visual_acuity.left_best_corrected = "6/6".to_string();
    data.visual_acuity.right_pinhole = "6/6".to_string();
    data.visual_acuity.left_pinhole = "6/6".to_string();
    data.visual_acuity.right_near_vision = "N5".to_string();
    data.visual_acuity.left_near_vision = "N5".to_string();
    data.visual_acuity.visual_acuity_method = "snellen".to_string();

    // Refraction (non-scored)
    data.refraction.right_sphere = "-1.00".to_string();
    data.refraction.left_sphere = "-0.75".to_string();
    data.refraction.refraction_method = "subjective".to_string();

    // Anterior Segment — all 4s
    data.anterior_segment.right_lids = Some(4);
    data.anterior_segment.left_lids = Some(4);
    data.anterior_segment.right_conjunctiva = Some(4);
    data.anterior_segment.left_conjunctiva = Some(4);
    data.anterior_segment.right_cornea = Some(4);
    data.anterior_segment.left_cornea = Some(4);
    data.anterior_segment.right_anterior_chamber = Some(4);
    data.anterior_segment.left_anterior_chamber = Some(4);
    data.anterior_segment.right_iris = Some(4);
    data.anterior_segment.left_iris = Some(4);
    data.anterior_segment.right_lens = Some(4);
    data.anterior_segment.left_lens = Some(4);

    // Intraocular Pressure
    data.intraocular_pressure.right_iop = Some(16);
    data.intraocular_pressure.left_iop = Some(15);
    data.intraocular_pressure.tonometry_method = "goldmann".to_string();

    // Posterior Segment — all 4s
    data.posterior_segment.right_optic_disc = Some(4);
    data.posterior_segment.left_optic_disc = Some(4);
    data.posterior_segment.right_cup_disc_ratio = "0.3".to_string();
    data.posterior_segment.left_cup_disc_ratio = "0.3".to_string();
    data.posterior_segment.right_macula = Some(4);
    data.posterior_segment.left_macula = Some(4);
    data.posterior_segment.right_vessels = Some(4);
    data.posterior_segment.left_vessels = Some(4);
    data.posterior_segment.right_peripheral_retina = Some(4);
    data.posterior_segment.left_peripheral_retina = Some(4);
    data.posterior_segment.right_vitreous = Some(4);
    data.posterior_segment.left_vitreous = Some(4);

    // Visual Fields — all 4s
    data.visual_fields.right_confrontation = Some(4);
    data.visual_fields.left_confrontation = Some(4);
    data.visual_fields.visual_field_reliability = Some(4);
    data.visual_fields.visual_field_test_type = "humphrey24-2".to_string();

    // Ocular Motility — all 4s
    data.ocular_motility.extraocular_movements = Some(4);
    data.ocular_motility.pupil_right_direct = Some(4);
    data.ocular_motility.pupil_left_direct = Some(4);
    data.ocular_motility.pupil_right_consensual = Some(4);
    data.ocular_motility.pupil_left_consensual = Some(4);
    data.ocular_motility.convergence = Some(4);
    data.ocular_motility.relative_afferent_pupil_defect = "no".to_string();

    // Special Investigations (non-scored)
    data.special_investigations.oct_performed = "yes".to_string();
    data.special_investigations.oct_right_findings = "Normal".to_string();
    data.special_investigations.oct_left_findings = "Normal".to_string();

    // Clinical Review (non-scored)
    data.clinical_review.primary_diagnosis = "Normal examination".to_string();
    data.clinical_review.surgical_intervention_needed = "no".to_string();
    data.clinical_review.referral_required = "no".to_string();
    data.clinical_review.follow_up_interval = "12months".to_string();
    data.clinical_review.clinician_name = "Dr A. Patel".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_mild_impairment_for_all_fours() {
    let data = create_normal_assessment();
    let (level, score, _fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "mildImpairment");
    assert_eq!(score, 75.0); // (4-1)/4 * 100 = 75
}

#[test]
fn returns_normal_for_all_fives() {
    let mut data = create_normal_assessment();
    // Set all clinical items to 5
    data.anterior_segment.right_lids = Some(5);
    data.anterior_segment.left_lids = Some(5);
    data.anterior_segment.right_conjunctiva = Some(5);
    data.anterior_segment.left_conjunctiva = Some(5);
    data.anterior_segment.right_cornea = Some(5);
    data.anterior_segment.left_cornea = Some(5);
    data.anterior_segment.right_anterior_chamber = Some(5);
    data.anterior_segment.left_anterior_chamber = Some(5);
    data.anterior_segment.right_iris = Some(5);
    data.anterior_segment.left_iris = Some(5);
    data.anterior_segment.right_lens = Some(5);
    data.anterior_segment.left_lens = Some(5);
    data.posterior_segment.right_optic_disc = Some(5);
    data.posterior_segment.left_optic_disc = Some(5);
    data.posterior_segment.right_macula = Some(5);
    data.posterior_segment.left_macula = Some(5);
    data.posterior_segment.right_vessels = Some(5);
    data.posterior_segment.left_vessels = Some(5);
    data.posterior_segment.right_peripheral_retina = Some(5);
    data.posterior_segment.left_peripheral_retina = Some(5);
    data.posterior_segment.right_vitreous = Some(5);
    data.posterior_segment.left_vitreous = Some(5);
    data.visual_fields.right_confrontation = Some(5);
    data.visual_fields.left_confrontation = Some(5);
    data.visual_fields.visual_field_reliability = Some(5);
    data.ocular_motility.extraocular_movements = Some(5);
    data.ocular_motility.pupil_right_direct = Some(5);
    data.ocular_motility.pupil_left_direct = Some(5);
    data.ocular_motility.pupil_right_consensual = Some(5);
    data.ocular_motility.pupil_left_consensual = Some(5);
    data.ocular_motility.convergence = Some(5);

    let (level, score, _fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "normal");
    assert_eq!(score, 100.0);
}

#[test]
fn returns_blind_for_all_ones() {
    let mut data = create_normal_assessment();
    // Set all clinical items to 1
    data.anterior_segment.right_lids = Some(1);
    data.anterior_segment.left_lids = Some(1);
    data.anterior_segment.right_conjunctiva = Some(1);
    data.anterior_segment.left_conjunctiva = Some(1);
    data.anterior_segment.right_cornea = Some(1);
    data.anterior_segment.left_cornea = Some(1);
    data.anterior_segment.right_anterior_chamber = Some(1);
    data.anterior_segment.left_anterior_chamber = Some(1);
    data.anterior_segment.right_iris = Some(1);
    data.anterior_segment.left_iris = Some(1);
    data.anterior_segment.right_lens = Some(1);
    data.anterior_segment.left_lens = Some(1);
    data.posterior_segment.right_optic_disc = Some(1);
    data.posterior_segment.left_optic_disc = Some(1);
    data.posterior_segment.right_macula = Some(1);
    data.posterior_segment.left_macula = Some(1);
    data.posterior_segment.right_vessels = Some(1);
    data.posterior_segment.left_vessels = Some(1);
    data.posterior_segment.right_peripheral_retina = Some(1);
    data.posterior_segment.left_peripheral_retina = Some(1);
    data.posterior_segment.right_vitreous = Some(1);
    data.posterior_segment.left_vitreous = Some(1);
    data.visual_fields.right_confrontation = Some(1);
    data.visual_fields.left_confrontation = Some(1);
    data.visual_fields.visual_field_reliability = Some(1);
    data.ocular_motility.extraocular_movements = Some(1);
    data.ocular_motility.pupil_right_direct = Some(1);
    data.ocular_motility.pupil_left_direct = Some(1);
    data.ocular_motility.pupil_right_consensual = Some(1);
    data.ocular_motility.pupil_left_consensual = Some(1);
    data.ocular_motility.convergence = Some(1);
    data.visual_acuity.right_best_corrected = "NPL".to_string();
    data.visual_acuity.left_best_corrected = "NPL".to_string();

    let (level, score, fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "blind");
    assert_eq!(score, 0.0);
    assert!(fired_rules.len() >= 5); // Multiple high concern rules should fire
}

#[test]
fn fires_high_iop_rule() {
    let mut data = create_normal_assessment();
    data.intraocular_pressure.right_iop = Some(35);

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OPH-002"));
}

#[test]
fn fires_elevated_iop_rule() {
    let mut data = create_normal_assessment();
    data.intraocular_pressure.left_iop = Some(25);

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OPH-006"));
}

#[test]
fn fires_blindness_rule_for_npl() {
    let mut data = create_normal_assessment();
    data.visual_acuity.right_best_corrected = "NPL".to_string();

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OPH-001"));
}

#[test]
fn fires_normal_vision_rule_for_both_eyes_normal() {
    let mut data = create_normal_assessment();
    data.visual_acuity.right_best_corrected = "6/6".to_string();
    data.visual_acuity.left_best_corrected = "6/6".to_string();

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OPH-016"));
}

#[test]
fn fires_rapd_rule() {
    let mut data = create_normal_assessment();
    data.ocular_motility.relative_afferent_pupil_defect = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OPH-015"));
}

#[test]
fn fires_positive_rules_for_all_normal_findings() {
    let mut data = create_normal_assessment();
    // Set all anterior segment to 5
    data.anterior_segment.right_lids = Some(5);
    data.anterior_segment.left_lids = Some(5);
    data.anterior_segment.right_conjunctiva = Some(5);
    data.anterior_segment.left_conjunctiva = Some(5);
    data.anterior_segment.right_cornea = Some(5);
    data.anterior_segment.left_cornea = Some(5);
    data.anterior_segment.right_anterior_chamber = Some(5);
    data.anterior_segment.left_anterior_chamber = Some(5);
    data.anterior_segment.right_iris = Some(5);
    data.anterior_segment.left_iris = Some(5);
    data.anterior_segment.right_lens = Some(5);
    data.anterior_segment.left_lens = Some(5);

    let (_level, _score, fired_rules) = calculate_impairment(&data);
    assert!(fired_rules.iter().any(|r| r.id == "OPH-018")); // All anterior segment normal
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

#[test]
fn returns_moderate_impairment_for_all_threes() {
    let mut data = create_normal_assessment();
    // Set all clinical items to 3
    data.anterior_segment.right_lids = Some(3);
    data.anterior_segment.left_lids = Some(3);
    data.anterior_segment.right_conjunctiva = Some(3);
    data.anterior_segment.left_conjunctiva = Some(3);
    data.anterior_segment.right_cornea = Some(3);
    data.anterior_segment.left_cornea = Some(3);
    data.anterior_segment.right_anterior_chamber = Some(3);
    data.anterior_segment.left_anterior_chamber = Some(3);
    data.anterior_segment.right_iris = Some(3);
    data.anterior_segment.left_iris = Some(3);
    data.anterior_segment.right_lens = Some(3);
    data.anterior_segment.left_lens = Some(3);
    data.posterior_segment.right_optic_disc = Some(3);
    data.posterior_segment.left_optic_disc = Some(3);
    data.posterior_segment.right_macula = Some(3);
    data.posterior_segment.left_macula = Some(3);
    data.posterior_segment.right_vessels = Some(3);
    data.posterior_segment.left_vessels = Some(3);
    data.posterior_segment.right_peripheral_retina = Some(3);
    data.posterior_segment.left_peripheral_retina = Some(3);
    data.posterior_segment.right_vitreous = Some(3);
    data.posterior_segment.left_vitreous = Some(3);
    data.visual_fields.right_confrontation = Some(3);
    data.visual_fields.left_confrontation = Some(3);
    data.visual_fields.visual_field_reliability = Some(3);
    data.ocular_motility.extraocular_movements = Some(3);
    data.ocular_motility.pupil_right_direct = Some(3);
    data.ocular_motility.pupil_left_direct = Some(3);
    data.ocular_motility.pupil_right_consensual = Some(3);
    data.ocular_motility.pupil_left_consensual = Some(3);
    data.ocular_motility.convergence = Some(3);

    let (level, score, _fired_rules) = calculate_impairment(&data);
    assert_eq!(level, "moderateImpairment");
    assert_eq!(score, 50.0); // (3-1)/4 * 100 = 50
}
