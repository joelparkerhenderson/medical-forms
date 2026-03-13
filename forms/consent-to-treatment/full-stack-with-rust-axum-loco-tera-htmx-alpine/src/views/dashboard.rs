use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub procedure: String,
    pub consent_status: String,
    pub capacity_confirmed: String,
    pub consent_date: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let capacity_confirmed = if data.capacity_assessment.patient_has_capacity == "yes" {
            "Yes"
        } else if data.capacity_assessment.patient_has_capacity == "no" {
            "No"
        } else {
            "N/A"
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            procedure: data.procedure_details.procedure_name,
            consent_status: result.consent_status,
            capacity_confirmed: capacity_confirmed.to_string(),
            consent_date: data.signatures.patient_signature_date,
        })
    }
}
