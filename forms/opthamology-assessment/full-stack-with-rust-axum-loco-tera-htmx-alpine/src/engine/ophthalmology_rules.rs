use super::types::AssessmentData;
use super::utils::{anterior_segment_score, classify_visual_acuity, posterior_segment_score};

/// A declarative ophthalmology concern rule.
pub struct OphthalmologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All ophthalmology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<OphthalmologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        OphthalmologyRule {
            id: "OPH-001",
            category: "Visual Acuity",
            description: "Best corrected visual acuity indicates blindness in either eye (CF, HM, PL, NPL)",
            concern_level: "high",
            evaluate: |d| {
                let r = classify_visual_acuity(&d.visual_acuity.right_best_corrected);
                let l = classify_visual_acuity(&d.visual_acuity.left_best_corrected);
                r == "blind" || l == "blind"
            },
        },
        OphthalmologyRule {
            id: "OPH-002",
            category: "Intraocular Pressure",
            description: "IOP critically elevated (>30 mmHg) in either eye",
            concern_level: "high",
            evaluate: |d| {
                matches!(d.intraocular_pressure.right_iop, Some(31..))
                    || matches!(d.intraocular_pressure.left_iop, Some(31..))
            },
        },
        OphthalmologyRule {
            id: "OPH-003",
            category: "Posterior Segment",
            description: "Optic disc severely abnormal (rated 1) in either eye",
            concern_level: "high",
            evaluate: |d| {
                d.posterior_segment.right_optic_disc == Some(1)
                    || d.posterior_segment.left_optic_disc == Some(1)
            },
        },
        OphthalmologyRule {
            id: "OPH-004",
            category: "Posterior Segment",
            description: "Macula severely abnormal (rated 1) in either eye",
            concern_level: "high",
            evaluate: |d| {
                d.posterior_segment.right_macula == Some(1)
                    || d.posterior_segment.left_macula == Some(1)
            },
        },
        OphthalmologyRule {
            id: "OPH-005",
            category: "Visual Acuity",
            description: "Severe visual impairment in best corrected acuity (3/60 or 1/60)",
            concern_level: "high",
            evaluate: |d| {
                let r = classify_visual_acuity(&d.visual_acuity.right_best_corrected);
                let l = classify_visual_acuity(&d.visual_acuity.left_best_corrected);
                r == "severe" || l == "severe"
            },
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        OphthalmologyRule {
            id: "OPH-006",
            category: "Intraocular Pressure",
            description: "IOP elevated (22-30 mmHg) in either eye",
            concern_level: "medium",
            evaluate: |d| {
                matches!(d.intraocular_pressure.right_iop, Some(22..=30))
                    || matches!(d.intraocular_pressure.left_iop, Some(22..=30))
            },
        },
        OphthalmologyRule {
            id: "OPH-007",
            category: "Anterior Segment",
            description: "Cornea abnormal (rated 1-2) in either eye",
            concern_level: "medium",
            evaluate: |d| {
                matches!(d.anterior_segment.right_cornea, Some(1..=2))
                    || matches!(d.anterior_segment.left_cornea, Some(1..=2))
            },
        },
        OphthalmologyRule {
            id: "OPH-008",
            category: "Anterior Segment",
            description: "Lens abnormal (rated 1-2) in either eye — cataract suspected",
            concern_level: "medium",
            evaluate: |d| {
                matches!(d.anterior_segment.right_lens, Some(1..=2))
                    || matches!(d.anterior_segment.left_lens, Some(1..=2))
            },
        },
        OphthalmologyRule {
            id: "OPH-009",
            category: "Visual Acuity",
            description: "Moderate visual impairment in best corrected acuity (6/24-6/60)",
            concern_level: "medium",
            evaluate: |d| {
                let r = classify_visual_acuity(&d.visual_acuity.right_best_corrected);
                let l = classify_visual_acuity(&d.visual_acuity.left_best_corrected);
                r == "moderate" || l == "moderate"
            },
        },
        OphthalmologyRule {
            id: "OPH-010",
            category: "Posterior Segment",
            description: "Posterior segment dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| posterior_segment_score(d).is_some_and(|s| s < 40.0),
        },
        OphthalmologyRule {
            id: "OPH-011",
            category: "Anterior Segment",
            description: "Anterior segment dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| anterior_segment_score(d).is_some_and(|s| s < 40.0),
        },
        OphthalmologyRule {
            id: "OPH-012",
            category: "Visual Fields",
            description: "Visual field confrontation severely abnormal (rated 1) in either eye",
            concern_level: "medium",
            evaluate: |d| {
                d.visual_fields.right_confrontation == Some(1)
                    || d.visual_fields.left_confrontation == Some(1)
            },
        },
        OphthalmologyRule {
            id: "OPH-013",
            category: "Ocular Motility",
            description: "Extraocular movements abnormal (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.ocular_motility.extraocular_movements, Some(1..=2)),
        },
        OphthalmologyRule {
            id: "OPH-014",
            category: "Posterior Segment",
            description: "Retinal vessels abnormal (rated 1-2) in either eye",
            concern_level: "medium",
            evaluate: |d| {
                matches!(d.posterior_segment.right_vessels, Some(1..=2))
                    || matches!(d.posterior_segment.left_vessels, Some(1..=2))
            },
        },
        OphthalmologyRule {
            id: "OPH-015",
            category: "Ocular Motility",
            description: "Relative afferent pupillary defect (RAPD) detected",
            concern_level: "medium",
            evaluate: |d| d.ocular_motility.relative_afferent_pupil_defect == "yes",
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        OphthalmologyRule {
            id: "OPH-016",
            category: "Visual Acuity",
            description: "Normal visual acuity in both eyes (6/6 or better)",
            concern_level: "low",
            evaluate: |d| {
                let r = classify_visual_acuity(&d.visual_acuity.right_best_corrected);
                let l = classify_visual_acuity(&d.visual_acuity.left_best_corrected);
                r == "normal" && l == "normal"
            },
        },
        OphthalmologyRule {
            id: "OPH-017",
            category: "Intraocular Pressure",
            description: "IOP normal (11-21 mmHg) in both eyes",
            concern_level: "low",
            evaluate: |d| {
                matches!(d.intraocular_pressure.right_iop, Some(11..=21))
                    && matches!(d.intraocular_pressure.left_iop, Some(11..=21))
            },
        },
        OphthalmologyRule {
            id: "OPH-018",
            category: "Anterior Segment",
            description: "All anterior segment findings normal (rated 4-5) in both eyes",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.anterior_segment.right_lids,
                    d.anterior_segment.left_lids,
                    d.anterior_segment.right_conjunctiva,
                    d.anterior_segment.left_conjunctiva,
                    d.anterior_segment.right_cornea,
                    d.anterior_segment.left_cornea,
                    d.anterior_segment.right_anterior_chamber,
                    d.anterior_segment.left_anterior_chamber,
                    d.anterior_segment.right_iris,
                    d.anterior_segment.left_iris,
                    d.anterior_segment.right_lens,
                    d.anterior_segment.left_lens,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        OphthalmologyRule {
            id: "OPH-019",
            category: "Posterior Segment",
            description: "All posterior segment findings normal (rated 4-5) in both eyes",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.posterior_segment.right_optic_disc,
                    d.posterior_segment.left_optic_disc,
                    d.posterior_segment.right_macula,
                    d.posterior_segment.left_macula,
                    d.posterior_segment.right_vessels,
                    d.posterior_segment.left_vessels,
                    d.posterior_segment.right_peripheral_retina,
                    d.posterior_segment.left_peripheral_retina,
                    d.posterior_segment.right_vitreous,
                    d.posterior_segment.left_vitreous,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        OphthalmologyRule {
            id: "OPH-020",
            category: "Ocular Motility",
            description: "Extraocular movements and pupil responses all normal (rated 4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.ocular_motility.extraocular_movements,
                    d.ocular_motility.pupil_right_direct,
                    d.ocular_motility.pupil_left_direct,
                    d.ocular_motility.pupil_right_consensual,
                    d.ocular_motility.pupil_left_consensual,
                    d.ocular_motility.convergence,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
    ]
}
