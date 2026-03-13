use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::has_life_sustaining_refusal;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub nhs_number: String,
    pub patient_name: String,
    pub validity_status: String,
    pub life_sustaining_refusal: bool,
    pub witnessed: bool,
    pub review_date: String,
    pub lpa_status: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult = m
            .result
            .as_ref()
            .and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let patient_name = data.personal_information.full_legal_name.clone();
        let life_sustaining = has_life_sustaining_refusal(&data);
        let witnessed = data.legal_signatures.witness_signature == "yes";
        let review_date = data.healthcare_professional_review.review_date.clone();

        let lpa_status = if data.lasting_power_of_attorney.has_lpa == "yes" {
            match data.lasting_power_of_attorney.lpa_type.as_str() {
                "health-and-welfare" => "Health & Welfare".to_string(),
                "property-and-financial" => "Property & Financial".to_string(),
                "both" => "Both".to_string(),
                _ => "Yes".to_string(),
            }
        } else {
            "None".to_string()
        };

        Some(Self {
            id: m.id.to_string(),
            nhs_number: data.personal_information.nhs_number,
            patient_name,
            validity_status: result.validity_status,
            life_sustaining_refusal: life_sustaining,
            witnessed,
            review_date,
            lpa_status,
        })
    }
}
