use patient_intake_tera_crate::engine::intake_grader::calculate_risk_level;
use patient_intake_tera_crate::engine::intake_rules::all_rules;
use patient_intake_tera_crate::engine::types::*;

fn create_healthy_patient() -> AssessmentData {
    AssessmentData {
        personal_information: PersonalInformation {
            full_name: "John Doe".to_string(),
            date_of_birth: "1985-01-01".to_string(),
            sex: "male".to_string(),
            address_line1: "123 Main St".to_string(),
            address_line2: String::new(),
            city: "London".to_string(),
            postcode: "SW1A 1AA".to_string(),
            phone: "07700 900000".to_string(),
            email: "john@example.com".to_string(),
            emergency_contact_name: "Jane Doe".to_string(),
            emergency_contact_phone: "07700 900001".to_string(),
            emergency_contact_relationship: "Spouse".to_string(),
        },
        insurance_and_id: InsuranceAndId {
            insurance_provider: "NHS".to_string(),
            policy_number: String::new(),
            nhs_number: "943 476 5919".to_string(),
            gp_name: "Dr Smith".to_string(),
            gp_practice_name: "High Street Surgery".to_string(),
            gp_phone: "020 7946 0958".to_string(),
        },
        reason_for_visit: ReasonForVisit {
            primary_reason: "Annual check-up".to_string(),
            urgency_level: "routine".to_string(),
            referring_provider: String::new(),
            symptom_duration: String::new(),
            additional_details: String::new(),
        },
        medical_history: MedicalHistory {
            chronic_conditions: vec![],
            previous_surgeries: String::new(),
            previous_hospitalizations: String::new(),
            ongoing_treatments: String::new(),
        },
        medications: vec![],
        allergies: vec![],
        family_history: FamilyHistory {
            heart_disease: "no".to_string(),
            heart_disease_details: String::new(),
            cancer: "no".to_string(),
            cancer_details: String::new(),
            diabetes: "no".to_string(),
            diabetes_details: String::new(),
            stroke: "no".to_string(),
            stroke_details: String::new(),
            mental_illness: "no".to_string(),
            mental_illness_details: String::new(),
            genetic_conditions: "no".to_string(),
            genetic_conditions_details: String::new(),
        },
        social_history: SocialHistory {
            smoking_status: "never".to_string(),
            smoking_pack_years: None,
            alcohol_frequency: "none".to_string(),
            alcohol_units_per_week: None,
            drug_use: "none".to_string(),
            drug_details: String::new(),
            occupation: "Office worker".to_string(),
            exercise_frequency: "regular".to_string(),
            diet_quality: "good".to_string(),
        },
        review_of_systems: ReviewOfSystems {
            constitutional: String::new(),
            heent: String::new(),
            cardiovascular: String::new(),
            respiratory: String::new(),
            gastrointestinal: String::new(),
            genitourinary: String::new(),
            musculoskeletal: String::new(),
            neurological: String::new(),
            psychiatric: String::new(),
            skin: String::new(),
        },
        consent_and_preferences: ConsentAndPreferences {
            consent_to_treatment: "yes".to_string(),
            privacy_acknowledgement: "yes".to_string(),
            communication_preference: "email".to_string(),
            advance_directives: "no".to_string(),
            advance_directive_details: String::new(),
        },
    }
}

#[test]
fn returns_low_risk_for_healthy_patient() {
    let data = create_healthy_patient();
    let (risk_level, fired_rules) = calculate_risk_level(&data);
    assert_eq!(risk_level, "low");
    assert_eq!(fired_rules.len(), 0);
}

#[test]
fn returns_medium_risk_for_controlled_chronic_conditions() {
    let mut data = create_healthy_patient();
    data.medical_history.chronic_conditions = vec![
        "hypertension".to_string(),
        "type-2-diabetes".to_string(),
    ];
    data.social_history.smoking_status = "current".to_string();

    let (risk_level, fired_rules) = calculate_risk_level(&data);
    assert_eq!(risk_level, "medium");
    assert!(fired_rules.len() >= 2);
}

#[test]
fn returns_high_risk_for_multiple_comorbidities_and_polypharmacy() {
    let mut data = create_healthy_patient();
    data.medical_history.chronic_conditions = vec![
        "hypertension".to_string(),
        "type-2-diabetes".to_string(),
        "chronic-kidney-disease".to_string(),
        "heart-failure".to_string(),
    ];
    data.medications = vec![
        Medication { name: "Metformin".into(), dose: "500mg".into(), frequency: "BD".into(), prescriber: "Dr Smith".into() },
        Medication { name: "Ramipril".into(), dose: "10mg".into(), frequency: "OD".into(), prescriber: "Dr Smith".into() },
        Medication { name: "Bisoprolol".into(), dose: "5mg".into(), frequency: "OD".into(), prescriber: "Dr Smith".into() },
        Medication { name: "Furosemide".into(), dose: "40mg".into(), frequency: "OD".into(), prescriber: "Dr Smith".into() },
        Medication { name: "Amlodipine".into(), dose: "5mg".into(), frequency: "OD".into(), prescriber: "Dr Smith".into() },
    ];

    let (risk_level, fired_rules) = calculate_risk_level(&data);
    assert_eq!(risk_level, "high");
    assert!(fired_rules.len() >= 2);
}

#[test]
fn returns_high_risk_for_emergency_visit() {
    let mut data = create_healthy_patient();
    data.reason_for_visit.urgency_level = "emergency".to_string();

    let (risk_level, _fired_rules) = calculate_risk_level(&data);
    assert_eq!(risk_level, "high");
}

#[test]
fn returns_high_risk_when_consent_not_given() {
    let mut data = create_healthy_patient();
    data.consent_and_preferences.consent_to_treatment = "no".to_string();

    let (risk_level, _fired_rules) = calculate_risk_level(&data);
    assert_eq!(risk_level, "high");
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
