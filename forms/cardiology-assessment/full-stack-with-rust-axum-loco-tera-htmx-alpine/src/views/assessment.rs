use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Total number of steps (always 10, all visible).
pub const TOTAL_STEPS: u32 = 10;

/// Build a Tera context for rendering the single-page assessment form.
/// All section partials share the same context.
pub fn build_assessment_context(data: &AssessmentData, id: Uuid) -> Context {
    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("data", data);
    context.insert("patient_information", &data.patient_information);
    context.insert("cardiac_history", &data.cardiac_history);
    context.insert("symptoms_assessment", &data.symptoms_assessment);
    context.insert("risk_factors", &data.risk_factors);
    context.insert("physical_examination", &data.physical_examination);
    context.insert("ecg_findings", &data.ecg_findings);
    context.insert("echocardiography", &data.echocardiography);
    context.insert("investigations", &data.investigations);
    context.insert("current_treatment", &data.current_treatment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
