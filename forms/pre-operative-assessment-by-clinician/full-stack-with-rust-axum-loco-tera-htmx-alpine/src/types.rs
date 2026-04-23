use serde::{Deserialize, Deserializer, Serialize};

/// Treat empty-string form fields as `None` when decoding `Option<T>`.
///
/// `axum::Form` backs on `serde_urlencoded`, which surfaces an unfilled
/// numeric input as the empty string rather than a missing key — and
/// `Option<T>` on its own fails to parse `""` as `None`. This adapter
/// bridges the gap.
fn empty_string_as_none<'de, D, T>(de: D) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
    T: std::str::FromStr,
    T::Err: std::fmt::Display,
{
    let s: Option<String> = Option::deserialize(de)?;
    match s.as_deref() {
        None | Some("") => Ok(None),
        Some(v) => v.parse::<T>().map(Some).map_err(serde::de::Error::custom),
    }
}

/// Snapshot of every field the clinician's single-page wizard can record.
///
/// Grouped by body system to mirror the 16-step wizard described in
/// `../AGENTS.md`. Missing / unfilled fields use empty-string or `None`
/// per the monorepo convention.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClinicianAssessment {
    // Step 1 — Clinician identification
    #[serde(default)]
    pub clinician_name: String,
    #[serde(default)]
    pub clinician_role: String,
    #[serde(default)]
    pub clinician_registration: String,

    // Step 2 — Patient identification & planned procedure
    #[serde(default)]
    pub nhs_number: String,
    #[serde(default)]
    pub patient_name: String,
    #[serde(default)]
    pub date_of_birth: String,
    #[serde(default)]
    pub sex: String,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub weight_kg: Option<f64>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub height_cm: Option<f64>,
    #[serde(default)]
    pub planned_procedure: String,
    #[serde(default)]
    pub urgency: String,

    // Step 3 — Vital signs
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub systolic_bp: Option<u32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub diastolic_bp: Option<u32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub heart_rate: Option<u32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub spo2: Option<u32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub temperature_c: Option<f64>,

    // Step 4 — Airway
    /// 1..=4
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub mallampati_class: Option<u8>,
    #[serde(default)]
    pub difficult_intubation_history: String,
    /// 0..=8
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub stop_bang_score: Option<u8>,

    // Step 5 — Cardiovascular
    /// Echocardiogram ejection fraction (%)
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub echo_ef_percent: Option<u32>,
    #[serde(default)]
    pub ischaemic_heart_disease: String,
    #[serde(default)]
    pub heart_failure: String,

    // Step 6 — Respiratory
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub recent_covid_weeks: Option<u32>,
    #[serde(default)]
    pub copd: String,

    // Step 7 — Neurological
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub gcs: Option<u8>,
    #[serde(default)]
    pub stroke_or_tia: String,
    #[serde(default)]
    pub cognitive_impairment: String,

    // Step 8 — Renal & hepatic
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub egfr: Option<u32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub bilirubin_umol: Option<u32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub albumin_g_per_l: Option<u32>,

    // Step 9 — Haematology & coagulation
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub haemoglobin_g_per_l: Option<u32>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub inr: Option<f64>,
    #[serde(default)]
    pub on_anticoagulant: String,

    // Step 10 — Endocrine
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub hba1c_percent: Option<f64>,
    #[serde(default)]
    pub diabetes: String,

    // Step 11 — Gastrointestinal
    #[serde(default)]
    pub adequately_fasted: String,

    // Step 12 — Musculoskeletal & integumentary
    #[serde(default)]
    pub neuraxial_spine_feasible: String,

    // Step 13 — Medications & allergies
    #[serde(default)]
    pub known_allergies: String,
    #[serde(default)]
    pub latex_allergy: String,

    // Step 14 — Functional capacity & frailty
    /// 1..=9
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub clinical_frailty_scale: Option<u8>,
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub mets_estimate: Option<u8>,

    // Step 15 — Anaesthesia plan
    #[serde(default)]
    pub anaesthesia_technique: String,
    #[serde(default)]
    pub post_op_disposition: String,

    // Step 16 — Sign-off
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub clinician_asa_override: Option<u8>,
    #[serde(default)]
    pub override_reason: String,
    #[serde(default)]
    pub final_recommendation: String,
}

/// A single rule that fired during grading.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub rule_id: &'static str,
    pub description: &'static str,
    pub asa_grade: u8,
}

/// A safety flag that fires independently of the ASA grade.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SafetyFlag {
    pub flag_id: &'static str,
    pub description: &'static str,
    pub priority: &'static str, // "high" | "medium" | "low"
}

/// Composite perioperative risk band.
#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum CompositeRisk {
    Low,
    Moderate,
    High,
    Critical,
}

impl CompositeRisk {
    pub fn label(self) -> &'static str {
        match self {
            CompositeRisk::Low => "Low",
            CompositeRisk::Moderate => "Moderate",
            CompositeRisk::High => "High",
            CompositeRisk::Critical => "Critical",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GradingResult {
    pub asa_grade: u8,
    pub asa_grade_override: Option<u8>,
    pub final_asa_grade: u8,
    pub composite_risk: CompositeRisk,
    pub fired_rules: Vec<FiredRule>,
    pub safety_flags: Vec<SafetyFlag>,
}
