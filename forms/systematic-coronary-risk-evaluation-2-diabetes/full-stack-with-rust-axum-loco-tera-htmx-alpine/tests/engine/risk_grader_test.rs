use score2_diabetes_tera_crate::engine::risk_grader::calculate_risk;
use score2_diabetes_tera_crate::engine::risk_rules::all_rules;
use score2_diabetes_tera_crate::engine::types::*;

/// Create a healthy patient with type 2 diabetes, well-controlled.
/// HbA1c 48, BP 125/78, LDL 1.8, eGFR 85, no CVD, never smoked, BMI 26.
/// Expected: low risk.
fn create_healthy_patient() -> AssessmentData {
    AssessmentData {
        patient_demographics: PatientDemographics {
            full_name: "Jane Smith".to_string(),
            date_of_birth: "1970-05-15".to_string(),
            sex: "female".to_string(),
            nhs_number: "1234567890".to_string(),
            height_cm: Some(165.0),
            weight_kg: Some(70.8),
            ethnicity: "white".to_string(),
        },
        diabetes_history: DiabetesHistory {
            diabetes_type: "type2".to_string(),
            age_at_diagnosis: Some(45.0),
            diabetes_duration_years: Some(10.0),
            hba1c_value: Some(48.0),
            hba1c_unit: "mmolMol".to_string(),
            fasting_glucose: Some(6.5),
            diabetes_treatment: "oral".to_string(),
            insulin_duration_years: None,
        },
        cardiovascular_history: CardiovascularHistory {
            previous_mi: "no".to_string(),
            previous_stroke: "no".to_string(),
            previous_tia: "no".to_string(),
            peripheral_arterial_disease: "no".to_string(),
            heart_failure: "no".to_string(),
            atrial_fibrillation: "no".to_string(),
            family_cvd_history: "no".to_string(),
            family_cvd_details: "".to_string(),
            current_chest_pain: "no".to_string(),
            current_dyspnoea: "no".to_string(),
        },
        blood_pressure: BloodPressure {
            systolic_bp: Some(125.0),
            diastolic_bp: Some(78.0),
            on_antihypertensive: "no".to_string(),
            number_of_bp_medications: None,
            bp_at_target: "yes".to_string(),
            home_bp_monitoring: "no".to_string(),
        },
        lipid_profile: LipidProfile {
            total_cholesterol: Some(4.5),
            hdl_cholesterol: Some(1.4),
            ldl_cholesterol: Some(1.8),
            triglycerides: Some(1.5),
            non_hdl_cholesterol: Some(3.1),
            on_statin: "yes".to_string(),
            statin_name: "atorvastatin".to_string(),
            on_other_lipid_therapy: "no".to_string(),
        },
        renal_function: RenalFunction {
            egfr: Some(85.0),
            creatinine: Some(70.0),
            urine_acr: Some(1.5),
            proteinuria: "none".to_string(),
            ckd_stage: "G2".to_string(),
        },
        lifestyle_factors: LifestyleFactors {
            smoking_status: "never".to_string(),
            cigarettes_per_day: None,
            years_since_quit: None,
            alcohol_units_per_week: Some(5.0),
            physical_activity: "moderatelyActive".to_string(),
            diet_quality: "good".to_string(),
            bmi: Some(26.0),
            waist_circumference_cm: Some(88.0),
        },
        current_medications: CurrentMedications {
            metformin: "yes".to_string(),
            sglt2_inhibitor: "no".to_string(),
            glp1_agonist: "no".to_string(),
            sulfonylurea: "no".to_string(),
            dpp4_inhibitor: "no".to_string(),
            insulin: "no".to_string(),
            ace_inhibitor_or_arb: "no".to_string(),
            antiplatelet: "no".to_string(),
            anticoagulant: "no".to_string(),
            other_medications: "".to_string(),
        },
        complications_screening: ComplicationsScreening {
            retinopathy_status: "none".to_string(),
            last_eye_screening_date: "2025-06-01".to_string(),
            neuropathy_symptoms: "no".to_string(),
            monofilament_test: "normal".to_string(),
            foot_pulses: "normal".to_string(),
            foot_ulcer_history: "no".to_string(),
            ankle_brachial_index: Some(1.1),
            erectile_dysfunction: "notApplicable".to_string(),
        },
        risk_assessment_summary: RiskAssessmentSummary::default(),
    }
}

/// Create a high-risk patient: type 2, previous MI, HbA1c 78, BP 160/95,
/// LDL 4.2, eGFR 25, current smoker.
fn create_high_risk_patient() -> AssessmentData {
    AssessmentData {
        patient_demographics: PatientDemographics {
            full_name: "John Doe".to_string(),
            date_of_birth: "1955-03-20".to_string(),
            sex: "male".to_string(),
            nhs_number: "9876543210".to_string(),
            height_cm: Some(178.0),
            weight_kg: Some(95.0),
            ethnicity: "white".to_string(),
        },
        diabetes_history: DiabetesHistory {
            diabetes_type: "type2".to_string(),
            age_at_diagnosis: Some(40.0),
            diabetes_duration_years: Some(30.0),
            hba1c_value: Some(78.0),
            hba1c_unit: "mmolMol".to_string(),
            fasting_glucose: Some(12.0),
            diabetes_treatment: "combined".to_string(),
            insulin_duration_years: Some(10.0),
        },
        cardiovascular_history: CardiovascularHistory {
            previous_mi: "yes".to_string(),
            previous_stroke: "no".to_string(),
            previous_tia: "no".to_string(),
            peripheral_arterial_disease: "no".to_string(),
            heart_failure: "no".to_string(),
            atrial_fibrillation: "no".to_string(),
            family_cvd_history: "yes".to_string(),
            family_cvd_details: "Father had MI at age 50".to_string(),
            current_chest_pain: "no".to_string(),
            current_dyspnoea: "no".to_string(),
        },
        blood_pressure: BloodPressure {
            systolic_bp: Some(160.0),
            diastolic_bp: Some(95.0),
            on_antihypertensive: "yes".to_string(),
            number_of_bp_medications: Some(2.0),
            bp_at_target: "no".to_string(),
            home_bp_monitoring: "yes".to_string(),
        },
        lipid_profile: LipidProfile {
            total_cholesterol: Some(6.5),
            hdl_cholesterol: Some(0.9),
            ldl_cholesterol: Some(4.2),
            triglycerides: Some(2.8),
            non_hdl_cholesterol: Some(5.6),
            on_statin: "no".to_string(),
            statin_name: "".to_string(),
            on_other_lipid_therapy: "no".to_string(),
        },
        renal_function: RenalFunction {
            egfr: Some(25.0),
            creatinine: Some(250.0),
            urine_acr: Some(35.0),
            proteinuria: "macroalbuminuria".to_string(),
            ckd_stage: "G4".to_string(),
        },
        lifestyle_factors: LifestyleFactors {
            smoking_status: "current".to_string(),
            cigarettes_per_day: Some(15.0),
            years_since_quit: None,
            alcohol_units_per_week: Some(20.0),
            physical_activity: "sedentary".to_string(),
            diet_quality: "poor".to_string(),
            bmi: Some(30.0),
            waist_circumference_cm: Some(105.0),
        },
        current_medications: CurrentMedications {
            metformin: "no".to_string(),
            sglt2_inhibitor: "no".to_string(),
            glp1_agonist: "no".to_string(),
            sulfonylurea: "yes".to_string(),
            dpp4_inhibitor: "no".to_string(),
            insulin: "yes".to_string(),
            ace_inhibitor_or_arb: "yes".to_string(),
            antiplatelet: "yes".to_string(),
            anticoagulant: "no".to_string(),
            other_medications: "amlodipine".to_string(),
        },
        complications_screening: ComplicationsScreening {
            retinopathy_status: "preProliferative".to_string(),
            last_eye_screening_date: "2025-01-15".to_string(),
            neuropathy_symptoms: "yes".to_string(),
            monofilament_test: "abnormal".to_string(),
            foot_pulses: "absent".to_string(),
            foot_ulcer_history: "yes".to_string(),
            ankle_brachial_index: Some(0.7),
            erectile_dysfunction: "yes".to_string(),
        },
        risk_assessment_summary: RiskAssessmentSummary::default(),
    }
}

#[test]
fn returns_draft_for_empty_assessment() {
    let data = AssessmentData::default();
    let (category, fired_rules) = calculate_risk(&data);
    assert_eq!(category, "draft");
    assert!(fired_rules.is_empty());
}

#[test]
fn returns_low_risk_for_healthy_patient() {
    let data = create_healthy_patient();
    let (category, fired_rules) = calculate_risk(&data);
    // A healthy patient should not fire any high or medium rules
    let high_or_medium: Vec<_> = fired_rules
        .iter()
        .filter(|r| r.risk_level == "high" || r.risk_level == "medium")
        .collect();
    assert!(
        high_or_medium.is_empty(),
        "Expected no high/medium rules but fired: {:?}",
        high_or_medium
    );
    assert_ne!(category, "veryHigh");
}

#[test]
fn returns_very_high_for_established_cvd() {
    let mut data = create_healthy_patient();
    data.cardiovascular_history.previous_mi = "yes".to_string();
    let (category, fired_rules) = calculate_risk(&data);
    assert_eq!(category, "veryHigh");
    assert!(
        fired_rules.iter().any(|r| r.id == "CVR-001"),
        "Expected CVR-001 to fire for established CVD"
    );
}

#[test]
fn returns_high_for_elevated_bp() {
    let mut data = create_healthy_patient();
    data.blood_pressure.systolic_bp = Some(155.0);
    let (category, fired_rules) = calculate_risk(&data);
    // Systolic 155 fires CVR-008 (medium), which maps to "high" category
    assert!(
        category == "high" || category == "veryHigh",
        "Expected at least 'high' risk but got '{}'",
        category
    );
    assert!(
        fired_rules.iter().any(|r| r.id == "CVR-008"),
        "Expected CVR-008 to fire for elevated BP"
    );
}

#[test]
fn returns_very_high_for_severe_renal() {
    let mut data = create_healthy_patient();
    data.renal_function.egfr = Some(20.0);
    let (category, fired_rules) = calculate_risk(&data);
    assert_eq!(category, "veryHigh");
    assert!(
        fired_rules.iter().any(|r| r.id == "CVR-004"),
        "Expected CVR-004 to fire for eGFR <30"
    );
}

#[test]
fn returns_very_high_for_very_poor_glycaemic() {
    let mut data = create_healthy_patient();
    data.diabetes_history.hba1c_value = Some(80.0);
    let (category, fired_rules) = calculate_risk(&data);
    assert_eq!(category, "veryHigh");
    assert!(
        fired_rules.iter().any(|r| r.id == "CVR-003"),
        "Expected CVR-003 to fire for HbA1c >=75"
    );
}

#[test]
fn fires_smoking_rule() {
    let mut data = create_healthy_patient();
    data.lifestyle_factors.smoking_status = "current".to_string();
    let (_category, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "CVR-011"),
        "Expected CVR-011 to fire for current smoker"
    );
}

#[test]
fn fires_obesity_rule() {
    let mut data = create_healthy_patient();
    data.lifestyle_factors.bmi = Some(35.0);
    let (_category, fired_rules) = calculate_risk(&data);
    assert!(
        fired_rules.iter().any(|r| r.id == "CVR-014"),
        "Expected CVR-014 to fire for BMI >=30"
    );
}

#[test]
fn returns_very_high_with_many_rules_for_high_risk_patient() {
    let data = create_high_risk_patient();
    let (category, fired_rules) = calculate_risk(&data);
    assert_eq!(category, "veryHigh");
    assert!(fired_rules.len() >= 5, "Expected many rules to fire for high-risk patient but got {}", fired_rules.len());
    // Should fire CVR-001 (established CVD), CVR-003 (HbA1c>=75), CVR-004 (eGFR<30), CVR-011 (smoking)
    assert!(fired_rules.iter().any(|r| r.id == "CVR-001"));
    assert!(fired_rules.iter().any(|r| r.id == "CVR-004"));
    assert!(fired_rules.iter().any(|r| r.id == "CVR-011"));
}

#[test]
fn all_rule_ids_are_unique() {
    let rules = all_rules();
    assert_eq!(rules.len(), 20, "Expected 20 rules");
    let mut ids: Vec<&str> = rules.iter().map(|r| r.id).collect();
    ids.sort();
    ids.dedup();
    assert_eq!(ids.len(), 20, "Expected 20 unique rule IDs");
}
