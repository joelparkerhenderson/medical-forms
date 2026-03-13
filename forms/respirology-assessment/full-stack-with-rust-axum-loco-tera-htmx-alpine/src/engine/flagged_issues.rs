use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the respiratory score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Haemoptysis detected ────────────────────────────────
    if matches!(data.cough_assessment.haemoptysis, Some(3..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-COUGH-001".to_string(),
            category: "Cough".to_string(),
            message: "Haemoptysis reported - urgent investigation required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe resting hypoxaemia ───────────────────────────
    if data.oxygen_assessment.resting_spo2 == Some(5) {
        flags.push(AdditionalFlag {
            id: "FLAG-OXY-001".to_string(),
            category: "Oxygen".to_string(),
            message: "Critically low resting SpO2 - immediate assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Exertional desaturation ─────────────────────────────
    if matches!(data.oxygen_assessment.exertional_spo2, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-OXY-002".to_string(),
            category: "Oxygen".to_string(),
            message: "Significant exertional desaturation detected".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Dyspnoea at rest ────────────────────────────────────
    if matches!(data.dyspnoea_assessment.dyspnoea_at_rest, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-DYSP-001".to_string(),
            category: "Dyspnoea".to_string(),
            message: "Severe dyspnoea at rest - urgent clinical review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Paroxysmal nocturnal dyspnoea ───────────────────────
    if matches!(data.dyspnoea_assessment.paroxysmal_nocturnal_dyspnoea, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-DYSP-002".to_string(),
            category: "Dyspnoea".to_string(),
            message: "Paroxysmal nocturnal dyspnoea reported - consider cardiac assessment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe spirometric impairment ───────────────────────
    if data.spirometry_results.fev1_percent_predicted == Some(5) {
        flags.push(AdditionalFlag {
            id: "FLAG-SPIR-001".to_string(),
            category: "Spirometry".to_string(),
            message: "FEV1 critically reduced - severe airflow limitation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Frequent hospitalisations ───────────────────────────
    if matches!(data.respiratory_infections.hospitalisation_frequency, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-INF-001".to_string(),
            category: "Infections".to_string(),
            message: "Frequent hospitalisations for respiratory illness - review management plan".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Frequent exacerbations ──────────────────────────────
    if matches!(data.respiratory_infections.exacerbation_frequency, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-INF-002".to_string(),
            category: "Infections".to_string(),
            message: "Frequent exacerbations - consider escalation of preventive therapy".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor inhaler technique ──────────────────────────────
    if matches!(data.inhaler_medications.inhaler_technique, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Poor inhaler technique - patient education required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor medication adherence ───────────────────────────
    if matches!(data.inhaler_medications.medication_adherence, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medication".to_string(),
            message: "Poor medication adherence - review barriers and simplify regimen".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Accessory muscle use ────────────────────────────────
    if matches!(data.chest_examination.accessory_muscle_use, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-EXAM-001".to_string(),
            category: "Examination".to_string(),
            message: "Significant accessory muscle use observed - increased work of breathing".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Heavy smoking history ───────────────────────────────
    if data.patient_information.pack_years == "moreThan40" {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-001".to_string(),
            category: "Risk Factor".to_string(),
            message: "Heavy smoking history (>40 pack-years) - lung cancer screening recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Vaccination not up to date ──────────────────────────
    if matches!(data.respiratory_infections.vaccination_status, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-INF-003".to_string(),
            category: "Infections".to_string(),
            message: "Vaccinations not up to date - recommend influenza and pneumococcal vaccines".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── No action plan provided ─────────────────────────────
    if data.clinical_review.action_plan_provided == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-PLAN-001".to_string(),
            category: "Management".to_string(),
            message: "No written action plan provided - ensure patient has self-management plan".to_string(),
            priority: "low".to_string(),
        });
    }

    // Sort: high > medium > low
    flags.sort_by_key(|f| match f.priority.as_str() {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });

    flags
}
