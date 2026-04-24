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
    context.insert("menstrual_history", &data.menstrual_history);
    context.insert("gynecological_symptoms", &data.gynecological_symptoms);
    context.insert("obstetric_history", &data.obstetric_history);
    context.insert("cervical_screening", &data.cervical_screening);
    context.insert("contraception_fertility", &data.contraception_fertility);
    context.insert("menopause_assessment", &data.menopause_assessment);
    context.insert("breast_health", &data.breast_health);
    context.insert("sexual_health", &data.sexual_health);
    context.insert("clinical_review", &data.clinical_review);
    context
}
