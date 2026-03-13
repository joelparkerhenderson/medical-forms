use super::types::AssessmentData;
use super::utils::calculate_nihss_total;

/// A declarative stroke assessment rule.
pub struct StrokeRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All stroke rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<StrokeRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        StrokeRule {
            id: "STR-001",
            category: "NIHSS",
            description: "NIHSS score >= 16 indicating severe stroke",
            concern_level: "high",
            evaluate: |d| calculate_nihss_total(d).is_some_and(|t| t >= 16),
        },
        StrokeRule {
            id: "STR-002",
            category: "Consciousness",
            description: "Consciousness impaired (NIHSS consciousness >= 1)",
            concern_level: "high",
            evaluate: |d| d.nihss_assessment.consciousness.is_some_and(|v| v >= 1),
        },
        StrokeRule {
            id: "STR-003",
            category: "Classification",
            description: "Large vessel occlusion (TACI classification)",
            concern_level: "high",
            evaluate: |d| d.stroke_classification.bamford_classification == "taci",
        },
        StrokeRule {
            id: "STR-004",
            category: "Stroke Type",
            description: "Haemorrhagic stroke identified",
            concern_level: "high",
            evaluate: |d| d.stroke_classification.stroke_type == "haemorrhagic",
        },
        StrokeRule {
            id: "STR-005",
            category: "Treatment",
            description: "Thrombolysis contraindicated but patient may be eligible",
            concern_level: "high",
            evaluate: |d| {
                d.stroke_classification.stroke_type == "ischaemic"
                    && d.acute_treatment.thrombolysis == "no"
                    && calculate_nihss_total(d).is_some_and(|t| t >= 5)
            },
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        StrokeRule {
            id: "STR-006",
            category: "NIHSS",
            description: "NIHSS score 5-15 indicating moderate stroke",
            concern_level: "medium",
            evaluate: |d| calculate_nihss_total(d).is_some_and(|t| (5..=15).contains(&t)),
        },
        StrokeRule {
            id: "STR-007",
            category: "Risk Factors",
            description: "New atrial fibrillation detected",
            concern_level: "medium",
            evaluate: |d| d.risk_factors.atrial_fibrillation == "yes",
        },
        StrokeRule {
            id: "STR-008",
            category: "Risk Factors",
            description: "Significant carotid stenosis identified",
            concern_level: "medium",
            evaluate: |d| {
                !d.risk_factors.carotid_stenosis.is_empty()
                    && d.risk_factors.carotid_stenosis != "none"
                    && d.risk_factors.carotid_stenosis != "no"
            },
        },
        StrokeRule {
            id: "STR-009",
            category: "Functional",
            description: "Modified Rankin Score >= 3 indicating significant disability",
            concern_level: "medium",
            evaluate: |d| d.functional_assessment.modified_rankin_score.is_some_and(|v| v >= 3),
        },
        StrokeRule {
            id: "STR-010",
            category: "Swallowing",
            description: "Failed swallow assessment",
            concern_level: "medium",
            evaluate: |d| d.acute_treatment.swallow_assessment == "fail",
        },
        StrokeRule {
            id: "STR-011",
            category: "Recurrence",
            description: "Recurrent stroke or TIA",
            concern_level: "medium",
            evaluate: |d| {
                d.risk_factors.previous_stroke == "yes" || d.risk_factors.previous_tia == "yes"
            },
        },
        StrokeRule {
            id: "STR-012",
            category: "Metabolic",
            description: "Poor glucose control (blood glucose > 11.0 mmol/L)",
            concern_level: "medium",
            evaluate: |d| d.investigations.blood_glucose.is_some_and(|v| v > 11.0),
        },
        StrokeRule {
            id: "STR-013",
            category: "Blood Pressure",
            description: "Uncontrolled hypertension as risk factor",
            concern_level: "medium",
            evaluate: |d| {
                d.risk_factors.hypertension == "yes"
                    && d.secondary_prevention.antihypertensive != "yes"
            },
        },
        StrokeRule {
            id: "STR-014",
            category: "NIHSS",
            description: "Bilateral deficits detected",
            concern_level: "medium",
            evaluate: |d| d.stroke_classification.side_affected == "bilateral",
        },
        StrokeRule {
            id: "STR-015",
            category: "Language",
            description: "Significant language impairment (NIHSS language >= 2)",
            concern_level: "medium",
            evaluate: |d| d.nihss_assessment.language.is_some_and(|v| v >= 2),
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        StrokeRule {
            id: "STR-016",
            category: "NIHSS",
            description: "NIHSS score 0-4 indicating minor stroke or no symptoms",
            concern_level: "low",
            evaluate: |d| calculate_nihss_total(d).is_some_and(|t| t <= 4),
        },
        StrokeRule {
            id: "STR-017",
            category: "TIA",
            description: "TIA with low recurrence risk",
            concern_level: "low",
            evaluate: |d| {
                d.event_details.tia_or_stroke == "tia"
                    && calculate_nihss_total(d).is_some_and(|t| t <= 4)
            },
        },
        StrokeRule {
            id: "STR-018",
            category: "Functional",
            description: "Good functional recovery (mRS 0-1)",
            concern_level: "low",
            evaluate: |d| d.functional_assessment.modified_rankin_score.is_some_and(|v| v <= 1),
        },
        StrokeRule {
            id: "STR-019",
            category: "Prevention",
            description: "Secondary prevention optimised",
            concern_level: "low",
            evaluate: |d| {
                (d.secondary_prevention.antiplatelet_therapy != ""
                    || d.secondary_prevention.anticoagulation_indicated == "yes")
                    && d.secondary_prevention.statin_therapy == "yes"
                    && d.secondary_prevention.lifestyle_advice == "yes"
            },
        },
        StrokeRule {
            id: "STR-020",
            category: "Swallowing",
            description: "Normal swallow assessment",
            concern_level: "low",
            evaluate: |d| d.acute_treatment.swallow_assessment == "pass",
        },
    ]
}
