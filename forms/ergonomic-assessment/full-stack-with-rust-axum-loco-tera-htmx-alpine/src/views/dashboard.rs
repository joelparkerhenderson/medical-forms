use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::{count_pain_sites, dse_compliance_percentage};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub occupation: String,
    pub risk_level: String,
    pub risk_score: f64,
    pub symptom_count: usize,
    pub dse_compliance: String,
    pub adjustment_needed: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let symptom_count = count_pain_sites(&data);
        let dse_compliance = dse_compliance_percentage(&data);

        let adjustment_needed = if data.clinical_review.recommended_adjustments != ""
            && data.clinical_review.recommended_adjustments != "none"
        {
            "Yes".to_string()
        } else {
            "No".to_string()
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            occupation: data.occupation_details.job_title,
            risk_level: result.risk_level,
            risk_score: result.risk_score,
            symptom_count,
            dse_compliance,
            adjustment_needed,
        })
    }
}
