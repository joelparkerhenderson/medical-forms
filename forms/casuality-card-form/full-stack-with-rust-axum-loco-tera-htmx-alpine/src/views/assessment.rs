use tera::Context;
use uuid::Uuid;

use crate::engine::types::AssessmentData;

/// Step titles used in the progress indicator and page headings.
const STEP_TITLES: &[&str] = &[
    "Patient Demographics",
    "Next of Kin & GP",
    "Arrival & Triage",
    "Presenting Complaint",
    "Pain Assessment",
    "Medical History",
    "Vital Signs",
    "Primary Survey (ABCDE)",
    "Clinical Examination",
    "Investigations",
    "Treatment & Interventions",
    "Assessment & Plan",
    "Disposition",
    "Safeguarding & Consent",
];

/// Total number of steps.
pub const TOTAL_STEPS: u32 = 14;

/// Build a Tera context for rendering a step form template.
pub fn build_step_context(data: &AssessmentData, id: Uuid, step: u32) -> Context {
    let mut context = Context::new();

    context.insert("id", &id.to_string());
    context.insert("step", &step);
    context.insert("total_steps", &TOTAL_STEPS);
    context.insert("step_title", STEP_TITLES.get((step as usize).wrapping_sub(1)).unwrap_or(&""));

    // Progress percentage
    let progress = ((step as f64 / TOTAL_STEPS as f64) * 100.0) as u32;
    context.insert("progress", &progress);

    // Navigation
    let prev_step = if step > 1 { Some(step - 1) } else { None };
    let next_step = if step < TOTAL_STEPS { Some(step + 1) } else { None };
    context.insert("prev_step", &prev_step);
    context.insert("next_step", &next_step);

    // Insert all data sections
    context.insert("data", &data);
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
