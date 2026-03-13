use super::types::AssessmentData;
use super::utils::{count_pain_sites, dse_compliance_count, posture_score, symptom_score};

/// A declarative ergonomic risk rule.
pub struct RiskRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All ergonomic risk rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<RiskRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        RiskRule {
            id: "ERGO-001",
            category: "MSD Symptoms",
            description: "Severe musculoskeletal symptoms reported (pain level 5 at any site)",
            concern_level: "high",
            evaluate: |d| {
                let items = [
                    d.musculoskeletal_symptoms.neck_pain,
                    d.musculoskeletal_symptoms.shoulder_pain,
                    d.musculoskeletal_symptoms.upper_back_pain,
                    d.musculoskeletal_symptoms.lower_back_pain,
                    d.musculoskeletal_symptoms.wrist_hand_pain,
                    d.musculoskeletal_symptoms.elbow_pain,
                    d.musculoskeletal_symptoms.hip_pain,
                    d.musculoskeletal_symptoms.knee_pain,
                ];
                items.iter().any(|x| *x == Some(5))
            },
        },
        RiskRule {
            id: "ERGO-002",
            category: "Posture",
            description: "RULA score 7 or above - very high postural risk",
            concern_level: "high",
            evaluate: |d| matches!(d.posture_assessment.rula_score, Some(7..=10)),
        },
        RiskRule {
            id: "ERGO-003",
            category: "Manual Handling",
            description: "Heavy manual handling - lifting over 25kg reported",
            concern_level: "high",
            evaluate: |d| d.manual_handling.max_lift_weight_kg == "moreThan25",
        },
        RiskRule {
            id: "ERGO-004",
            category: "DSE",
            description: "Continuous DSE use exceeding 8 hours without adequate breaks",
            concern_level: "high",
            evaluate: |d| d.dse_assessment.continuous_dse_hours == "moreThan8",
        },
        RiskRule {
            id: "ERGO-005",
            category: "MSD Symptoms",
            description: "Multiple pain sites (4 or more) with moderate or severe symptoms",
            concern_level: "high",
            evaluate: |d| count_pain_sites(d) >= 4,
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        RiskRule {
            id: "ERGO-006",
            category: "Posture",
            description: "Posture dimension risk score above 60%",
            concern_level: "medium",
            evaluate: |d| posture_score(d).is_some_and(|s| s > 60.0),
        },
        RiskRule {
            id: "ERGO-007",
            category: "MSD Symptoms",
            description: "Symptom severity score above 60%",
            concern_level: "medium",
            evaluate: |d| symptom_score(d).is_some_and(|s| s > 60.0),
        },
        RiskRule {
            id: "ERGO-008",
            category: "Workstation",
            description: "Monitor position rated poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.workstation_assessment.monitor_position, Some(1..=2)),
        },
        RiskRule {
            id: "ERGO-009",
            category: "Workstation",
            description: "Chair adjustability rated poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.workstation_assessment.chair_adjustability, Some(1..=2)),
        },
        RiskRule {
            id: "ERGO-010",
            category: "Manual Handling",
            description: "Frequent lifting reported (more than 10 times per day)",
            concern_level: "medium",
            evaluate: |d| d.manual_handling.lifting_frequency == "moreThan10PerDay",
        },
        RiskRule {
            id: "ERGO-011",
            category: "DSE",
            description: "DSE compliance below 50% (fewer than 5 of 9 items met)",
            concern_level: "medium",
            evaluate: |d| dse_compliance_count(d) < 5,
        },
        RiskRule {
            id: "ERGO-012",
            category: "Break Patterns",
            description: "No breaks taken during work periods",
            concern_level: "medium",
            evaluate: |d| d.break_patterns.break_frequency == "never",
        },
        RiskRule {
            id: "ERGO-013",
            category: "Environment",
            description: "Lighting rated poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.environmental_factors.lighting_adequate, Some(1..=2)),
        },
        RiskRule {
            id: "ERGO-014",
            category: "Posture",
            description: "REBA score 8-10 indicating high risk posture",
            concern_level: "medium",
            evaluate: |d| matches!(d.posture_assessment.reba_score, Some(8..=10)),
        },
        RiskRule {
            id: "ERGO-015",
            category: "MSD Symptoms",
            description: "Chronic symptoms lasting more than 12 weeks",
            concern_level: "medium",
            evaluate: |d| d.musculoskeletal_symptoms.symptom_duration == "moreThan12Weeks",
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        RiskRule {
            id: "ERGO-016",
            category: "Workstation",
            description: "All workstation items rated good or excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.workstation_assessment.desk_height_appropriate,
                    d.workstation_assessment.chair_adjustability,
                    d.workstation_assessment.monitor_position,
                    d.workstation_assessment.keyboard_mouse_placement,
                    d.workstation_assessment.legroom_adequate,
                    d.workstation_assessment.desk_surface_area,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        RiskRule {
            id: "ERGO-017",
            category: "DSE",
            description: "Full DSE compliance (all 9 items met)",
            concern_level: "low",
            evaluate: |d| dse_compliance_count(d) == 9,
        },
        RiskRule {
            id: "ERGO-018",
            category: "MSD Symptoms",
            description: "No significant pain reported (all pain sites rated 1)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.musculoskeletal_symptoms.neck_pain,
                    d.musculoskeletal_symptoms.shoulder_pain,
                    d.musculoskeletal_symptoms.upper_back_pain,
                    d.musculoskeletal_symptoms.lower_back_pain,
                    d.musculoskeletal_symptoms.wrist_hand_pain,
                    d.musculoskeletal_symptoms.elbow_pain,
                    d.musculoskeletal_symptoms.hip_pain,
                    d.musculoskeletal_symptoms.knee_pain,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v == 1)
            },
        },
        RiskRule {
            id: "ERGO-019",
            category: "Break Patterns",
            description: "Regular micro-breaks and stretching exercises taken",
            concern_level: "low",
            evaluate: |d| {
                d.break_patterns.micro_breaks_taken == "yes"
                    && d.break_patterns.stretching_exercises == "yes"
            },
        },
        RiskRule {
            id: "ERGO-020",
            category: "Environment",
            description: "All environmental factors rated good or excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.environmental_factors.lighting_adequate,
                    d.environmental_factors.temperature_comfortable,
                    d.environmental_factors.noise_level_acceptable,
                    d.environmental_factors.ventilation_adequate,
                    d.environmental_factors.space_sufficient,
                    d.environmental_factors.floor_surface_safe,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
    ]
}
