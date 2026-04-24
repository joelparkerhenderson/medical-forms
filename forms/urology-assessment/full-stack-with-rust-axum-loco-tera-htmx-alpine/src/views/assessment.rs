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
    context.insert("urinary_symptoms", &data.urinary_symptoms);
    context.insert("lower_urinary_tract", &data.lower_urinary_tract);
    context.insert("renal_function", &data.renal_function);
    context.insert("prostate_assessment", &data.prostate_assessment);
    context.insert("bladder_assessment", &data.bladder_assessment);
    context.insert("stone_disease", &data.stone_disease);
    context.insert("urological_cancers", &data.urological_cancers);
    context.insert("sexual_function", &data.sexual_function);
    context.insert("clinical_review", &data.clinical_review);
    context
}
