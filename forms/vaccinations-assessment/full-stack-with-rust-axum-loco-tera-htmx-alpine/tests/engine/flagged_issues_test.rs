use vaccinations_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use vaccinations_assessment_tera_crate::engine::types::*;

fn create_up_to_date_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();

    data.immunization_history.has_vaccination_record = "yes".to_string();
    data.immunization_history.previous_adverse_reactions = "no".to_string();
    data.immunization_history.immunocompromised = "no".to_string();

    data.childhood_vaccinations.dtap_ipv_hib_hepb = Some(2);
    data.childhood_vaccinations.pneumococcal = Some(2);
    data.childhood_vaccinations.rotavirus = Some(2);
    data.childhood_vaccinations.meningitis_b = Some(2);
    data.childhood_vaccinations.mmr = Some(2);
    data.childhood_vaccinations.hib_menc = Some(2);
    data.childhood_vaccinations.preschool_booster = Some(2);

    data.adult_vaccinations.td_ipv_booster = Some(2);
    data.adult_vaccinations.hpv = Some(2);
    data.adult_vaccinations.meningitis_acwy = Some(2);
    data.adult_vaccinations.influenza_annual = Some(2);
    data.adult_vaccinations.covid19 = Some(2);
    data.adult_vaccinations.shingles = Some(2);
    data.adult_vaccinations.pneumococcal_ppv = Some(2);

    data.travel_vaccinations.travel_planned = "no".to_string();

    data.occupational_vaccinations.healthcare_worker = "no".to_string();

    data.contraindications_allergies.egg_allergy = "no".to_string();
    data.contraindications_allergies.gelatin_allergy = "no".to_string();
    data.contraindications_allergies.latex_allergy = "no".to_string();
    data.contraindications_allergies.neomycin_allergy = "no".to_string();
    data.contraindications_allergies.pregnant = "no".to_string();
    data.contraindications_allergies.severe_illness = "no".to_string();
    data.contraindications_allergies.previous_anaphylaxis = "no".to_string();

    data.consent_information.information_provided = Some(4);
    data.consent_information.risks_explained = Some(4);
    data.consent_information.benefits_explained = Some(4);
    data.consent_information.questions_answered = Some(4);
    data.consent_information.consent_given = "yes".to_string();

    data.clinical_review.post_vaccination_observation = Some(4);
    data.clinical_review.immediate_reaction = "no".to_string();
    data.clinical_review.catch_up_schedule_needed = "no".to_string();
    data.clinical_review.referral_needed = "no".to_string();

    data
}

#[test]
fn no_flags_for_up_to_date_patient() {
    let data = create_up_to_date_assessment();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_mmr_not_given() {
    let mut data = create_up_to_date_assessment();
    data.childhood_vaccinations.mmr = Some(0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-001"));
}

#[test]
fn flags_previous_anaphylaxis() {
    let mut data = create_up_to_date_assessment();
    data.contraindications_allergies.previous_anaphylaxis = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-002"));
}

#[test]
fn flags_immunocompromised() {
    let mut data = create_up_to_date_assessment();
    data.immunization_history.immunocompromised = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-003"));
}

#[test]
fn flags_immediate_reaction() {
    let mut data = create_up_to_date_assessment();
    data.clinical_review.immediate_reaction = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-004"));
}

#[test]
fn flags_pregnant_patient() {
    let mut data = create_up_to_date_assessment();
    data.contraindications_allergies.pregnant = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-005"));
}

#[test]
fn flags_no_vaccination_record() {
    let mut data = create_up_to_date_assessment();
    data.immunization_history.has_vaccination_record = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-006"));
}

#[test]
fn flags_healthcare_worker_without_hepb() {
    let mut data = create_up_to_date_assessment();
    data.occupational_vaccinations.healthcare_worker = "yes".to_string();
    data.occupational_vaccinations.hepatitis_b_occupational = Some(0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-007"));
}

#[test]
fn flags_consent_not_given() {
    let mut data = create_up_to_date_assessment();
    data.consent_information.consent_given = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-011"));
}

#[test]
fn flags_severe_illness() {
    let mut data = create_up_to_date_assessment();
    data.contraindications_allergies.severe_illness = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-VAX-013"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_up_to_date_assessment();
    // Create flags of different priorities
    data.clinical_review.immediate_reaction = "yes".to_string(); // high
    data.immunization_history.has_vaccination_record = "no".to_string(); // medium
    data.clinical_review.referral_needed = "yes".to_string(); // low

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
