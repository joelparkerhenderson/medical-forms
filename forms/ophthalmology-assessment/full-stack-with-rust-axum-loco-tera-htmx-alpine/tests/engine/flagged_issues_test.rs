use ophthalmology_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use ophthalmology_assessment_tera_crate::engine::types::*;

fn create_normal_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.exam_date = "2026-03-01".to_string();
    data.patient_information.patient_name = "Jane Doe".to_string();
    data.patient_information.referring_clinician = "Dr Jones".to_string();

    data.visual_acuity.right_best_corrected = "6/6".to_string();
    data.visual_acuity.left_best_corrected = "6/6".to_string();

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

    data.intraocular_pressure.right_iop = Some(16);
    data.intraocular_pressure.left_iop = Some(15);

    data.posterior_segment.right_optic_disc = Some(4);
    data.posterior_segment.left_optic_disc = Some(4);
    data.posterior_segment.right_macula = Some(4);
    data.posterior_segment.left_macula = Some(4);
    data.posterior_segment.right_vessels = Some(4);
    data.posterior_segment.left_vessels = Some(4);
    data.posterior_segment.right_peripheral_retina = Some(4);
    data.posterior_segment.left_peripheral_retina = Some(4);
    data.posterior_segment.right_vitreous = Some(4);
    data.posterior_segment.left_vitreous = Some(4);

    data.visual_fields.right_confrontation = Some(4);
    data.visual_fields.left_confrontation = Some(4);
    data.visual_fields.visual_field_reliability = Some(4);

    data.ocular_motility.extraocular_movements = Some(4);
    data.ocular_motility.pupil_right_direct = Some(4);
    data.ocular_motility.pupil_left_direct = Some(4);
    data.ocular_motility.pupil_right_consensual = Some(4);
    data.ocular_motility.pupil_left_consensual = Some(4);
    data.ocular_motility.convergence = Some(4);
    data.ocular_motility.relative_afferent_pupil_defect = "no".to_string();

    data.clinical_review.surgical_intervention_needed = "no".to_string();
    data.clinical_review.referral_required = "no".to_string();

    data
}

#[test]
fn no_flags_for_normal_patient() {
    let data = create_normal_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_critically_elevated_iop() {
    let mut data = create_normal_assessment();
    data.intraocular_pressure.right_iop = Some(45);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IOP-001"));
}

#[test]
fn flags_elevated_iop() {
    let mut data = create_normal_assessment();
    data.intraocular_pressure.left_iop = Some(25);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-IOP-002"));
}

#[test]
fn flags_rapd_detected() {
    let mut data = create_normal_assessment();
    data.ocular_motility.relative_afferent_pupil_defect = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-RAPD-001"));
}

#[test]
fn flags_optic_disc_severely_abnormal() {
    let mut data = create_normal_assessment();
    data.posterior_segment.right_optic_disc = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-DISC-001"));
}

#[test]
fn flags_macular_pathology() {
    let mut data = create_normal_assessment();
    data.posterior_segment.left_macula = Some(1);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MAC-001"));
}

#[test]
fn flags_surgical_intervention_needed() {
    let mut data = create_normal_assessment();
    data.clinical_review.surgical_intervention_needed = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SURG-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_normal_assessment();
    // Create flags of different priorities
    data.intraocular_pressure.right_iop = Some(45); // high (FLAG-IOP-001)
    data.anterior_segment.right_cornea = Some(1); // medium (FLAG-COR-001)
    data.visual_fields.visual_field_reliability = Some(1); // low (FLAG-VF-002)

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
