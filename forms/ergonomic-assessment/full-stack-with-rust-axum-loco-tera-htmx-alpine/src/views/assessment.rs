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
    context.insert("occupation_details", &data.occupation_details);
    context.insert("workstation_assessment", &data.workstation_assessment);
    context.insert("posture_assessment", &data.posture_assessment);
    context.insert("musculoskeletal_symptoms", &data.musculoskeletal_symptoms);
    context.insert("manual_handling", &data.manual_handling);
    context.insert("dse_assessment", &data.dse_assessment);
    context.insert("break_patterns", &data.break_patterns);
    context.insert("environmental_factors", &data.environmental_factors);
    context.insert("clinical_review", &data.clinical_review);
    context
}
