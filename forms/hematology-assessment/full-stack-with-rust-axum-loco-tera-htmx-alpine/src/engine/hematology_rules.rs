use super::types::AssessmentData;
use super::utils::{blood_count_score, coagulation_score, iron_studies_score};

/// A declarative hematology concern rule.
pub struct HematologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All hematology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<HematologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        HematologyRule {
            id: "HEM-001",
            category: "Blood Count",
            description: "Critical hemoglobin level (<7 g/dL) - severe anemia",
            concern_level: "high",
            evaluate: |d| d.blood_count_analysis.hemoglobin.is_some_and(|v| v < 7.0),
        },
        HematologyRule {
            id: "HEM-002",
            category: "Blood Count",
            description: "Severe thrombocytopenia (platelets <20 x10^9/L) - bleeding risk",
            concern_level: "high",
            evaluate: |d| d.blood_count_analysis.platelet_count.is_some_and(|v| v < 20.0),
        },
        HematologyRule {
            id: "HEM-003",
            category: "Blood Count",
            description: "Severe leukocytosis (WBC >30 x10^9/L) - possible malignancy",
            concern_level: "high",
            evaluate: |d| d.blood_count_analysis.white_blood_cell_count.is_some_and(|v| v > 30.0),
        },
        HematologyRule {
            id: "HEM-004",
            category: "Coagulation",
            description: "Critically elevated INR (>4.0) - major hemorrhage risk",
            concern_level: "high",
            evaluate: |d| d.coagulation_studies.inr.is_some_and(|v| v > 4.0),
        },
        HematologyRule {
            id: "HEM-005",
            category: "Coagulation",
            description: "Severely low fibrinogen (<100 mg/dL) - DIC risk",
            concern_level: "high",
            evaluate: |d| d.coagulation_studies.fibrinogen.is_some_and(|v| v < 100.0),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        HematologyRule {
            id: "HEM-006",
            category: "Blood Count",
            description: "Moderate anemia (hemoglobin 7-10 g/dL)",
            concern_level: "medium",
            evaluate: |d| d.blood_count_analysis.hemoglobin.is_some_and(|v| v >= 7.0 && v < 10.0),
        },
        HematologyRule {
            id: "HEM-007",
            category: "Blood Count",
            description: "Moderate thrombocytopenia (platelets 20-50 x10^9/L)",
            concern_level: "medium",
            evaluate: |d| d.blood_count_analysis.platelet_count.is_some_and(|v| v >= 20.0 && v < 50.0),
        },
        HematologyRule {
            id: "HEM-008",
            category: "Blood Count",
            description: "Leukopenia (WBC <4.0 x10^9/L) - infection risk",
            concern_level: "medium",
            evaluate: |d| d.blood_count_analysis.white_blood_cell_count.is_some_and(|v| v < 4.0),
        },
        HematologyRule {
            id: "HEM-009",
            category: "Blood Count",
            description: "Microcytosis (MCV <80 fL) - possible iron deficiency",
            concern_level: "medium",
            evaluate: |d| d.blood_count_analysis.mean_corpuscular_volume.is_some_and(|v| v < 80.0),
        },
        HematologyRule {
            id: "HEM-010",
            category: "Blood Count",
            description: "Macrocytosis (MCV >100 fL) - possible B12/folate deficiency",
            concern_level: "medium",
            evaluate: |d| d.blood_count_analysis.mean_corpuscular_volume.is_some_and(|v| v > 100.0),
        },
        HematologyRule {
            id: "HEM-011",
            category: "Coagulation",
            description: "Elevated INR (1.5-4.0) - coagulopathy",
            concern_level: "medium",
            evaluate: |d| d.coagulation_studies.inr.is_some_and(|v| v > 1.5 && v <= 4.0),
        },
        HematologyRule {
            id: "HEM-012",
            category: "Coagulation",
            description: "Elevated D-dimer (>2.0 mg/L) - thrombotic concern",
            concern_level: "medium",
            evaluate: |d| d.coagulation_studies.d_dimer.is_some_and(|v| v > 2.0),
        },
        HematologyRule {
            id: "HEM-013",
            category: "Iron Studies",
            description: "Severely depleted ferritin (<10 ng/mL) - iron deficiency",
            concern_level: "medium",
            evaluate: |d| d.iron_studies.serum_ferritin.is_some_and(|v| v < 10.0),
        },
        HematologyRule {
            id: "HEM-014",
            category: "Iron Studies",
            description: "Iron overload (ferritin >500 ng/mL) - hemochromatosis risk",
            concern_level: "medium",
            evaluate: |d| d.iron_studies.serum_ferritin.is_some_and(|v| v > 500.0),
        },
        HematologyRule {
            id: "HEM-015",
            category: "Blood Count",
            description: "Blood count dimension score above 60% - multiple abnormalities",
            concern_level: "medium",
            evaluate: |d| blood_count_score(d).is_some_and(|s| s > 60.0),
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        HematologyRule {
            id: "HEM-016",
            category: "Blood Count",
            description: "All blood count values within normal range",
            concern_level: "low",
            evaluate: |d| {
                let hgb = d.blood_count_analysis.hemoglobin;
                let wbc = d.blood_count_analysis.white_blood_cell_count;
                let plt = d.blood_count_analysis.platelet_count;
                let mcv = d.blood_count_analysis.mean_corpuscular_volume;
                // At least hemoglobin, WBC, platelets must be present and normal
                hgb.is_some_and(|v| v >= 12.0 && v <= 17.0)
                    && wbc.is_some_and(|v| v >= 4.0 && v <= 11.0)
                    && plt.is_some_and(|v| v >= 150.0 && v <= 400.0)
                    && mcv.map_or(true, |v| v >= 80.0 && v <= 100.0)
            },
        },
        HematologyRule {
            id: "HEM-017",
            category: "Coagulation",
            description: "All coagulation studies within normal range",
            concern_level: "low",
            evaluate: |d| {
                let pt = d.coagulation_studies.prothrombin_time;
                let inr = d.coagulation_studies.inr;
                let aptt = d.coagulation_studies.activated_partial_thromboplastin_time;
                // At least INR must be present and normal
                inr.is_some_and(|v| v >= 0.8 && v <= 1.2)
                    && pt.map_or(true, |v| v >= 11.0 && v <= 13.5)
                    && aptt.map_or(true, |v| v >= 25.0 && v <= 35.0)
            },
        },
        HematologyRule {
            id: "HEM-018",
            category: "Iron Studies",
            description: "Iron studies within normal range",
            concern_level: "low",
            evaluate: |d| {
                let ferritin = d.iron_studies.serum_ferritin;
                let iron = d.iron_studies.serum_iron;
                let tsat = d.iron_studies.transferrin_saturation;
                ferritin.is_some_and(|v| v >= 20.0 && v <= 250.0)
                    && iron.map_or(true, |v| v >= 60.0 && v <= 170.0)
                    && tsat.map_or(true, |v| v >= 20.0 && v <= 50.0)
            },
        },
        HematologyRule {
            id: "HEM-019",
            category: "Coagulation",
            description: "Mildly elevated D-dimer (0.5-2.0 mg/L) - monitor",
            concern_level: "low",
            evaluate: |d| d.coagulation_studies.d_dimer.is_some_and(|v| v > 0.5 && v <= 2.0),
        },
        HematologyRule {
            id: "HEM-020",
            category: "Blood Count",
            description: "Elevated RDW (>14.5%) - anisocytosis",
            concern_level: "low",
            evaluate: |d| d.blood_count_analysis.red_cell_distribution_width.is_some_and(|v| v > 14.5),
        },
    ]
}
