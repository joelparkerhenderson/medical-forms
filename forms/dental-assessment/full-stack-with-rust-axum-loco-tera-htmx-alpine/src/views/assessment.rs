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
    context.insert("dental_history", &data.dental_history);
    context.insert("oral_examination", &data.oral_examination);
    context.insert("periodontal_assessment", &data.periodontal_assessment);
    context.insert("caries_assessment", &data.caries_assessment);
    context.insert("occlusion_tmj", &data.occlusion_tmj);
    context.insert("oral_hygiene", &data.oral_hygiene);
    context.insert("radiographic_findings", &data.radiographic_findings);
    context.insert("treatment_needs", &data.treatment_needs);
    context.insert("clinical_review", &data.clinical_review);
    context
}
