use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the abnormality score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Pancytopenia detection ─────────────────────────────
    if data.blood_count_analysis.hemoglobin.is_some_and(|v| v < 10.0)
        && data.blood_count_analysis.white_blood_cell_count.is_some_and(|v| v < 4.0)
        && data.blood_count_analysis.platelet_count.is_some_and(|v| v < 150.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CBC-001".to_string(),
            category: "Blood Count".to_string(),
            message: "Pancytopenia detected - all three cell lines depressed, urgent hematology review".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe neutropenia risk ─────────────────────────────
    if data.blood_count_analysis.white_blood_cell_count.is_some_and(|v| v < 1.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-CBC-002".to_string(),
            category: "Blood Count".to_string(),
            message: "Severe leukopenia (WBC <1.0) - high infection risk, consider protective isolation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Polycythemia ────────────────────────────────────────
    if data.blood_count_analysis.hemoglobin.is_some_and(|v| v > 18.5) {
        flags.push(AdditionalFlag {
            id: "FLAG-CBC-003".to_string(),
            category: "Blood Count".to_string(),
            message: "Elevated hemoglobin >18.5 g/dL - evaluate for polycythemia".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── DIC suspected ───────────────────────────────────────
    if data.coagulation_studies.fibrinogen.is_some_and(|v| v < 100.0)
        && data.coagulation_studies.d_dimer.is_some_and(|v| v > 2.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-COAG-001".to_string(),
            category: "Coagulation".to_string(),
            message: "Low fibrinogen with elevated D-dimer - DIC workup recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Prolonged aPTT ──────────────────────────────────────
    if data.coagulation_studies.activated_partial_thromboplastin_time.is_some_and(|v| v > 60.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-COAG-002".to_string(),
            category: "Coagulation".to_string(),
            message: "Markedly prolonged aPTT (>60s) - evaluate for factor deficiency or lupus anticoagulant".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Elevated D-dimer ────────────────────────────────────
    if data.coagulation_studies.d_dimer.is_some_and(|v| v > 5.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-COAG-003".to_string(),
            category: "Coagulation".to_string(),
            message: "Severely elevated D-dimer (>5.0 mg/L) - consider PE/DVT workup".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Iron deficiency pattern ─────────────────────────────
    if data.iron_studies.serum_ferritin.is_some_and(|v| v < 10.0)
        && data.iron_studies.transferrin_saturation.is_some_and(|v| v < 15.0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-IRON-001".to_string(),
            category: "Iron Studies".to_string(),
            message: "Iron deficiency pattern - low ferritin with low transferrin saturation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Iron overload pattern ───────────────────────────────
    if data.iron_studies.serum_ferritin.is_some_and(|v| v > 1000.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-IRON-002".to_string(),
            category: "Iron Studies".to_string(),
            message: "Markedly elevated ferritin (>1000 ng/mL) - evaluate for hemochromatosis or secondary overload".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Abnormal blood film ─────────────────────────────────
    if !data.peripheral_blood_film.abnormal_cell_morphology.is_empty()
        && data.peripheral_blood_film.abnormal_cell_morphology != "none"
        && data.peripheral_blood_film.abnormal_cell_morphology != "normal"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FILM-001".to_string(),
            category: "Blood Film".to_string(),
            message: "Abnormal cell morphology reported on peripheral blood film - review recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Positive sickle cell screen ─────────────────────────
    if data.hemoglobinopathy_screening.sickle_cell_screen == "positive" {
        flags.push(AdditionalFlag {
            id: "FLAG-HGB-001".to_string(),
            category: "Hemoglobinopathy".to_string(),
            message: "Positive sickle cell screen - confirmatory testing recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Positive thalassemia screen ─────────────────────────
    if data.hemoglobinopathy_screening.thalassemia_screen == "positive" {
        flags.push(AdditionalFlag {
            id: "FLAG-HGB-002".to_string(),
            category: "Hemoglobinopathy".to_string(),
            message: "Positive thalassemia screen - genetic counseling may be indicated".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Transfusion reaction history ────────────────────────
    if !data.transfusion_history.transfusion_reactions.is_empty()
        && data.transfusion_history.transfusion_reactions != "none"
        && data.transfusion_history.transfusion_reactions != "no"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-TRANS-001".to_string(),
            category: "Transfusion".to_string(),
            message: "Previous transfusion reactions reported - special precautions needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Urgent clinical review ──────────────────────────────
    if data.clinical_review.urgency_level.is_some_and(|v| v >= 4) {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-001".to_string(),
            category: "Clinical".to_string(),
            message: "High urgency level indicated - expedited specialist review required".to_string(),
            priority: "high".to_string(),
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
