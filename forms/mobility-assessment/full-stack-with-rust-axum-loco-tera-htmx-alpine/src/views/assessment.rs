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
    context.insert("mobility_history", &data.mobility_history);
    context.insert("balance_assessment", &data.balance_assessment);
    context.insert("gait_analysis", &data.gait_analysis);
    context.insert("transfers_bed_mobility", &data.transfers_bed_mobility);
    context.insert("stairs_obstacles", &data.stairs_obstacles);
    context.insert("upper_limb_function", &data.upper_limb_function);
    context.insert("assistive_devices", &data.assistive_devices);
    context.insert("falls_risk_assessment", &data.falls_risk_assessment);
    context.insert("clinical_review", &data.clinical_review);
    context
}
