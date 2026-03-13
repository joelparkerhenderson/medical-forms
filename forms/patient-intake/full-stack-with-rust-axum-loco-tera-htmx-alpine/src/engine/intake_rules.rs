use super::types::AssessmentData;

/// A declarative intake risk classification rule.
pub struct IntakeRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub risk_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All intake risk classification rules, ported from the frontend engine.
pub fn all_rules() -> Vec<IntakeRule> {
    vec![
        // ─── MEDICAL HISTORY ────────────────────────────────────
        IntakeRule {
            id: "MH-001",
            category: "Medical History",
            description: "Multiple chronic conditions (3+)",
            risk_level: "high",
            evaluate: |d| d.medical_history.chronic_conditions.len() >= 3,
        },
        IntakeRule {
            id: "MH-002",
            category: "Medical History",
            description: "One or two chronic conditions",
            risk_level: "medium",
            evaluate: |d| {
                let len = d.medical_history.chronic_conditions.len();
                len >= 1 && len < 3
            },
        },
        IntakeRule {
            id: "MH-003",
            category: "Medical History",
            description: "Previous surgeries reported",
            risk_level: "medium",
            evaluate: |d| !d.medical_history.previous_surgeries.trim().is_empty(),
        },
        IntakeRule {
            id: "MH-004",
            category: "Medical History",
            description: "Previous hospitalizations reported",
            risk_level: "medium",
            evaluate: |d| !d.medical_history.previous_hospitalizations.trim().is_empty(),
        },
        IntakeRule {
            id: "MH-005",
            category: "Medical History",
            description: "Ongoing treatments reported",
            risk_level: "medium",
            evaluate: |d| !d.medical_history.ongoing_treatments.trim().is_empty(),
        },
        // ─── MEDICATIONS ─────────────────────────────────────────
        IntakeRule {
            id: "RX-001",
            category: "Medications",
            description: "Polypharmacy (5+ medications)",
            risk_level: "high",
            evaluate: |d| d.medications.len() >= 5,
        },
        IntakeRule {
            id: "RX-002",
            category: "Medications",
            description: "Multiple medications (2-4)",
            risk_level: "medium",
            evaluate: |d| {
                let len = d.medications.len();
                len >= 2 && len < 5
            },
        },
        // ─── ALLERGIES ───────────────────────────────────────────
        IntakeRule {
            id: "AL-001",
            category: "Allergies",
            description: "Anaphylaxis history",
            risk_level: "high",
            evaluate: |d| d.allergies.iter().any(|a| a.severity == "anaphylaxis"),
        },
        IntakeRule {
            id: "AL-002",
            category: "Allergies",
            description: "Multiple allergies (3+)",
            risk_level: "high",
            evaluate: |d| d.allergies.len() >= 3,
        },
        IntakeRule {
            id: "AL-003",
            category: "Allergies",
            description: "Latex allergy",
            risk_level: "medium",
            evaluate: |d| d.allergies.iter().any(|a| a.allergy_type == "latex"),
        },
        IntakeRule {
            id: "AL-004",
            category: "Allergies",
            description: "Drug allergy present",
            risk_level: "medium",
            evaluate: |d| d.allergies.iter().any(|a| a.allergy_type == "drug"),
        },
        // ─── FAMILY HISTORY ──────────────────────────────────────
        IntakeRule {
            id: "FH-001",
            category: "Family History",
            description: "Multiple family conditions (3+)",
            risk_level: "medium",
            evaluate: |d| {
                let mut count = 0u32;
                if d.family_history.heart_disease == "yes" { count += 1; }
                if d.family_history.cancer == "yes" { count += 1; }
                if d.family_history.diabetes == "yes" { count += 1; }
                if d.family_history.stroke == "yes" { count += 1; }
                if d.family_history.mental_illness == "yes" { count += 1; }
                if d.family_history.genetic_conditions == "yes" { count += 1; }
                count >= 3
            },
        },
        IntakeRule {
            id: "FH-002",
            category: "Family History",
            description: "Genetic conditions in family",
            risk_level: "medium",
            evaluate: |d| d.family_history.genetic_conditions == "yes",
        },
        // ─── SOCIAL HISTORY ──────────────────────────────────────
        IntakeRule {
            id: "SH-001",
            category: "Social History",
            description: "Current smoker",
            risk_level: "medium",
            evaluate: |d| d.social_history.smoking_status == "current",
        },
        IntakeRule {
            id: "SH-002",
            category: "Social History",
            description: "Heavy alcohol use",
            risk_level: "medium",
            evaluate: |d| d.social_history.alcohol_frequency == "heavy",
        },
        IntakeRule {
            id: "SH-003",
            category: "Social History",
            description: "Regular drug use",
            risk_level: "high",
            evaluate: |d| d.social_history.drug_use == "regular",
        },
        // ─── REVIEW OF SYSTEMS ───────────────────────────────────
        IntakeRule {
            id: "ROS-001",
            category: "Review of Systems",
            description: "Cardiovascular symptoms reported",
            risk_level: "medium",
            evaluate: |d| !d.review_of_systems.cardiovascular.trim().is_empty(),
        },
        IntakeRule {
            id: "ROS-002",
            category: "Review of Systems",
            description: "Neurological symptoms reported",
            risk_level: "medium",
            evaluate: |d| !d.review_of_systems.neurological.trim().is_empty(),
        },
        IntakeRule {
            id: "ROS-003",
            category: "Review of Systems",
            description: "Psychiatric symptoms reported",
            risk_level: "medium",
            evaluate: |d| !d.review_of_systems.psychiatric.trim().is_empty(),
        },
        // ─── URGENCY ─────────────────────────────────────────────
        IntakeRule {
            id: "UR-001",
            category: "Urgency",
            description: "Emergency visit",
            risk_level: "high",
            evaluate: |d| d.reason_for_visit.urgency_level == "emergency",
        },
        IntakeRule {
            id: "UR-002",
            category: "Urgency",
            description: "Urgent visit",
            risk_level: "medium",
            evaluate: |d| d.reason_for_visit.urgency_level == "urgent",
        },
        // ─── CONSENT ─────────────────────────────────────────────
        IntakeRule {
            id: "CN-001",
            category: "Consent",
            description: "Consent to treatment not given",
            risk_level: "high",
            evaluate: |d| d.consent_and_preferences.consent_to_treatment == "no",
        },
        IntakeRule {
            id: "CN-002",
            category: "Consent",
            description: "Privacy acknowledgement not given",
            risk_level: "medium",
            evaluate: |d| d.consent_and_preferences.privacy_acknowledgement == "no",
        },
    ]
}
