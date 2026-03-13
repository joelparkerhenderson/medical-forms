use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::das28_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub diagnosis: String,
    pub assessment_date: String,
    pub activity_level: String,
    pub activity_score: f64,
    pub das28_category: String,
    pub swollen_joints: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let das28 = das28_category(data.disease_activity.das28_score);

        let swollen = match data.joint_assessment.swollen_joint_count {
            Some(c) => c.to_string(),
            None => "N/A".to_string(),
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            diagnosis: data.patient_information.diagnosis,
            assessment_date: data.patient_information.assessment_date,
            activity_level: result.activity_level,
            activity_score: result.activity_score,
            das28_category: das28.to_string(),
            swollen_joints: swollen,
        })
    }
}
