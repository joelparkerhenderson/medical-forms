use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Anaphylaxis history ─────────────────────────────────
    if data.respiratory_symptoms.previous_anaphylaxis == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ANAPH-001".to_string(),
            category: "Anaphylaxis".to_string(),
            message: "Patient has history of anaphylaxis - ensure epinephrine auto-injector prescribed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── No epinephrine auto-injector ────────────────────────
    if data.current_treatment.epinephrine_auto_injector == "no"
        && data.respiratory_symptoms.previous_anaphylaxis == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ANAPH-002".to_string(),
            category: "Anaphylaxis".to_string(),
            message: "Patient with anaphylaxis history lacks epinephrine auto-injector - urgent action required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Airway compromise signs ─────────────────────────────
    if data.respiratory_symptoms.stridor_present == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-RESP-001".to_string(),
            category: "Respiratory".to_string(),
            message: "Stridor reported - assess for laryngeal edema and airway management plan".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe dyspnea ──────────────────────────────────────
    if matches!(data.respiratory_symptoms.dyspnea_severity, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-RESP-002".to_string(),
            category: "Respiratory".to_string(),
            message: "Severe dyspnea reported - pulmonary function assessment recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Syncope episodes ────────────────────────────────────
    if matches!(data.cardiovascular_neurological.presyncope_syncope, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-CARDIO-001".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Frequent syncope/presyncope - cardiovascular evaluation recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe hypotension ──────────────────────────────────
    if matches!(data.cardiovascular_neurological.hypotension_episodes, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-CARDIO-002".to_string(),
            category: "Cardiovascular".to_string(),
            message: "Frequent hypotension episodes - hemodynamic monitoring advised".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Elevated tryptase ───────────────────────────────────
    if data.laboratory_studies.serum_tryptase_elevated == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-LAB-001".to_string(),
            category: "Laboratory".to_string(),
            message: "Elevated serum tryptase - consider mastocytosis workup if persistently elevated".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── No mediator testing ─────────────────────────────────
    if data.laboratory_studies.serum_tryptase_elevated.is_empty()
        && data.laboratory_studies.urine_prostaglandin_d2_elevated.is_empty()
        && data.laboratory_studies.plasma_histamine_elevated.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LAB-002".to_string(),
            category: "Laboratory".to_string(),
            message: "No mast cell mediator testing completed - laboratory workup recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Malabsorption signs ─────────────────────────────────
    if data.gastrointestinal_symptoms.malabsorption_signs == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-GI-001".to_string(),
            category: "Gastrointestinal".to_string(),
            message: "Malabsorption signs present - nutritional assessment and GI evaluation recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe brain fog ────────────────────────────────────
    if matches!(data.cardiovascular_neurological.brain_fog_severity, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-NEURO-001".to_string(),
            category: "Neurological".to_string(),
            message: "Severe brain fog reported - assess cognitive function and medication review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor treatment adherence ────────────────────────────
    if matches!(data.current_treatment.treatment_adherence, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TX-001".to_string(),
            category: "Treatment".to_string(),
            message: "Poor treatment adherence - assess barriers and provide education".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Medication trigger ──────────────────────────────────
    if matches!(data.trigger_identification.medication_trigger, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRIG-001".to_string(),
            category: "Triggers".to_string(),
            message: "Medications identified as significant trigger - review all current medications".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Bone marrow biopsy done ─────────────────────────────
    if data.laboratory_studies.bone_marrow_biopsy_done == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-LAB-003".to_string(),
            category: "Laboratory".to_string(),
            message: "Bone marrow biopsy performed - review results for systemic mastocytosis".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Consensus criteria met ──────────────────────────────
    if data.clinical_review.consensus_criteria_met == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DX-001".to_string(),
            category: "Diagnosis".to_string(),
            message: "Consensus diagnostic criteria met - confirm formal MCAS diagnosis in records".to_string(),
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
