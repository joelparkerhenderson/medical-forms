use pre_op_assessment_tera_crate::engine::flagged_issues::detect_additional_flags;
use pre_op_assessment_tera_crate::engine::types::{Allergy, AssessmentData};

fn create_healthy_patient() -> AssessmentData {
    serde_json::from_value(serde_json::json!({
        "demographics": {
            "nhsNumber": "",
            "firstName": "John",
            "lastName": "Doe",
            "dateOfBirth": "1985-01-01",
            "sex": "male",
            "weight": 75.0,
            "height": 175.0,
            "bmi": 24.5,
            "plannedProcedure": "Inguinal hernia repair",
            "procedureUrgency": "elective"
        },
        "cardiovascular": {
            "hypertension": "no",
            "hypertensionControlled": "",
            "ischemicHeartDisease": "no",
            "ihdDetails": "",
            "heartFailure": "no",
            "heartFailureNYHA": "",
            "valvularDisease": "no",
            "valvularDetails": "",
            "arrhythmia": "no",
            "arrhythmiaType": "",
            "pacemaker": "no",
            "recentMI": "no",
            "recentMIWeeks": null
        },
        "respiratory": {
            "asthma": "no",
            "asthmaFrequency": "",
            "copd": "no",
            "copdSeverity": "",
            "osa": "no",
            "osaCPAP": "",
            "smoking": "never",
            "smokingPackYears": null,
            "recentURTI": "no"
        },
        "renal": { "ckd": "no", "ckdStage": "", "dialysis": "no", "dialysisType": "" },
        "hepatic": {
            "liverDisease": "no",
            "cirrhosis": "no",
            "childPughScore": "",
            "hepatitis": "no",
            "hepatitisType": ""
        },
        "endocrine": {
            "diabetes": "none",
            "diabetesControl": "",
            "diabetesOnInsulin": "",
            "thyroidDisease": "no",
            "thyroidType": "",
            "adrenalInsufficiency": "no"
        },
        "neurological": {
            "strokeOrTIA": "no",
            "strokeDetails": "",
            "epilepsy": "no",
            "epilepsyControlled": "",
            "neuromuscularDisease": "no",
            "neuromuscularDetails": "",
            "raisedICP": "no"
        },
        "haematological": {
            "bleedingDisorder": "no",
            "bleedingDetails": "",
            "onAnticoagulants": "no",
            "anticoagulantType": "",
            "sickleCellDisease": "no",
            "sickleCellTrait": "no",
            "anaemia": "no"
        },
        "musculoskeletalAirway": {
            "rheumatoidArthritis": "no",
            "cervicalSpineIssues": "no",
            "limitedNeckMovement": "no",
            "limitedMouthOpening": "no",
            "dentalIssues": "no",
            "dentalDetails": "",
            "previousDifficultAirway": "no",
            "mallampatiScore": "1"
        },
        "gastrointestinal": { "gord": "no", "hiatusHernia": "no", "nausea": "no" },
        "medications": [],
        "allergies": [],
        "previousAnaesthesia": {
            "previousAnaesthesia": "no",
            "anaesthesiaProblems": "",
            "anaesthesiaProblemDetails": "",
            "familyMHHistory": "no",
            "familyMHDetails": "",
            "ponv": "no"
        },
        "socialHistory": {
            "alcohol": "none",
            "alcoholUnitsPerWeek": null,
            "recreationalDrugs": "no",
            "drugDetails": ""
        },
        "functionalCapacity": {
            "exerciseTolerance": "vigorous-exercise",
            "estimatedMETs": 10.0,
            "mobilityAids": "no",
            "recentDecline": "no"
        },
        "pregnancy": { "possiblyPregnant": "", "pregnancyConfirmed": "", "gestationWeeks": null }
    }))
    .unwrap()
}

#[test]
fn no_flags_for_healthy_patient() {
    let data = create_healthy_patient();
    let flags = detect_additional_flags(&data);
    assert!(flags.is_empty());
}

#[test]
fn flags_difficult_airway() {
    let mut data = create_healthy_patient();
    data.musculoskeletal_airway.previous_difficult_airway = "yes".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-AIRWAY-001"));
}

#[test]
fn flags_anaphylaxis_allergy() {
    let mut data = create_healthy_patient();
    data.allergies = vec![Allergy {
        allergen: "Penicillin".to_string(),
        reaction: "Rash and swelling".to_string(),
        severity: "anaphylaxis".to_string(),
    }];
    let flags = detect_additional_flags(&data);
    assert!(flags
        .iter()
        .any(|f| f.category == "Allergy" && f.priority == "high"));
}

#[test]
fn flags_anticoagulant_use() {
    let mut data = create_healthy_patient();
    data.haematological.on_anticoagulants = "yes".to_string();
    data.haematological.anticoagulant_type = "warfarin".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ANTICOAG-001"));
}

#[test]
fn flags_family_mh_history() {
    let mut data = create_healthy_patient();
    data.previous_anaesthesia.family_mh_history = "yes".to_string();
    data.previous_anaesthesia.family_mh_details = "Father had MH reaction".to_string();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MH-001"));
}

#[test]
fn flags_pregnancy() {
    let mut data = create_healthy_patient();
    data.demographics.sex = "female".to_string();
    data.pregnancy.possibly_pregnant = "yes".to_string();
    data.pregnancy.pregnancy_confirmed = "yes".to_string();
    data.pregnancy.gestation_weeks = Some(12.0);
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-PREG-001"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_healthy_patient();
    data.musculoskeletal_airway.previous_difficult_airway = "yes".to_string();
    data.gastrointestinal.gord = "yes".to_string();
    data.musculoskeletal_airway.dental_issues = "yes".to_string();
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
