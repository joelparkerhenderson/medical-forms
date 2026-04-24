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
    context.insert("menopausal_symptoms", &data.menopausal_symptoms);
    context.insert("menstrual_history", &data.menstrual_history);
    context.insert("medical_history", &data.medical_history);
    context.insert("cardiovascular_risk", &data.cardiovascular_risk);
    context.insert("breast_health", &data.breast_health);
    context.insert("bone_health", &data.bone_health);
    context.insert("current_medications", &data.current_medications);
    context.insert("hrt_options_counselling", &data.hrt_options_counselling);
    context.insert("clinical_review", &data.clinical_review);
    context
}
