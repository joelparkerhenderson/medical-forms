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
    context.insert("joint_assessment", &data.joint_assessment);
    context.insert("morning_stiffness", &data.morning_stiffness);
    context.insert("disease_activity", &data.disease_activity);
    context.insert("laboratory_markers", &data.laboratory_markers);
    context.insert("imaging_findings", &data.imaging_findings);
    context.insert("functional_status", &data.functional_status);
    context.insert("medication_history", &data.medication_history);
    context.insert("comorbidities", &data.comorbidities);
    context.insert("clinical_review", &data.clinical_review);
    context
}
