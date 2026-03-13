use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub nhs_number: String,
    pub patient_name: String,
    pub news2_score: u8,
    pub clinical_response: String,
    pub chief_complaint: String,
    pub allergy_flag: bool,
    pub mts_category: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult = m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let patient_name = format!("{}, {}", data.demographics.last_name, data.demographics.first_name);
        let allergy_flag = !data.allergies.is_empty();

        Some(Self {
            id: m.id.to_string(),
            nhs_number: data.demographics.nhs_number,
            patient_name,
            news2_score: result.news2_score,
            clinical_response: result.clinical_response.clone(),
            chief_complaint: data.presenting_complaint.chief_complaint,
            allergy_flag,
            mts_category: data.arrival_triage.mts_category,
        })
    }
}
