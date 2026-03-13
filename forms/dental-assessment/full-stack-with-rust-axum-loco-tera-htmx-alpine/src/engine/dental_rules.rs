use super::types::AssessmentData;

/// A declarative dental assessment concern rule.
pub struct DentalRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All dental rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<DentalRule> {
    vec![
        // ─── HIGH CONCERN (DENT-001 to DENT-005) ─────────────────
        DentalRule {
            id: "DENT-001",
            category: "Oral Cancer",
            description: "Suspicious oral lesion on cancer screening",
            concern_level: "high",
            evaluate: |d| {
                d.oral_examination.oral_cancer_screening == "suspicious"
                    || d.oral_examination.oral_cancer_screening == "referral"
            },
        },
        DentalRule {
            id: "DENT-002",
            category: "Periodontal",
            description: "Severe periodontitis diagnosed",
            concern_level: "high",
            evaluate: |d| d.periodontal_assessment.periodontal_diagnosis == "severePeriodontitis",
        },
        DentalRule {
            id: "DENT-003",
            category: "Caries",
            description: "Multiple active caries with urgent treatment needed",
            concern_level: "high",
            evaluate: |d| {
                d.caries_assessment.active_caries == "yes"
                    && d.treatment_needs.urgent_treatment == "yes"
            },
        },
        DentalRule {
            id: "DENT-004",
            category: "Endodontic",
            description: "Periapical abscess / lesion detected",
            concern_level: "high",
            evaluate: |d| d.radiographic_findings.periapical_lesions == "yes",
        },
        DentalRule {
            id: "DENT-005",
            category: "Periodontal",
            description: "Tooth mobility present (risk of tooth loss)",
            concern_level: "high",
            evaluate: |d| d.periodontal_assessment.mobility_present == "yes",
        },
        // ─── MEDIUM CONCERN (DENT-006 to DENT-015) ───────────────
        DentalRule {
            id: "DENT-006",
            category: "Periodontal",
            description: "Moderate periodontitis diagnosed",
            concern_level: "medium",
            evaluate: |d| d.periodontal_assessment.periodontal_diagnosis == "moderatePeriodontitis",
        },
        DentalRule {
            id: "DENT-007",
            category: "Caries",
            description: "High caries risk assessed",
            concern_level: "medium",
            evaluate: |d| d.caries_assessment.caries_risk == "high",
        },
        DentalRule {
            id: "DENT-008",
            category: "Periodontal",
            description: "BPE score 4 indicating advanced periodontal disease",
            concern_level: "medium",
            evaluate: |d| d.periodontal_assessment.bpe_score == "4",
        },
        DentalRule {
            id: "DENT-009",
            category: "Radiographic",
            description: "Radiographic bone loss exceeds 30%",
            concern_level: "medium",
            evaluate: |d| d.radiographic_findings.bone_loss_percentage.is_some_and(|p| p > 30),
        },
        DentalRule {
            id: "DENT-010",
            category: "TMJ",
            description: "TMJ dysfunction present (pain or limited opening)",
            concern_level: "medium",
            evaluate: |d| d.occlusion_tmj.tmj_pain == "yes" || d.occlusion_tmj.limited_opening == "yes",
        },
        DentalRule {
            id: "DENT-011",
            category: "Tooth Wear",
            description: "Bruxism with significant tooth wear (grade 3-4)",
            concern_level: "medium",
            evaluate: |d| {
                d.occlusion_tmj.bruxism == "yes"
                    && d.occlusion_tmj.tooth_wear.is_some_and(|w| w >= 3)
            },
        },
        DentalRule {
            id: "DENT-012",
            category: "Oral Hygiene",
            description: "Poor oral hygiene (no brushing or once daily without interdental cleaning)",
            concern_level: "medium",
            evaluate: |d| {
                d.oral_hygiene.brushing_frequency == "never"
                    || d.oral_hygiene.brushing_frequency == "rarely"
                    || (d.oral_hygiene.brushing_frequency == "onceDairy"
                        && d.oral_hygiene.interdental_cleaning == "no")
            },
        },
        DentalRule {
            id: "DENT-013",
            category: "Lifestyle",
            description: "Current smoker - increased periodontal and oral cancer risk",
            concern_level: "medium",
            evaluate: |d| d.oral_hygiene.smoking_status == "current",
        },
        DentalRule {
            id: "DENT-014",
            category: "Diet",
            description: "High dietary sugar intake increasing caries risk",
            concern_level: "medium",
            evaluate: |d| d.oral_hygiene.dietary_sugar == "high",
        },
        DentalRule {
            id: "DENT-015",
            category: "Treatment",
            description: "Multiple treatment needs (5+ procedures required)",
            concern_level: "medium",
            evaluate: |d| {
                let total = d.treatment_needs.fillings.unwrap_or(0) as u16
                    + d.treatment_needs.extractions.unwrap_or(0) as u16
                    + d.treatment_needs.root_canals.unwrap_or(0) as u16
                    + d.treatment_needs.crowns.unwrap_or(0) as u16;
                total >= 5
            },
        },
        // ─── LOW CONCERN (DENT-016 to DENT-020) ──────────────────
        DentalRule {
            id: "DENT-016",
            category: "Periodontal",
            description: "Healthy periodontium - no periodontal disease",
            concern_level: "low",
            evaluate: |d| d.periodontal_assessment.periodontal_diagnosis == "healthy",
        },
        DentalRule {
            id: "DENT-017",
            category: "Caries",
            description: "Low caries risk assessed",
            concern_level: "low",
            evaluate: |d| d.caries_assessment.caries_risk == "low",
        },
        DentalRule {
            id: "DENT-018",
            category: "Oral Hygiene",
            description: "Good oral hygiene with regular interdental cleaning",
            concern_level: "low",
            evaluate: |d| {
                (d.oral_hygiene.brushing_frequency == "twiceDaily"
                    || d.oral_hygiene.brushing_frequency == "threeTimesDaily")
                    && d.oral_hygiene.interdental_cleaning == "yes"
            },
        },
        DentalRule {
            id: "DENT-019",
            category: "Attendance",
            description: "Regular dental attendance (6-monthly or more frequent)",
            concern_level: "low",
            evaluate: |d| {
                d.dental_history.visit_frequency == "every6Months"
                    || d.dental_history.visit_frequency == "every3Months"
            },
        },
        DentalRule {
            id: "DENT-020",
            category: "DMFT",
            description: "Low DMFT score (< 5)",
            concern_level: "low",
            evaluate: |d| {
                let dmft = d.caries_assessment.decayed_teeth.unwrap_or(0)
                    + d.caries_assessment.missing_teeth.unwrap_or(0)
                    + d.caries_assessment.filled_teeth.unwrap_or(0);
                // Only fire if at least one DMFT component has been entered
                (d.caries_assessment.decayed_teeth.is_some()
                    || d.caries_assessment.missing_teeth.is_some()
                    || d.caries_assessment.filled_teeth.is_some())
                    && dmft < 5
            },
        },
    ]
}
