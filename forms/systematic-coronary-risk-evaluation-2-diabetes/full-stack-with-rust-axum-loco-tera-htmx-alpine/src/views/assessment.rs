use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

pub const TOTAL_STEPS: u32 = 10;

/// Build a Tera context for rendering the single-page assessment form.
/// All section partials share the same context.
pub fn build_assessment_context(data: &AssessmentData, id: Uuid) -> Context {
    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("data", data);
    context.insert("patient_demographics", &data.patient_demographics);
    context.insert("diabetes_history", &data.diabetes_history);
    context.insert("cardiovascular_history", &data.cardiovascular_history);
    context.insert("blood_pressure", &data.blood_pressure);
    context.insert("lipid_profile", &data.lipid_profile);
    context.insert("renal_function", &data.renal_function);
    context.insert("lifestyle_factors", &data.lifestyle_factors);
    context.insert("current_medications", &data.current_medications);
    context.insert("complications_screening", &data.complications_screening);
    context.insert("risk_assessment_summary", &data.risk_assessment_summary);
    context
}
