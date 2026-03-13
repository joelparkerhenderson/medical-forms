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
    pub asa_grade: u8,
    pub surgery_procedure: String,
    pub allergy_flag: bool,
    pub previous_adverse_incident: bool,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult = m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let patient_name = format!("{}, {}", data.demographics.last_name, data.demographics.first_name);
        let allergy_flag = !data.allergies.is_empty();
        let previous_adverse_incident = data.previous_anaesthesia.anaesthesia_problems == "yes";

        Some(Self {
            id: m.id.to_string(),
            nhs_number: data.demographics.nhs_number,
            patient_name,
            asa_grade: result.asa_grade,
            surgery_procedure: data.demographics.planned_procedure,
            allergy_flag,
            previous_adverse_incident,
        })
    }
}
