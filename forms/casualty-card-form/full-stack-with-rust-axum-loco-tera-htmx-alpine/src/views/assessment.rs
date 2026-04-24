use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Total number of steps.
pub const TOTAL_STEPS: u32 = 14;

/// Build a Tera context for rendering the single-page assessment form.
/// All section partials share the same context.
pub fn build_assessment_context(data: &AssessmentData, id: Uuid) -> Context {
    let mut context = Context::new();
    context.insert("id", &id.to_string());
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("data", data);
    context.insert("demographics", &data.demographics);
    context.insert("next_of_kin", &data.next_of_kin);
    context.insert("gp", &data.gp);
    context.insert("arrival_triage", &data.arrival_triage);
    context.insert("presenting_complaint", &data.presenting_complaint);
    context.insert("pain_assessment", &data.pain_assessment);
    context.insert("medical_history", &data.medical_history);
    context.insert("vital_signs", &data.vital_signs);
    context.insert("primary_survey", &data.primary_survey);
    context.insert("clinical_examination", &data.clinical_examination);
    context.insert("investigations", &data.investigations);
    context.insert("treatment_interventions", &data.treatment_interventions);
    context.insert("assessment_plan", &data.assessment_plan);
    context.insert("disposition", &data.disposition);
    context.insert("safeguarding", &data.safeguarding);
    context.insert("medications", &data.medications);
    context.insert("allergies", &data.allergies);
    context.insert("blood_tests", &data.blood_tests);
    context.insert("imaging", &data.imaging);
    context.insert("medications_administered", &data.medications_administered);
    context.insert("fluid_therapy", &data.fluid_therapy);
    context.insert("procedures", &data.procedures);
    context
}
