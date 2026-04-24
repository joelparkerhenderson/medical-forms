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
    context.insert("hearing_history", &data.hearing_history);
    context.insert("audiometric_results", &data.audiometric_results);
    context.insert("communication_needs", &data.communication_needs);
    context.insert("lifestyle_assessment", &data.lifestyle_assessment);
    context.insert("current_hearing_aids", &data.current_hearing_aids);
    context.insert("fitting_requirements", &data.fitting_requirements);
    context.insert("expectations_goals", &data.expectations_goals);
    context.insert("trial_period", &data.trial_period);
    context.insert("clinical_review", &data.clinical_review);
    context
}
