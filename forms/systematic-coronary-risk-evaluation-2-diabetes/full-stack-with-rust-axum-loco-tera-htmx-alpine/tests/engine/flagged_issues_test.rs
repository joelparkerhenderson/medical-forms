use score2_diabetes_tera_crate::engine::flagged_issues::detect_additional_flags;
use score2_diabetes_tera_crate::engine::types::*;

/// Create a healthy patient with type 2 diabetes, well-controlled.
/// HbA1c 48, BP 125/78, LDL 1.8, eGFR 85, no CVD, never smoked, BMI 26.
/// Expected: no flags.
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

#[test]
fn no_flags_for_healthy_patient() {
    let data = create_healthy_patient();
    let flags = detect_additional_flags(&data);
    assert_eq!(
        flags.len(),
        0,
        "Expected no flags for healthy patient, but got: {:?}",
        flags
    );
}

#[test]
fn flags_hypertensive_crisis() {
    let mut data = create_healthy_patient();
    data.blood_pressure.systolic_bp = Some(190.0);
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-BP-001"),
        "Expected FLAG-BP-001 for hypertensive crisis (systolic 190)"
    );
}

#[test]
fn flags_cvd_without_sglt2_or_glp1() {
    let mut data = create_healthy_patient();
    data.cardiovascular_history.previous_mi = "yes".to_string();
    data.current_medications.sglt2_inhibitor = "no".to_string();
    data.current_medications.glp1_agonist = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-MED-001"),
        "Expected FLAG-MED-001 for CVD without SGLT2i or GLP1-RA"
    );
}

#[test]
fn flags_no_statin_for_cvd() {
    let mut data = create_healthy_patient();
    data.cardiovascular_history.previous_mi = "yes".to_string();
    data.lipid_profile.on_statin = "no".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-MED-002"),
        "Expected FLAG-MED-002 for CVD without statin"
    );
}

#[test]
fn flags_retinopathy_not_screened() {
    let mut data = create_healthy_patient();
    data.complications_screening.retinopathy_status = "notScreened".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-SCREEN-001"),
        "Expected FLAG-SCREEN-001 for retinopathy not screened"
    );
}

#[test]
fn flags_foot_exam_abnormal() {
    let mut data = create_healthy_patient();
    data.complications_screening.monofilament_test = "abnormal".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-SCREEN-002"),
        "Expected FLAG-SCREEN-002 for abnormal monofilament test"
    );
}

#[test]
fn flags_current_smoker() {
    let mut data = create_healthy_patient();
    data.lifestyle_factors.smoking_status = "current".to_string();
    let flags = detect_additional_flags(&data);
    assert!(
        flags.iter().any(|f| f.id == "FLAG-SMOKE-001"),
        "Expected FLAG-SMOKE-001 for current smoker"
    );
}

#[test]
fn sorts_flags_by_priority_high_first() {
    let mut data = create_healthy_patient();
    // Trigger multiple flags with different priorities:
    // FLAG-SMOKE-001 (medium) - current smoker
    data.lifestyle_factors.smoking_status = "current".to_string();
    // FLAG-BP-001 (high) - hypertensive crisis
    data.blood_pressure.systolic_bp = Some(190.0);
    // FLAG-SCREEN-001 (medium) - retinopathy not screened
    data.complications_screening.retinopathy_status = "notScreened".to_string();
    // FLAG-MED-004 (low) - no metformin (type2, eGFR adequate)
    data.current_medications.metformin = "no".to_string();

    let flags = detect_additional_flags(&data);
    assert!(
        flags.len() >= 3,
        "Expected at least 3 flags, got {}",
        flags.len()
    );

    // Verify sorting: all "high" flags before "medium" before "low"
    let priorities: Vec<&str> = flags.iter().map(|f| f.priority.as_str()).collect();
    for i in 1..priorities.len() {
        let prev_ord = match priorities[i - 1] {
            "high" => 0,
            "medium" => 1,
            "low" => 2,
            _ => 3,
        };
        let curr_ord = match priorities[i] {
            "high" => 0,
            "medium" => 1,
            "low" => 2,
            _ => 3,
        };
        assert!(
            prev_ord <= curr_ord,
            "Flags not sorted by priority: {:?}",
            priorities
        );
    }
}
