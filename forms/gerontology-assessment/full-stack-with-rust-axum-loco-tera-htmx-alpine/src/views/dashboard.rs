use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub frailty_level: String,
    pub barthel_score: u8,
    pub cognitive_score: String,
    pub falls_count: String,
    pub polypharmacy: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let cognitive_score = match result.cognitive_score {
            Some(s) => format!("{}/30", s),
            None => "N/A".to_string(),
        };

        let falls_count = match result.falls_count {
            Some(f) => f.to_string(),
            None => "N/A".to_string(),
        };

        let polypharmacy = match result.polypharmacy_count {
            Some(p) => format!("{} meds", p),
            None => "N/A".to_string(),
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.patient_name,
            frailty_level: result.frailty_level,
            barthel_score: result.barthel_score,
            cognitive_score,
            falls_count,
            polypharmacy,
        })
    }
}
