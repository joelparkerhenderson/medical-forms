use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the impairment score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── IOP critically elevated ────────────────────────────
    if matches!(data.intraocular_pressure.right_iop, Some(31..))
        || matches!(data.intraocular_pressure.left_iop, Some(31..))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-IOP-001".to_string(),
            category: "Intraocular Pressure".to_string(),
            message: "IOP critically elevated (>30 mmHg) - urgent glaucoma assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── IOP elevated ───────────────────────────────────────
    if matches!(data.intraocular_pressure.right_iop, Some(22..=30))
        || matches!(data.intraocular_pressure.left_iop, Some(22..=30))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-IOP-002".to_string(),
            category: "Intraocular Pressure".to_string(),
            message: "IOP elevated (22-30 mmHg) - monitor and consider treatment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── RAPD detected ──────────────────────────────────────
    if data.ocular_motility.relative_afferent_pupil_defect == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-RAPD-001".to_string(),
            category: "Ocular Motility".to_string(),
            message: "Relative afferent pupillary defect detected - investigate optic nerve pathology".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Optic disc severely abnormal ───────────────────────
    if data.posterior_segment.right_optic_disc == Some(1)
        || data.posterior_segment.left_optic_disc == Some(1)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DISC-001".to_string(),
            category: "Posterior Segment".to_string(),
            message: "Optic disc severely abnormal - urgent neuro-ophthalmology review".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Macula severely abnormal ───────────────────────────
    if data.posterior_segment.right_macula == Some(1)
        || data.posterior_segment.left_macula == Some(1)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MAC-001".to_string(),
            category: "Posterior Segment".to_string(),
            message: "Macular pathology detected - consider OCT and urgent retinal referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Cornea abnormal ────────────────────────────────────
    if matches!(data.anterior_segment.right_cornea, Some(1..=2))
        || matches!(data.anterior_segment.left_cornea, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-COR-001".to_string(),
            category: "Anterior Segment".to_string(),
            message: "Corneal abnormality detected - corneal topography recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Lens opacity / cataract ────────────────────────────
    if matches!(data.anterior_segment.right_lens, Some(1..=2))
        || matches!(data.anterior_segment.left_lens, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LENS-001".to_string(),
            category: "Anterior Segment".to_string(),
            message: "Lens opacity detected - cataract assessment and surgical evaluation may be needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Visual field defect ────────────────────────────────
    if data.visual_fields.right_confrontation == Some(1)
        || data.visual_fields.left_confrontation == Some(1)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-VF-001".to_string(),
            category: "Visual Fields".to_string(),
            message: "Severe visual field defect on confrontation - formal perimetry required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Visual field reliability poor ──────────────────────
    if matches!(data.visual_fields.visual_field_reliability, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-VF-002".to_string(),
            category: "Visual Fields".to_string(),
            message: "Visual field test reliability poor - repeat testing recommended".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Retinal vessel abnormality ─────────────────────────
    if matches!(data.posterior_segment.right_vessels, Some(1..=2))
        || matches!(data.posterior_segment.left_vessels, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-RET-001".to_string(),
            category: "Posterior Segment".to_string(),
            message: "Retinal vessel abnormality - consider FFA and systemic vascular review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Surgical intervention needed ───────────────────────
    if data.clinical_review.surgical_intervention_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SURG-001".to_string(),
            category: "Clinical Review".to_string(),
            message: "Surgical intervention indicated - schedule surgical consultation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Referral required ──────────────────────────────────
    if data.clinical_review.referral_required == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-REF-001".to_string(),
            category: "Clinical Review".to_string(),
            message: "Referral required - ensure referral is actioned promptly".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Extraocular movement abnormality ───────────────────
    if matches!(data.ocular_motility.extraocular_movements, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-EOM-001".to_string(),
            category: "Ocular Motility".to_string(),
            message: "Extraocular movement restriction - investigate cranial nerve pathology".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Peripheral retina abnormal ─────────────────────────
    if matches!(data.posterior_segment.right_peripheral_retina, Some(1..=2))
        || matches!(data.posterior_segment.left_peripheral_retina, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PRET-001".to_string(),
            category: "Posterior Segment".to_string(),
            message: "Peripheral retinal abnormality - dilated fundus examination and possible laser treatment".to_string(),
            priority: "medium".to_string(),
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
