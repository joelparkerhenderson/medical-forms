use casualty_card_form_tera_crate::engine::types::{AssessmentData, Allergy, Medication};
use casualty_card_form_tera_crate::engine::flagged_issues::detect_additional_flags;

#[test]
fn test_no_flags_on_default_data() {
    let data = AssessmentData::default();
    let flags = detect_additional_flags(&data);
    assert!(flags.is_empty());
}

#[test]
fn test_safeguarding_concern_flag() {
    let mut data = AssessmentData::default();
    data.safeguarding.safeguarding_concern = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-SAFEGUARD"));
}

#[test]
fn test_severe_allergy_flag() {
    let mut data = AssessmentData::default();
    data.allergies.push(Allergy {
        allergen: "Penicillin".to_string(),
        reaction: "Anaphylaxis".to_string(),
        severity: "anaphylaxis".to_string(),
    });
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ALLERGY-SEVERE"));
}

#[test]
fn test_low_gcs_flag() {
    let mut data = AssessmentData::default();
    data.primary_survey.gcs_total = Some(6);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-GCS-LOW"));
}

#[test]
fn test_airway_obstructed_flag() {
    let mut data = AssessmentData::default();
    data.primary_survey.airway_status = "obstructed".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AIRWAY"));
}

#[test]
fn test_haemorrhage_flag() {
    let mut data = AssessmentData::default();
    data.primary_survey.haemorrhage = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-HAEMORRHAGE"));
}

#[test]
fn test_anticoagulant_flag() {
    let mut data = AssessmentData::default();
    data.medications.push(Medication {
        name: "Rivaroxaban".to_string(),
        dose: "20mg".to_string(),
        frequency: "daily".to_string(),
    });
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANTICOAGULANT"));
}
