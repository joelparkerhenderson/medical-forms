use patient_intake_tera_crate::engine::flagged_issues::detect_additional_flags;
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
fn no_flags_for_healthy_patient() {
    let data = create_healthy_patient();
    let flags = detect_additional_flags(&data);
    assert_eq!(flags.len(), 0);
}

#[test]
fn flags_multiple_allergies() {
    let mut data = create_healthy_patient();
    data.allergies = vec![
        Allergy { allergen: "Penicillin".into(), allergy_type: "drug".into(), reaction: "Rash".into(), severity: "mild".into() },
        Allergy { allergen: "Peanuts".into(), allergy_type: "food".into(), reaction: "Swelling".into(), severity: "moderate".into() },
        Allergy { allergen: "Pollen".into(), allergy_type: "environmental".into(), reaction: "Sneezing".into(), severity: "mild".into() },
    ];
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-ALLERGY-001"));
}

#[test]
fn flags_polypharmacy() {
    let mut data = create_healthy_patient();
    data.medications = vec![
        Medication { name: "Med1".into(), dose: "10mg".into(), frequency: "OD".into(), prescriber: "Dr A".into() },
        Medication { name: "Med2".into(), dose: "20mg".into(), frequency: "OD".into(), prescriber: "Dr A".into() },
        Medication { name: "Med3".into(), dose: "5mg".into(), frequency: "BD".into(), prescriber: "Dr A".into() },
        Medication { name: "Med4".into(), dose: "10mg".into(), frequency: "OD".into(), prescriber: "Dr A".into() },
        Medication { name: "Med5".into(), dose: "50mg".into(), frequency: "OD".into(), prescriber: "Dr A".into() },
    ];
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-MEDS-001"));
}

#[test]
fn flags_missing_emergency_contact() {
    let mut data = create_healthy_patient();
    data.personal_information.emergency_contact_name = String::new();
    data.personal_information.emergency_contact_phone = String::new();
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CONTACT-001"));
}

#[test]
fn flags_multiple_chronic_conditions() {
    let mut data = create_healthy_patient();
    data.medical_history.chronic_conditions = vec![
        "hypertension".to_string(),
        "diabetes".to_string(),
        "copd".to_string(),
    ];
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.id == "FLAG-CHRONIC-001"));
}

#[test]
fn flags_anaphylaxis_allergy() {
    let mut data = create_healthy_patient();
    data.allergies = vec![
        Allergy { allergen: "Penicillin".into(), allergy_type: "drug".into(), reaction: "Anaphylaxis".into(), severity: "anaphylaxis".into() },
    ];
    let flags = detect_additional_flags(&data);
    assert!(flags.iter().any(|f| f.category == "Allergy" && f.priority == "high"));
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_healthy_patient();
    data.medical_history.chronic_conditions = vec![
        "hypertension".to_string(),
        "diabetes".to_string(),
        "copd".to_string(),
    ];
    data.personal_information.emergency_contact_name = String::new();
    data.social_history.smoking_status = "current".to_string();
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
