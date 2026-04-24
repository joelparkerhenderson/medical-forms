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
    context.insert("weight_bmi_history", &data.weight_bmi_history);
    context.insert("medical_history", &data.medical_history);
    context.insert("contraindications", &data.contraindications);
    context.insert("current_medications", &data.current_medications);
    context.insert("lifestyle_assessment", &data.lifestyle_assessment);
    context.insert("treatment_goals", &data.treatment_goals);
    context.insert("informed_consent", &data.informed_consent);
    context.insert("monitoring_plan", &data.monitoring_plan);
    context.insert("clinical_review", &data.clinical_review);
    context
}
