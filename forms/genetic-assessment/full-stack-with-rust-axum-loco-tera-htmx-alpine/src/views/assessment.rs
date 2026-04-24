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
    context.insert("referral_reason", &data.referral_reason);
    context.insert("family_pedigree", &data.family_pedigree);
    context.insert("personal_medical_history", &data.personal_medical_history);
    context.insert("cancer_risk_assessment", &data.cancer_risk_assessment);
    context.insert("cardiac_genetic_risk", &data.cardiac_genetic_risk);
    context.insert("reproductive_genetics", &data.reproductive_genetics);
    context.insert("genetic_testing_status", &data.genetic_testing_status);
    context.insert("psychological_impact", &data.psychological_impact);
    context.insert("clinical_review", &data.clinical_review);
    context
}
