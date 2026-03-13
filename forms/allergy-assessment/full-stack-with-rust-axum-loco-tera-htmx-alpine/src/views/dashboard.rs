use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub primary_allergen: String,
    pub severity_level: String,
    pub anaphylaxis_risk: String,
    pub has_epi_pen: String,
    pub last_review: String,
    pub allergen_category: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let anaphylaxis_risk = match data.symptoms_reactions.anaphylaxis_risk {
            Some(4..=5) => "High",
            Some(3) => "Moderate",
            Some(1..=2) => "Low",
            _ => "N/A",
        };

        let has_epi_pen = if data.current_treatment.epi_pen_carried == "yes" {
            "Yes"
        } else if data.allergy_history.epi_pen_prescribed == "yes" {
            "Prescribed"
        } else {
            "No"
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: data.patient_information.full_name,
            primary_allergen: data.current_allergies.primary_allergen,
            severity_level: result.severity_level,
            anaphylaxis_risk: anaphylaxis_risk.to_string(),
            has_epi_pen: has_epi_pen.to_string(),
            last_review: data.review_assessment.review_date,
            allergen_category: data.current_allergies.allergen_category,
        })
    }
}
