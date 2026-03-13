use pre_op_assessment_tera_crate::engine::asa_grader::calculate_asa;
use pre_op_assessment_tera_crate::engine::asa_rules::all_rules;
use pre_op_assessment_tera_crate::engine::types::AssessmentData;
use std::collections::HashSet;

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
fn returns_asa_i_for_healthy_patient() {
    let data = create_healthy_patient();
    let (grade, fired) = calculate_asa(&data);
    assert_eq!(grade, 1);
    assert!(fired.is_empty());
}

#[test]
fn returns_asa_ii_for_controlled_hypertension_and_mild_asthma() {
    let mut data = create_healthy_patient();
    data.cardiovascular.hypertension = "yes".to_string();
    data.cardiovascular.hypertension_controlled = "yes".to_string();
    data.respiratory.asthma = "yes".to_string();
    data.respiratory.asthma_frequency = "mild-persistent".to_string();

    let (grade, fired) = calculate_asa(&data);
    assert_eq!(grade, 2);
    assert!(fired.len() >= 2);
}

#[test]
fn returns_asa_iii_for_copd_uncontrolled_diabetes_morbid_obesity() {
    let mut data = create_healthy_patient();
    data.respiratory.copd = "yes".to_string();
    data.respiratory.copd_severity = "moderate".to_string();
    data.endocrine.diabetes = "type2".to_string();
    data.endocrine.diabetes_control = "poorly-controlled".to_string();
    data.demographics.bmi = Some(42.0);

    let (grade, fired) = calculate_asa(&data);
    assert_eq!(grade, 3);
    assert!(fired.len() >= 3);
}

#[test]
fn returns_asa_iv_for_recent_mi_and_nyha_iv() {
    let mut data = create_healthy_patient();
    data.cardiovascular.recent_mi = "yes".to_string();
    data.cardiovascular.recent_mi_weeks = Some(4.0);
    data.cardiovascular.valvular_disease = "yes".to_string();
    data.cardiovascular.heart_failure = "yes".to_string();
    data.cardiovascular.heart_failure_nyha = "4".to_string();

    let (grade, _fired) = calculate_asa(&data);
    assert_eq!(grade, 4);
}

#[test]
fn all_rule_ids_are_unique() {
    let rules = all_rules();
    let ids: Vec<&str> = rules.iter().map(|r| r.id).collect();
    let unique: HashSet<&str> = ids.iter().copied().collect();
    assert_eq!(unique.len(), ids.len());
}
