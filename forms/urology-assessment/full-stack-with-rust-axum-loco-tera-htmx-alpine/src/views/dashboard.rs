use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::{calculate_ipss_total, ipss_category};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub referral_date: String,
    pub patient_name: String,
    pub referring_provider: String,
    pub severity_level: String,
    pub severity_score: f64,
    pub ipss_category: String,
    pub reason_for_referral: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let ipss_total = calculate_ipss_total(&data);
        let ipss_cat = ipss_category(ipss_total);

        Some(Self {
            id: m.id.to_string(),
            referral_date: data.patient_information.referral_date,
            patient_name: data.patient_information.patient_name,
            referring_provider: data.patient_information.referring_provider,
            severity_level: result.severity_level,
            severity_score: result.severity_score,
            ipss_category: ipss_cat.to_string(),
            reason_for_referral: data.patient_information.reason_for_referral,
        })
    }
}
