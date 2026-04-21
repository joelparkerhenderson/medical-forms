use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the anaesthetist,
/// independent of ASA grade. These are safety-critical alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Airway alerts ───────────────────────────────────────
    if data.musculoskeletal_airway.previous_difficult_airway == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AIRWAY-001".to_string(),
            category: "Airway".to_string(),
            message: "Previous difficult airway reported".to_string(),
            priority: "high".to_string(),
        });
    }

    if data.musculoskeletal_airway.limited_mouth_opening == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AIRWAY-002".to_string(),
            category: "Airway".to_string(),
            message: "Limited mouth opening".to_string(),
            priority: "high".to_string(),
        });
    }

    if data.musculoskeletal_airway.limited_neck_movement == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AIRWAY-003".to_string(),
            category: "Airway".to_string(),
            message: "Limited neck movement".to_string(),
            priority: "high".to_string(),
        });
    }

    if data.musculoskeletal_airway.mallampati_score == "3"
        || data.musculoskeletal_airway.mallampati_score == "4"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-AIRWAY-004".to_string(),
            category: "Airway".to_string(),
            message: format!(
                "Mallampati Class {}",
                data.musculoskeletal_airway.mallampati_score
            ),
            priority: "high".to_string(),
        });
    }

    if data.musculoskeletal_airway.cervical_spine_issues == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AIRWAY-005".to_string(),
            category: "Airway".to_string(),
            message: "Cervical spine issues - consider C-spine precautions".to_string(),
            priority: "medium".to_string(),
        });
    }

    if data.musculoskeletal_airway.rheumatoid_arthritis == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AIRWAY-006".to_string(),
            category: "Airway".to_string(),
            message: "Rheumatoid arthritis - assess atlanto-axial stability".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Allergy alerts ──────────────────────────────────────
    for (i, allergy) in data.allergies.iter().enumerate() {
        if allergy.severity == "anaphylaxis" {
            flags.push(AdditionalFlag {
                id: format!("FLAG-ALLERGY-ANAPH-{i}"),
                category: "Allergy".to_string(),
                message: format!("ANAPHYLAXIS history: {}", allergy.allergen),
                priority: "high".to_string(),
            });
        }
    }

    if !data.allergies.is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-ALLERGY-001".to_string(),
            category: "Allergy".to_string(),
            message: format!("{} allergy/allergies documented", data.allergies.len()),
            priority: "medium".to_string(),
        });
    }

    // ─── Anticoagulant alerts ────────────────────────────────
    if data.haematological.on_anticoagulants == "yes" {
        let ac_type = if data.haematological.anticoagulant_type.is_empty() {
            "type not specified"
        } else {
            &data.haematological.anticoagulant_type
        };
        flags.push(AdditionalFlag {
            id: "FLAG-ANTICOAG-001".to_string(),
            category: "Anticoagulation".to_string(),
            message: format!("On anticoagulants: {ac_type}"),
            priority: "high".to_string(),
        });
    }

    if data.haematological.bleeding_disorder == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-HAEM-001".to_string(),
            category: "Haematological".to_string(),
            message: "Bleeding disorder reported".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Malignant hyperthermia ──────────────────────────────
    if data.previous_anaesthesia.family_mh_history == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-001".to_string(),
            category: "Malignant Hyperthermia".to_string(),
            message: "Family history of malignant hyperthermia - AVOID TRIGGERS".to_string(),
            priority: "high".to_string(),
        });
    }

    if data.previous_anaesthesia.anaesthesia_problems == "yes" {
        let details = if data
            .previous_anaesthesia
            .anaesthesia_problem_details
            .is_empty()
        {
            "details not specified"
        } else {
            &data.previous_anaesthesia.anaesthesia_problem_details
        };
        flags.push(AdditionalFlag {
            id: "FLAG-ANAES-001".to_string(),
            category: "Previous Anaesthesia".to_string(),
            message: format!("Previous anaesthesia problems: {details}"),
            priority: "high".to_string(),
        });
    }

    // ─── Cardiac alerts ──────────────────────────────────────
    if data.cardiovascular.pacemaker == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CARDIAC-001".to_string(),
            category: "Cardiac".to_string(),
            message: "Pacemaker/ICD in situ - check device, magnet availability".to_string(),
            priority: "high".to_string(),
        });
    }

    if data.cardiovascular.recent_mi == "yes" {
        let weeks = data
            .cardiovascular
            .recent_mi_weeks
            .map(|w| w.to_string())
            .unwrap_or_else(|| "?".to_string());
        flags.push(AdditionalFlag {
            id: "FLAG-CARDIAC-002".to_string(),
            category: "Cardiac".to_string(),
            message: format!("Recent MI ({weeks} weeks ago)"),
            priority: "high".to_string(),
        });
    }

    // ─── Aspiration risk ─────────────────────────────────────
    if data.gastrointestinal.gord == "yes" || data.gastrointestinal.hiatus_hernia == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GI-001".to_string(),
            category: "Aspiration Risk".to_string(),
            message: "GORD/hiatus hernia - aspiration risk, consider RSI".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── OSA ─────────────────────────────────────────────────
    if data.respiratory.osa == "yes" {
        let cpap = if data.respiratory.osa_cpap == "yes" {
            " (on CPAP)"
        } else {
            " (no CPAP)"
        };
        flags.push(AdditionalFlag {
            id: "FLAG-OSA-001".to_string(),
            category: "Respiratory".to_string(),
            message: format!("OSA{cpap} - post-op monitoring"),
            priority: "medium".to_string(),
        });
    }

    // ─── Pregnancy ───────────────────────────────────────────
    if data.pregnancy.possibly_pregnant == "yes" {
        let msg = if data.pregnancy.pregnancy_confirmed == "yes" {
            let weeks = data
                .pregnancy
                .gestation_weeks
                .map(|w| w.to_string())
                .unwrap_or_else(|| "?".to_string());
            format!("Confirmed pregnancy ({weeks} weeks)")
        } else {
            "Possible pregnancy - confirm before proceeding".to_string()
        };
        flags.push(AdditionalFlag {
            id: "FLAG-PREG-001".to_string(),
            category: "Pregnancy".to_string(),
            message: msg,
            priority: "high".to_string(),
        });
    }

    // ─── Sickle cell ─────────────────────────────────────────
    if data.haematological.sickle_cell_disease == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SICKLE-001".to_string(),
            category: "Haematological".to_string(),
            message: "Sickle cell disease - avoid hypoxia, hypothermia, dehydration".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── URTI ────────────────────────────────────────────────
    if data.respiratory.recent_urti == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-URTI-001".to_string(),
            category: "Respiratory".to_string(),
            message: "Recent URTI - consider postponing elective surgery".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Insulin ─────────────────────────────────────────────
    if data.endocrine.diabetes_on_insulin == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-INSULIN-001".to_string(),
            category: "Endocrine".to_string(),
            message: "On insulin - perioperative glucose management plan needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Adrenal ─────────────────────────────────────────────
    if data.endocrine.adrenal_insufficiency == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ADRENAL-001".to_string(),
            category: "Endocrine".to_string(),
            message: "Adrenal insufficiency - stress-dose steroids may be required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Dental ──────────────────────────────────────────────
    if data.musculoskeletal_airway.dental_issues == "yes" {
        let details = if data.musculoskeletal_airway.dental_details.is_empty() {
            "details not specified"
        } else {
            &data.musculoskeletal_airway.dental_details
        };
        flags.push(AdditionalFlag {
            id: "FLAG-DENTAL-001".to_string(),
            category: "Airway".to_string(),
            message: format!("Dental issues: {details}"),
            priority: "low".to_string(),
        });
    }

    // ─── Emergency surgery ───────────────────────────────────
    if data.demographics.procedure_urgency == "emergency" {
        flags.push(AdditionalFlag {
            id: "FLAG-EMERG-001".to_string(),
            category: "Procedure".to_string(),
            message: "Emergency procedure - limited time for optimisation".to_string(),
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
