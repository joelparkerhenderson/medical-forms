use super::types::AssessmentData;
use super::utils::{capacity_score, understanding_score};

/// A declarative consent validation rule.
pub struct ConsentRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All consent rules, ordered by concern level (high > medium > low).
pub fn all_rules() -> Vec<ConsentRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        ConsentRule {
            id: "CON-001",
            category: "Capacity",
            description: "Patient capacity not confirmed",
            concern_level: "high",
            evaluate: |d| d.capacity_assessment.patient_has_capacity != "yes",
        },
        ConsentRule {
            id: "CON-002",
            category: "Risks",
            description: "Risks not explained to patient",
            concern_level: "high",
            evaluate: |d| {
                d.risks_and_benefits.specific_risks.trim().is_empty()
                    && d.risks_and_benefits.general_risks.trim().is_empty()
            },
        },
        ConsentRule {
            id: "CON-003",
            category: "Procedure",
            description: "Procedure not clearly identified",
            concern_level: "high",
            evaluate: |d| d.procedure_details.procedure_name.trim().is_empty(),
        },
        ConsentRule {
            id: "CON-004",
            category: "Signature",
            description: "Patient has not signed consent form",
            concern_level: "high",
            evaluate: |d| d.signatures.patient_signature.trim().is_empty(),
        },
        ConsentRule {
            id: "CON-005",
            category: "Understanding",
            description: "Patient unable to explain procedure back",
            concern_level: "high",
            evaluate: |d| matches!(d.patient_understanding.can_explain_procedure, Some(1..=2)),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        ConsentRule {
            id: "CON-006",
            category: "Alternatives",
            description: "Alternative treatments not discussed",
            concern_level: "medium",
            evaluate: |d| d.alternatives.alternative_treatments.trim().is_empty(),
        },
        ConsentRule {
            id: "CON-007",
            category: "Benefits",
            description: "Expected benefits not documented",
            concern_level: "medium",
            evaluate: |d| d.risks_and_benefits.expected_benefits.trim().is_empty(),
        },
        ConsentRule {
            id: "CON-008",
            category: "Understanding",
            description: "Patient cannot explain risks back (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.patient_understanding.can_explain_risks, Some(1..=2)),
        },
        ConsentRule {
            id: "CON-009",
            category: "Capacity",
            description: "Capacity score below 50%",
            concern_level: "medium",
            evaluate: |d| capacity_score(d).is_some_and(|s| s < 50.0),
        },
        ConsentRule {
            id: "CON-010",
            category: "Understanding",
            description: "Understanding score below 50%",
            concern_level: "medium",
            evaluate: |d| understanding_score(d).is_some_and(|s| s < 50.0),
        },
        ConsentRule {
            id: "CON-011",
            category: "Voluntariness",
            description: "Consent not confirmed as voluntary",
            concern_level: "medium",
            evaluate: |d| d.signatures.consent_voluntary != "yes",
        },
        ConsentRule {
            id: "CON-012",
            category: "Clinician",
            description: "Clinician signature missing",
            concern_level: "medium",
            evaluate: |d| d.clinical_verification.clinician_signature.trim().is_empty(),
        },
        ConsentRule {
            id: "CON-013",
            category: "Understanding",
            description: "Patient cannot explain alternatives back (rated 1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.patient_understanding.can_explain_alternatives, Some(1..=2)),
        },
        ConsentRule {
            id: "CON-014",
            category: "Withdrawal",
            description: "Right to withdraw not confirmed as understood",
            concern_level: "medium",
            evaluate: |d| d.signatures.right_to_withdraw_understood != "yes",
        },
        ConsentRule {
            id: "CON-015",
            category: "Anaesthesia",
            description: "Anaesthesia type not specified",
            concern_level: "medium",
            evaluate: |d| d.procedure_details.anaesthesia_type.trim().is_empty(),
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        ConsentRule {
            id: "CON-016",
            category: "Information",
            description: "Information leaflet not provided",
            concern_level: "low",
            evaluate: |d| d.patient_understanding.information_leaflet_provided != "yes",
        },
        ConsentRule {
            id: "CON-017",
            category: "Witness",
            description: "Witness signature not obtained",
            concern_level: "low",
            evaluate: |d| d.signatures.witness_signature.trim().is_empty(),
        },
        ConsentRule {
            id: "CON-018",
            category: "Clinician",
            description: "Clinician GMC number not recorded",
            concern_level: "low",
            evaluate: |d| d.clinical_verification.clinician_gmc_number.trim().is_empty(),
        },
        ConsentRule {
            id: "CON-019",
            category: "Capacity",
            description: "All capacity items rated high (4-5) - good capacity confirmed",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.capacity_assessment.can_understand_information,
                    d.capacity_assessment.can_retain_information,
                    d.capacity_assessment.can_weigh_information,
                    d.capacity_assessment.can_communicate_decision,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        ConsentRule {
            id: "CON-020",
            category: "Understanding",
            description: "All understanding items rated high (4-5) - excellent comprehension",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.patient_understanding.can_explain_procedure,
                    d.patient_understanding.can_explain_risks,
                    d.patient_understanding.can_explain_alternatives,
                    d.patient_understanding.questions_answered_satisfactorily,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
    ]
}
