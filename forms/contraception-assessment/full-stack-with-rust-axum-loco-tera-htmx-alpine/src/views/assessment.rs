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
    context.insert("reproductive_history", &data.reproductive_history);
    context.insert("medical_history", &data.medical_history);
    context.insert("cardiovascular_risk", &data.cardiovascular_risk);
    context.insert("current_medications", &data.current_medications);
    context.insert("smoking_bmi", &data.smoking_bmi);
    context.insert("contraceptive_preferences", &data.contraceptive_preferences);
    context.insert("ukmec_eligibility", &data.ukmec_eligibility);
    context.insert("counselling", &data.counselling);
    context.insert("clinical_review", &data.clinical_review);
    context
}
