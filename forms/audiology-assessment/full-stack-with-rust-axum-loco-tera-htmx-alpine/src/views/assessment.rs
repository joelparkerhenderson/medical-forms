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
    context.insert("symptoms_assessment", &data.symptoms_assessment);
    context.insert("otoscopic_examination", &data.otoscopic_examination);
    context.insert("audiometric_results", &data.audiometric_results);
    context.insert("tinnitus", &data.tinnitus);
    context.insert("balance_assessment", &data.balance_assessment);
    context.insert("communication_impact", &data.communication_impact);
    context.insert("hearing_aid_assessment", &data.hearing_aid_assessment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
