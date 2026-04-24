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
    context.insert("visual_acuity", &data.visual_acuity);
    context.insert("refraction", &data.refraction);
    context.insert("anterior_segment", &data.anterior_segment);
    context.insert("intraocular_pressure", &data.intraocular_pressure);
    context.insert("posterior_segment", &data.posterior_segment);
    context.insert("visual_fields", &data.visual_fields);
    context.insert("ocular_motility", &data.ocular_motility);
    context.insert("special_investigations", &data.special_investigations);
    context.insert("clinical_review", &data.clinical_review);
    context
}
