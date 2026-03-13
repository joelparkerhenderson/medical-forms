use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::count_alarm_features;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub primary_diagnosis: String,
    pub severity_level: String,
    pub alarm_features: u32,
    pub weight_change: String,
    pub endoscopy_needed: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let alarm_count = count_alarm_features(&data);

        let weight_change = if data.alarm_features.unintentional_weight_loss == "yes" {
            match data.alarm_features.weight_loss_percentage {
                Some(pct) => format!("-{:.0}%", pct),
                None => "Yes".to_string(),
            }
        } else {
            "Stable".to_string()
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name.clone(),
            primary_diagnosis: data.patient_information.primary_diagnosis.clone(),
            severity_level: result.severity_level,
            alarm_features: alarm_count,
            weight_change,
            endoscopy_needed: data.investigations.endoscopy_needed.clone(),
        })
    }
}
