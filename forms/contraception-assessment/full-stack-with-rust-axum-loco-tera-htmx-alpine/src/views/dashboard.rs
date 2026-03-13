use serde::{Deserialize, Serialize};

use crate::engine::types::{AssessmentData, GradingResult};
use crate::engine::utils::risk_level_for_category;
use crate::models::_entities::assessments::Model;

/// A single row in the clinician dashboard patient list.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientRow {
    pub id: String,
    pub patient_name: String,
    pub method_chosen: String,
    pub ukmec_category: u8,
    pub eligibility_level: String,
    pub risk_level: String,
    pub last_review: String,
}

impl PatientRow {
    /// Build a PatientRow from an assessment model that has a completed grading result.
    pub fn from_model(m: &Model) -> Option<Self> {
        let data: AssessmentData = serde_json::from_value(m.data.clone()).ok()?;
        let result: GradingResult =
            m.result.as_ref().and_then(|v| serde_json::from_value(v.clone()).ok())?;

        let risk_level = risk_level_for_category(Some(result.ukmec_category));

        let method_label = match data.clinical_review.method_chosen.as_str() {
            "coc" => "COC (Combined Pill)",
            "pop" => "POP (Progestogen-only Pill)",
            "patchRing" => "Patch/Ring",
            "dmpaInjectable" => "DMPA Injectable",
            "implant" => "Implant",
            "lngIus" => "LNG-IUS (Hormonal Coil)",
            "cuIud" => "Cu-IUD (Copper Coil)",
            "barrier" => "Barrier Methods",
            other => other,
        };

        Some(Self {
            id: m.id.to_string(),
            patient_name: if data.patient_information.patient_name.is_empty() {
                "Unknown".to_string()
            } else {
                data.patient_information.patient_name
            },
            method_chosen: method_label.to_string(),
            ukmec_category: result.ukmec_category,
            eligibility_level: result.eligibility_level,
            risk_level: risk_level.to_string(),
            last_review: data.patient_information.consultation_date,
        })
    }
}
