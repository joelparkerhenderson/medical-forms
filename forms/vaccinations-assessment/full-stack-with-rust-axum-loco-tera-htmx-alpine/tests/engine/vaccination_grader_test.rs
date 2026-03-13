use vaccinations_assessment_tera_crate::engine::vaccination_grader::calculate_vaccination_status;
use vaccinations_assessment_tera_crate::engine::vaccination_rules::all_rules;
use vaccinations_assessment_tera_crate::engine::types::*;

fn create_empty_assessment() -> AssessmentData {
    AssessmentData::default()
}

fn create_up_to_date_assessment() -> AssessmentData {
    let mut data = AssessmentData::default();

    // Patient Information (non-scored)
    data.patient_information.patient_name = "Jane Smith".to_string();
    data.patient_information.date_of_birth = "1990-05-15".to_string();
    data.patient_information.patient_sex = "female".to_string();
    data.patient_information.patient_age = "35".to_string();
    data.patient_information.nhs_number = "123 456 7890".to_string();
    data.patient_information.gp_practice = "Oak Tree Surgery".to_string();

    // Immunization History
    data.immunization_history.has_vaccination_record = "yes".to_string();
    data.immunization_history.record_source = "gpRecords".to_string();
    data.immunization_history.previous_adverse_reactions = "no".to_string();
    data.immunization_history.immunocompromised = "no".to_string();

    // Childhood Vaccinations — all complete (2)
    data.childhood_vaccinations.dtap_ipv_hib_hepb = Some(2);
    data.childhood_vaccinations.pneumococcal = Some(2);
    data.childhood_vaccinations.rotavirus = Some(2);
    data.childhood_vaccinations.meningitis_b = Some(2);
    data.childhood_vaccinations.mmr = Some(2);
    data.childhood_vaccinations.hib_menc = Some(2);
    data.childhood_vaccinations.preschool_booster = Some(2);

    // Adult Vaccinations — all complete (2)
    data.adult_vaccinations.td_ipv_booster = Some(2);
    data.adult_vaccinations.hpv = Some(2);
    data.adult_vaccinations.meningitis_acwy = Some(2);
    data.adult_vaccinations.influenza_annual = Some(2);
    data.adult_vaccinations.covid19 = Some(2);
    data.adult_vaccinations.shingles = Some(2);
    data.adult_vaccinations.pneumococcal_ppv = Some(2);

    // Travel Vaccinations
    data.travel_vaccinations.travel_planned = "no".to_string();

    // Occupational
    data.occupational_vaccinations.healthcare_worker = "no".to_string();

    // Contraindications
    data.contraindications_allergies.egg_allergy = "no".to_string();
    data.contraindications_allergies.gelatin_allergy = "no".to_string();
    data.contraindications_allergies.latex_allergy = "no".to_string();
    data.contraindications_allergies.neomycin_allergy = "no".to_string();
    data.contraindications_allergies.pregnant = "no".to_string();
    data.contraindications_allergies.severe_illness = "no".to_string();
    data.contraindications_allergies.previous_anaphylaxis = "no".to_string();

    // Consent — all 4s (Good)
    data.consent_information.information_provided = Some(4);
    data.consent_information.risks_explained = Some(4);
    data.consent_information.benefits_explained = Some(4);
    data.consent_information.questions_answered = Some(4);
    data.consent_information.consent_given = "yes".to_string();
    data.consent_information.consent_date = "2026-03-10".to_string();

    // Administration
    data.administration_record.vaccine_name = "Priorix".to_string();
    data.administration_record.batch_number = "ABCD1234".to_string();
    data.administration_record.administered_by = "Nurse Jones".to_string();
    data.administration_record.administration_date = "2026-03-10".to_string();

    // Clinical Review
    data.clinical_review.post_vaccination_observation = Some(4);
    data.clinical_review.immediate_reaction = "no".to_string();
    data.clinical_review.catch_up_schedule_needed = "no".to_string();
    data.clinical_review.referral_needed = "no".to_string();
    data.clinical_review.reviewing_clinician = "Dr Smith".to_string();

    data
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = create_empty_assessment();
    let (level, score, fired_rules) = calculate_vaccination_status(&data);
    assert_eq!(level, "draft");
    assert_eq!(score, 0.0);
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_up_to_date_for_all_complete() {
    let data = create_up_to_date_assessment();
    let (level, score, _fired_rules) = calculate_vaccination_status(&data);
    assert_eq!(level, "upToDate");
    // All vaccines complete (2/2 = 100%) * 0.8 + consent (4→75%) * 0.2 = 80+15 = 95
    assert_eq!(score, 95.0);
}

#[test]
fn returns_up_to_date_for_all_complete_with_perfect_consent() {
    let mut data = create_up_to_date_assessment();
    data.consent_information.information_provided = Some(5);
    data.consent_information.risks_explained = Some(5);
    data.consent_information.benefits_explained = Some(5);
    data.consent_information.questions_answered = Some(5);

    let (level, score, _fired_rules) = calculate_vaccination_status(&data);
    assert_eq!(level, "upToDate");
    assert_eq!(score, 100.0); // 100*0.8 + 100*0.2 = 100
}

#[test]
fn returns_overdue_for_none_given() {
    let mut data = create_up_to_date_assessment();
    // Set all vaccine items to 0 (not given)
    data.childhood_vaccinations.dtap_ipv_hib_hepb = Some(0);
    data.childhood_vaccinations.pneumococcal = Some(0);
    data.childhood_vaccinations.rotavirus = Some(0);
    data.childhood_vaccinations.meningitis_b = Some(0);
    data.childhood_vaccinations.mmr = Some(0);
    data.childhood_vaccinations.hib_menc = Some(0);
    data.childhood_vaccinations.preschool_booster = Some(0);
    data.adult_vaccinations.td_ipv_booster = Some(0);
    data.adult_vaccinations.hpv = Some(0);
    data.adult_vaccinations.meningitis_acwy = Some(0);
    data.adult_vaccinations.influenza_annual = Some(0);
    data.adult_vaccinations.covid19 = Some(0);
    data.adult_vaccinations.shingles = Some(0);
    data.adult_vaccinations.pneumococcal_ppv = Some(0);
    // Consent items low
    data.consent_information.information_provided = Some(1);
    data.consent_information.risks_explained = Some(1);
    data.consent_information.benefits_explained = Some(1);
    data.consent_information.questions_answered = Some(1);

    let (level, score, fired_rules) = calculate_vaccination_status(&data);
    assert_eq!(level, "overdue");
    assert_eq!(score, 0.0); // 0*0.8 + 0*0.2 = 0
    assert!(fired_rules.len() >= 5); // Multiple rules should fire
}

#[test]
fn returns_partially_complete_for_mixed() {
    let mut data = create_up_to_date_assessment();
    // Set childhood to partial (1), adults to complete (2)
    data.childhood_vaccinations.dtap_ipv_hib_hepb = Some(1);
    data.childhood_vaccinations.pneumococcal = Some(1);
    data.childhood_vaccinations.rotavirus = Some(1);
    data.childhood_vaccinations.meningitis_b = Some(1);
    data.childhood_vaccinations.mmr = Some(1);
    data.childhood_vaccinations.hib_menc = Some(1);
    data.childhood_vaccinations.preschool_booster = Some(1);

    let (level, _score, _fired_rules) = calculate_vaccination_status(&data);
    assert_eq!(level, "partiallyComplete");
}

#[test]
fn fires_mmr_not_given_rule() {
    let mut data = create_up_to_date_assessment();
    data.childhood_vaccinations.mmr = Some(0);

    let (_level, _score, fired_rules) = calculate_vaccination_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "VAX-001"));
}

#[test]
fn fires_anaphylaxis_rule() {
    let mut data = create_up_to_date_assessment();
    data.contraindications_allergies.previous_anaphylaxis = "yes".to_string();

    let (_level, _score, fired_rules) = calculate_vaccination_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "VAX-003"));
}

#[test]
fn fires_consent_not_given_rule() {
    let mut data = create_up_to_date_assessment();
    data.consent_information.consent_given = "no".to_string();

    let (_level, _score, fired_rules) = calculate_vaccination_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "VAX-005"));
}

#[test]
fn fires_all_childhood_complete_rule() {
    let data = create_up_to_date_assessment();
    let (_level, _score, fired_rules) = calculate_vaccination_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "VAX-016"));
}

#[test]
fn fires_all_adult_complete_rule() {
    let data = create_up_to_date_assessment();
    let (_level, _score, fired_rules) = calculate_vaccination_status(&data);
    assert!(fired_rules.iter().any(|r| r.id == "VAX-017"));
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
fn has_exactly_20_rules() {
    let rules = all_rules();
    assert_eq!(rules.len(), 20);
}

#[test]
fn returns_contraindicated_for_anaphylaxis_and_immunocompromised() {
    let mut data = create_up_to_date_assessment();
    data.contraindications_allergies.previous_anaphylaxis = "yes".to_string();
    data.immunization_history.immunocompromised = "yes".to_string();

    let (level, _score, _fired_rules) = calculate_vaccination_status(&data);
    assert_eq!(level, "contraindicated");
}
