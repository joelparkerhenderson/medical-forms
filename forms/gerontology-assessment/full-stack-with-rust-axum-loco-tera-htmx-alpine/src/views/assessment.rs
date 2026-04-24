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
    context.insert("functional_assessment", &data.functional_assessment);
    context.insert("cognitive_screening", &data.cognitive_screening);
    context.insert("falls_risk", &data.falls_risk);
    context.insert("medication_review", &data.medication_review);
    context.insert("nutritional_assessment", &data.nutritional_assessment);
    context.insert("mood_assessment", &data.mood_assessment);
    context.insert("social_circumstances", &data.social_circumstances);
    context.insert("continence_assessment", &data.continence_assessment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
