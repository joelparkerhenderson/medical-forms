use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::stage_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub cancer_type: String,
    pub overall_stage: String,
    pub stage_category: String,
    pub oncology_level: String,
    pub oncology_score: f64,
    pub ecog_score: String,
    pub current_treatment: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let stage_cat = stage_category(&data.staging_grading.overall_stage);

        let ecog = match data.performance_status.ecog_score {
            Some(s) => s.to_string(),
            None => "N/A".to_string(),
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            cancer_type: data.cancer_diagnosis.cancer_type,
            overall_stage: data.staging_grading.overall_stage,
            stage_category: stage_cat.to_string(),
            oncology_level: result.oncology_level,
            oncology_score: result.oncology_score,
            ecog_score: ecog,
            current_treatment: data.current_treatment.current_treatment_type,
        })
    }
}
