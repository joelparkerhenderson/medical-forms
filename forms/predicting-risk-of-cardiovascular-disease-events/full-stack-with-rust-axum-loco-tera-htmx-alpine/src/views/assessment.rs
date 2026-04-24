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
    context.insert("demographics", &data.demographics);
    context.insert("blood_pressure", &data.blood_pressure);
    context.insert("cholesterol_lipids", &data.cholesterol_lipids);
    context.insert("metabolic_health", &data.metabolic_health);
    context.insert("renal_function", &data.renal_function);
    context.insert("smoking_history", &data.smoking_history);
    context.insert("medical_history", &data.medical_history);
    context.insert("current_medications", &data.current_medications);
    context.insert("review_calculate", &data.review_calculate);
    context
}
