use super::types::AssessmentData;
use super::utils::has_life_sustaining_refusal;

/// A declarative validity rule for Advance Decision to Refuse Treatment.
pub struct ValidityRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub severity: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All 22 validity rules, ported from the frontend engine.
///
/// Under the UK Mental Capacity Act 2005:
/// - An ADRT refusing life-sustaining treatment MUST be in writing, signed, and witnessed.
/// - It MUST include a written statement that the decision applies "even if life is at risk".
/// - Without these, the ADRT is not legally valid for life-sustaining treatments.
pub fn all_rules() -> Vec<ValidityRule> {
    vec![
        // ─── CRITICAL: Life-sustaining treatment legal requirements ───
        ValidityRule {
            id: "VR-001",
            category: "Life-Sustaining Treatment",
            description: "Life-sustaining refusal requires \"even if life is at risk\" statement for CPR",
            severity: "critical",
            evaluate: |d| {
                d.treatments_refused_life_sustaining.cpr.refused == "yes"
                    && d.treatments_refused_life_sustaining.cpr.even_if_life_at_risk != "yes"
            },
        },
        ValidityRule {
            id: "VR-002",
            category: "Life-Sustaining Treatment",
            description: "Life-sustaining refusal requires \"even if life is at risk\" statement for mechanical ventilation",
            severity: "critical",
            evaluate: |d| {
                d.treatments_refused_life_sustaining.mechanical_ventilation.refused == "yes"
                    && d.treatments_refused_life_sustaining.mechanical_ventilation.even_if_life_at_risk != "yes"
            },
        },
        ValidityRule {
            id: "VR-003",
            category: "Life-Sustaining Treatment",
            description: "Life-sustaining refusal requires \"even if life is at risk\" statement for artificial nutrition/hydration",
            severity: "critical",
            evaluate: |d| {
                d.treatments_refused_life_sustaining.artificial_nutrition_hydration.refused == "yes"
                    && d.treatments_refused_life_sustaining.artificial_nutrition_hydration.even_if_life_at_risk != "yes"
            },
        },
        ValidityRule {
            id: "VR-004",
            category: "Life-Sustaining Treatment",
            description: "Life-sustaining refusal requires written statement that decision applies even if life is at risk",
            severity: "critical",
            evaluate: |d| {
                has_life_sustaining_refusal(d)
                    && d.legal_signatures.life_sustaining_written_statement != "yes"
            },
        },
        ValidityRule {
            id: "VR-005",
            category: "Life-Sustaining Treatment",
            description: "Life-sustaining refusal requires patient signature on life-sustaining section",
            severity: "critical",
            evaluate: |d| {
                has_life_sustaining_refusal(d)
                    && d.legal_signatures.life_sustaining_signature != "yes"
            },
        },
        ValidityRule {
            id: "VR-006",
            category: "Life-Sustaining Treatment",
            description: "Life-sustaining refusal requires witness signature on life-sustaining section",
            severity: "critical",
            evaluate: |d| {
                has_life_sustaining_refusal(d)
                    && d.legal_signatures.life_sustaining_witness_signature != "yes"
            },
        },
        // ─── REQUIRED: General legal requirements ────────────────────
        ValidityRule {
            id: "VR-007",
            category: "Signature",
            description: "Patient signature is required",
            severity: "required",
            evaluate: |d| d.legal_signatures.patient_signature != "yes",
        },
        ValidityRule {
            id: "VR-008",
            category: "Signature",
            description: "Patient statement of understanding is required",
            severity: "required",
            evaluate: |d| d.legal_signatures.patient_statement_of_understanding != "yes",
        },
        ValidityRule {
            id: "VR-009",
            category: "Signature",
            description: "Witness signature is required",
            severity: "required",
            evaluate: |d| d.legal_signatures.witness_signature != "yes",
        },
        ValidityRule {
            id: "VR-010",
            category: "Signature",
            description: "Witness name is required",
            severity: "required",
            evaluate: |d| d.legal_signatures.witness_name.trim().is_empty(),
        },
        ValidityRule {
            id: "VR-011",
            category: "Capacity",
            description: "Mental capacity confirmation is required",
            severity: "required",
            evaluate: |d| d.capacity_declaration.confirms_capacity != "yes",
        },
        ValidityRule {
            id: "VR-012",
            category: "Capacity",
            description: "Understanding of consequences is required",
            severity: "required",
            evaluate: |d| d.capacity_declaration.understands_consequences != "yes",
        },
        ValidityRule {
            id: "VR-013",
            category: "Capacity",
            description: "Confirmation of no undue influence is required",
            severity: "required",
            evaluate: |d| d.capacity_declaration.no_undue_influence != "yes",
        },
        ValidityRule {
            id: "VR-014",
            category: "Personal Information",
            description: "Full legal name is required",
            severity: "required",
            evaluate: |d| d.personal_information.full_legal_name.trim().is_empty(),
        },
        ValidityRule {
            id: "VR-015",
            category: "Personal Information",
            description: "Date of birth is required",
            severity: "required",
            evaluate: |d| d.personal_information.date_of_birth.is_empty(),
        },
        ValidityRule {
            id: "VR-016",
            category: "Treatments",
            description: "At least one treatment refusal must be specified",
            severity: "required",
            evaluate: |d| {
                let g = &d.treatments_refused_general;
                let has_general =
                    g.antibiotics.refused == "yes"
                    || g.blood_transfusion.refused == "yes"
                    || g.iv_fluids.refused == "yes"
                    || g.tube_feeding.refused == "yes"
                    || g.dialysis.refused == "yes"
                    || g.ventilation.refused == "yes"
                    || g.other_treatments.iter().any(|t| t.refused == "yes");
                !has_general && !has_life_sustaining_refusal(d)
            },
        },
        ValidityRule {
            id: "VR-017",
            category: "Circumstances",
            description: "Specific circumstances for ADRT application must be described",
            severity: "required",
            evaluate: |d| d.circumstances.specific_circumstances.trim().is_empty(),
        },
        // ─── RECOMMENDED: Best practice ──────────────────────────────
        ValidityRule {
            id: "VR-018",
            category: "Healthcare Professional",
            description: "Healthcare professional review is recommended",
            severity: "recommended",
            evaluate: |d| d.healthcare_professional_review.reviewed_by_clinician_name.trim().is_empty(),
        },
        ValidityRule {
            id: "VR-019",
            category: "Healthcare Professional",
            description: "Review date should be recorded",
            severity: "recommended",
            evaluate: |d| d.healthcare_professional_review.review_date.is_empty(),
        },
        ValidityRule {
            id: "VR-020",
            category: "Personal Information",
            description: "NHS number should be recorded for identification",
            severity: "recommended",
            evaluate: |d| d.personal_information.nhs_number.trim().is_empty(),
        },
        ValidityRule {
            id: "VR-021",
            category: "Personal Information",
            description: "GP details should be recorded",
            severity: "recommended",
            evaluate: |d| d.personal_information.gp_name.trim().is_empty(),
        },
        ValidityRule {
            id: "VR-022",
            category: "LPA",
            description: "LPA status should be declared",
            severity: "recommended",
            evaluate: |d| d.lasting_power_of_attorney.has_lpa.is_empty(),
        },
    ]
}
