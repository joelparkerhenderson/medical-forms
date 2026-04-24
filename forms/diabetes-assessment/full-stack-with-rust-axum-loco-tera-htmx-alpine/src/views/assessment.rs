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
    context.insert("diabetes_history", &data.diabetes_history);
    context.insert("glycaemic_control", &data.glycaemic_control);
    context.insert("medications", &data.medications);
    context.insert("complications_screening", &data.complications_screening);
    context.insert("cardiovascular_risk", &data.cardiovascular_risk);
    context.insert("self_care_lifestyle", &data.self_care_lifestyle);
    context.insert("psychological_wellbeing", &data.psychological_wellbeing);
    context.insert("foot_assessment", &data.foot_assessment);
    context.insert("review_care_plan", &data.review_care_plan);
    context
}
