//! Inpatient clinical note controller.
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::inpatient_clinical_notes::{ActiveModel, Entity, Model};

/// Parameters accepted when creating or updating a inpatient clinical note record.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    /// Deleted at.
    pub deleted_at: Option<DateTimeWithTimeZone>,
    /// Status.
    pub status: String,
    /// Note type.
    pub note_type: String,
    /// Hospital name.
    pub hospital_name: String,
    /// Ward name.
    pub ward_name: String,
    /// Bed number.
    pub bed_number: String,
    /// Note at.
    pub note_at: Option<DateTimeWithTimeZone>,
    /// Author name.
    pub author_name: String,
    /// Author grade.
    pub author_grade: String,
    /// Author registration number.
    pub author_registration_number: String,
    /// Parent specialty.
    pub parent_specialty: String,
    /// Responsible consultant name.
    pub responsible_consultant_name: String,
    /// Consult question.
    pub consult_question: String,
    /// Consult requesting team.
    pub consult_requesting_team: String,
    /// Procedure performed.
    pub procedure_performed: String,
    /// Procedure detail.
    pub procedure_detail: String,
    /// Procedure consent.
    pub procedure_consent: String,
    /// Procedure complications.
    pub procedure_complications: String,
    /// Transfer from ward.
    pub transfer_from_ward: String,
    /// Transfer to ward.
    pub transfer_to_ward: String,
    /// Transfer reason.
    pub transfer_reason: String,
    /// Admission at.
    pub admission_at: Option<DateTimeWithTimeZone>,
    /// Admitting specialty.
    pub admitting_specialty: String,
    /// Admission method.
    pub admission_method: String,
    /// Admission reason.
    pub admission_reason: String,
    /// Interval history.
    pub interval_history: String,
    /// No interval events.
    pub no_interval_events: String,
    /// Overnight events.
    pub overnight_events: String,
    /// Patient reported symptoms.
    pub patient_reported_symptoms: String,
    /// Nursing concerns.
    pub nursing_concerns: String,
    /// Pain score.
    pub pain_score: Option<i32>,
    /// Sleep quality.
    pub sleep_quality: String,
    /// Oral intake.
    pub oral_intake: String,
    /// Bowels last opened.
    pub bowels_last_opened: Option<Date>,
    /// Mobility status.
    pub mobility_status: String,
    /// Observed at.
    pub observed_at: Option<DateTimeWithTimeZone>,
    /// Respiratory rate.
    pub respiratory_rate: Option<i32>,
    /// Oxygen saturation.
    pub oxygen_saturation: Option<i32>,
    /// Spo2 scale.
    pub spo2_scale: String,
    /// Oxygen delivery.
    pub oxygen_delivery: String,
    /// Oxygen flow litres per minute.
    pub oxygen_flow_litres_per_minute: Option<Decimal>,
    /// Systolic blood pressure.
    pub systolic_blood_pressure: Option<i32>,
    /// Diastolic blood pressure.
    pub diastolic_blood_pressure: Option<i32>,
    /// Pulse rate.
    pub pulse_rate: Option<i32>,
    /// Acvpu.
    pub acvpu: String,
    /// Temperature celsius.
    pub temperature_celsius: Option<Decimal>,
    /// News2 total.
    pub news2_total: Option<i32>,
    /// News2 derived total.
    pub news2_derived_total: Option<i32>,
    /// News2 trend.
    pub news2_trend: String,
    /// News2 applicable.
    pub news2_applicable: String,
    /// News2 not applicable reason.
    pub news2_not_applicable_reason: String,
    /// Examination general.
    pub examination_general: String,
    /// Examination cardiovascular.
    pub examination_cardiovascular: String,
    /// Examination respiratory.
    pub examination_respiratory: String,
    /// Examination abdominal.
    pub examination_abdominal: String,
    /// Examination neurological.
    pub examination_neurological: String,
    /// Examination musculoskeletal.
    pub examination_musculoskeletal: String,
    /// Examination skin and wounds.
    pub examination_skin_and_wounds: String,
    /// Examination lines and drains.
    pub examination_lines_and_drains: String,
    /// Examination other.
    pub examination_other: String,
    /// No investigations reviewed.
    pub no_investigations_reviewed: String,
    /// No medication changes.
    pub no_medication_changes: String,
    /// Allergy checked.
    pub allergy_checked: String,
    /// Medicines reconciliation status.
    pub medicines_reconciliation_status: String,
    /// Antimicrobial review status.
    pub antimicrobial_review_status: String,
    /// Antimicrobial review at.
    pub antimicrobial_review_at: Option<DateTimeWithTimeZone>,
    /// Vte status.
    pub vte_status: String,
    /// Vte prophylaxis.
    pub vte_prophylaxis: String,
    /// Vte assessed at.
    pub vte_assessed_at: Option<DateTimeWithTimeZone>,
    /// Vte notes.
    pub vte_notes: String,
    /// Falls risk.
    pub falls_risk: String,
    /// Falls interventions.
    pub falls_interventions: String,
    /// Pressure ulcer risk.
    pub pressure_ulcer_risk: String,
    /// Skin integrity.
    pub skin_integrity: String,
    /// Pressure ulcer grade.
    pub pressure_ulcer_grade: String,
    /// Pressure ulcer sites.
    pub pressure_ulcer_sites: String,
    /// Delirium screen.
    pub delirium_screen: String,
    /// Delirium 4at score.
    pub delirium_4at_score: Option<i32>,
    /// Delirium notes.
    pub delirium_notes: String,
    /// Nutrition screen.
    pub nutrition_screen: String,
    /// Must score.
    pub must_score: Option<i32>,
    /// Nutrition plan.
    pub nutrition_plan: String,
    /// Infection status.
    pub infection_status: String,
    /// Isolation status.
    pub isolation_status: String,
    /// Organism.
    pub organism: String,
    /// Infection precautions.
    pub infection_precautions: String,
    /// Safeguarding concern.
    pub safeguarding_concern: String,
    /// Safeguarding notes.
    pub safeguarding_notes: String,
    /// Safeguarding referral made.
    pub safeguarding_referral_made: String,
    /// Clinical impression.
    pub clinical_impression: String,
    /// Differential diagnosis.
    pub differential_diagnosis: String,
    /// Response to treatment.
    pub response_to_treatment: String,
    /// New oxygen requirement.
    pub new_oxygen_requirement: String,
    /// New confusion.
    pub new_confusion: String,
    /// Sepsis screen.
    pub sepsis_screen: String,
    /// Arrest call.
    pub arrest_call: String,
    /// Critical care referral.
    pub critical_care_referral: String,
    /// New organ support.
    pub new_organ_support: String,
    /// Plan.
    pub plan: String,
    /// Escalation status.
    pub escalation_status: String,
    /// Escalation action.
    pub escalation_action: String,
    /// Ceiling of care.
    pub ceiling_of_care: String,
    /// Respect status.
    pub respect_status: String,
    /// Dnacpr status.
    pub dnacpr_status: String,
    /// Senior review needed.
    pub senior_review_needed: String,
    /// Senior review by.
    pub senior_review_by: String,
    /// Senior review at.
    pub senior_review_at: Option<DateTimeWithTimeZone>,
    /// Estimated discharge date.
    pub estimated_discharge_date: Option<Date>,
    /// Discharge planning notes.
    pub discharge_planning_notes: String,
    /// Family communication.
    pub family_communication: String,
    /// Patient communication.
    pub patient_communication: String,
    /// Team handover.
    pub team_handover: String,
    /// Consent status.
    pub consent_status: String,
    /// Capacity assessed.
    pub capacity_assessed: String,
    /// Capacity notes.
    pub capacity_notes: String,
    /// Author override acuity.
    pub author_override_acuity: String,
    /// Author override reason.
    pub author_override_reason: String,
    /// Attestation text.
    pub attestation_text: String,
    /// Electronic signature.
    pub electronic_signature: String,
    /// Signed at.
    pub signed_at: Option<DateTimeWithTimeZone>,
    /// Patient ID.
    pub patient_id: i64,
    /// Author ID.
    pub author_id: i64,
    /// Responsible consultant ID.
    pub responsible_consultant_id: i64,
    }

impl Params {
    #[allow(clippy::too_many_lines)] // linear clinical rule list; splitting adds indirection, not clarity
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.status = Set(self.status.clone());
      item.note_type = Set(self.note_type.clone());
      item.hospital_name = Set(self.hospital_name.clone());
      item.ward_name = Set(self.ward_name.clone());
      item.bed_number = Set(self.bed_number.clone());
      item.note_at = Set(self.note_at);
      item.author_name = Set(self.author_name.clone());
      item.author_grade = Set(self.author_grade.clone());
      item.author_registration_number = Set(self.author_registration_number.clone());
      item.parent_specialty = Set(self.parent_specialty.clone());
      item.responsible_consultant_name = Set(self.responsible_consultant_name.clone());
      item.consult_question = Set(self.consult_question.clone());
      item.consult_requesting_team = Set(self.consult_requesting_team.clone());
      item.procedure_performed = Set(self.procedure_performed.clone());
      item.procedure_detail = Set(self.procedure_detail.clone());
      item.procedure_consent = Set(self.procedure_consent.clone());
      item.procedure_complications = Set(self.procedure_complications.clone());
      item.transfer_from_ward = Set(self.transfer_from_ward.clone());
      item.transfer_to_ward = Set(self.transfer_to_ward.clone());
      item.transfer_reason = Set(self.transfer_reason.clone());
      item.admission_at = Set(self.admission_at);
      item.admitting_specialty = Set(self.admitting_specialty.clone());
      item.admission_method = Set(self.admission_method.clone());
      item.admission_reason = Set(self.admission_reason.clone());
      item.interval_history = Set(self.interval_history.clone());
      item.no_interval_events = Set(self.no_interval_events.clone());
      item.overnight_events = Set(self.overnight_events.clone());
      item.patient_reported_symptoms = Set(self.patient_reported_symptoms.clone());
      item.nursing_concerns = Set(self.nursing_concerns.clone());
      item.pain_score = Set(self.pain_score);
      item.sleep_quality = Set(self.sleep_quality.clone());
      item.oral_intake = Set(self.oral_intake.clone());
      item.bowels_last_opened = Set(self.bowels_last_opened);
      item.mobility_status = Set(self.mobility_status.clone());
      item.observed_at = Set(self.observed_at);
      item.respiratory_rate = Set(self.respiratory_rate);
      item.oxygen_saturation = Set(self.oxygen_saturation);
      item.spo2_scale = Set(self.spo2_scale.clone());
      item.oxygen_delivery = Set(self.oxygen_delivery.clone());
      item.oxygen_flow_litres_per_minute = Set(self.oxygen_flow_litres_per_minute);
      item.systolic_blood_pressure = Set(self.systolic_blood_pressure);
      item.diastolic_blood_pressure = Set(self.diastolic_blood_pressure);
      item.pulse_rate = Set(self.pulse_rate);
      item.acvpu = Set(self.acvpu.clone());
      item.temperature_celsius = Set(self.temperature_celsius);
      item.news2_total = Set(self.news2_total);
      item.news2_derived_total = Set(self.news2_derived_total);
      item.news2_trend = Set(self.news2_trend.clone());
      item.news2_applicable = Set(self.news2_applicable.clone());
      item.news2_not_applicable_reason = Set(self.news2_not_applicable_reason.clone());
      item.examination_general = Set(self.examination_general.clone());
      item.examination_cardiovascular = Set(self.examination_cardiovascular.clone());
      item.examination_respiratory = Set(self.examination_respiratory.clone());
      item.examination_abdominal = Set(self.examination_abdominal.clone());
      item.examination_neurological = Set(self.examination_neurological.clone());
      item.examination_musculoskeletal = Set(self.examination_musculoskeletal.clone());
      item.examination_skin_and_wounds = Set(self.examination_skin_and_wounds.clone());
      item.examination_lines_and_drains = Set(self.examination_lines_and_drains.clone());
      item.examination_other = Set(self.examination_other.clone());
      item.no_investigations_reviewed = Set(self.no_investigations_reviewed.clone());
      item.no_medication_changes = Set(self.no_medication_changes.clone());
      item.allergy_checked = Set(self.allergy_checked.clone());
      item.medicines_reconciliation_status = Set(self.medicines_reconciliation_status.clone());
      item.antimicrobial_review_status = Set(self.antimicrobial_review_status.clone());
      item.antimicrobial_review_at = Set(self.antimicrobial_review_at);
      item.vte_status = Set(self.vte_status.clone());
      item.vte_prophylaxis = Set(self.vte_prophylaxis.clone());
      item.vte_assessed_at = Set(self.vte_assessed_at);
      item.vte_notes = Set(self.vte_notes.clone());
      item.falls_risk = Set(self.falls_risk.clone());
      item.falls_interventions = Set(self.falls_interventions.clone());
      item.pressure_ulcer_risk = Set(self.pressure_ulcer_risk.clone());
      item.skin_integrity = Set(self.skin_integrity.clone());
      item.pressure_ulcer_grade = Set(self.pressure_ulcer_grade.clone());
      item.pressure_ulcer_sites = Set(self.pressure_ulcer_sites.clone());
      item.delirium_screen = Set(self.delirium_screen.clone());
      item.delirium_4at_score = Set(self.delirium_4at_score);
      item.delirium_notes = Set(self.delirium_notes.clone());
      item.nutrition_screen = Set(self.nutrition_screen.clone());
      item.must_score = Set(self.must_score);
      item.nutrition_plan = Set(self.nutrition_plan.clone());
      item.infection_status = Set(self.infection_status.clone());
      item.isolation_status = Set(self.isolation_status.clone());
      item.organism = Set(self.organism.clone());
      item.infection_precautions = Set(self.infection_precautions.clone());
      item.safeguarding_concern = Set(self.safeguarding_concern.clone());
      item.safeguarding_notes = Set(self.safeguarding_notes.clone());
      item.safeguarding_referral_made = Set(self.safeguarding_referral_made.clone());
      item.clinical_impression = Set(self.clinical_impression.clone());
      item.differential_diagnosis = Set(self.differential_diagnosis.clone());
      item.response_to_treatment = Set(self.response_to_treatment.clone());
      item.new_oxygen_requirement = Set(self.new_oxygen_requirement.clone());
      item.new_confusion = Set(self.new_confusion.clone());
      item.sepsis_screen = Set(self.sepsis_screen.clone());
      item.arrest_call = Set(self.arrest_call.clone());
      item.critical_care_referral = Set(self.critical_care_referral.clone());
      item.new_organ_support = Set(self.new_organ_support.clone());
      item.plan = Set(self.plan.clone());
      item.escalation_status = Set(self.escalation_status.clone());
      item.escalation_action = Set(self.escalation_action.clone());
      item.ceiling_of_care = Set(self.ceiling_of_care.clone());
      item.respect_status = Set(self.respect_status.clone());
      item.dnacpr_status = Set(self.dnacpr_status.clone());
      item.senior_review_needed = Set(self.senior_review_needed.clone());
      item.senior_review_by = Set(self.senior_review_by.clone());
      item.senior_review_at = Set(self.senior_review_at);
      item.estimated_discharge_date = Set(self.estimated_discharge_date);
      item.discharge_planning_notes = Set(self.discharge_planning_notes.clone());
      item.family_communication = Set(self.family_communication.clone());
      item.patient_communication = Set(self.patient_communication.clone());
      item.team_handover = Set(self.team_handover.clone());
      item.consent_status = Set(self.consent_status.clone());
      item.capacity_assessed = Set(self.capacity_assessed.clone());
      item.capacity_notes = Set(self.capacity_notes.clone());
      item.author_override_acuity = Set(self.author_override_acuity.clone());
      item.author_override_reason = Set(self.author_override_reason.clone());
      item.attestation_text = Set(self.attestation_text.clone());
      item.electronic_signature = Set(self.electronic_signature.clone());
      item.signed_at = Set(self.signed_at);
      item.patient_id = Set(self.patient_id);
      item.author_id = Set(self.author_id);
      item.responsible_consultant_id = Set(self.responsible_consultant_id);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

/// List every inpatient clinical note record.
#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

/// Create a new inpatient clinical note record.
#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

/// Update the inpatient clinical note record identified by `id`.
#[debug_handler]
pub async fn update(
    Path(id): Path<i64>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

/// Remove the inpatient clinical note record identified by `id`.
#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

/// Fetch the single inpatient clinical note record identified by `id`.
#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

/// The body returned by both grading endpoints: the persisted grade row and,
/// on a fresh grading, the full engine result including the rule and flag
/// audit trail.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradeResponse {
    /// The persisted `inpatient_clinical_note_grade` row.
    pub grade: crate::models::_entities::inpatient_clinical_note_grades::Model,
    /// The engine output, present when the grade was just computed.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<crate::engine::NoteGrade>,
}

/// Grade the note identified by `id` and persist the result.
///
/// Runs the documentation-completeness and clinical-acuity engines over the
/// stored note and its children, writing one grade row plus its rule and flag
/// children. Append-only: each call records a new grading rather than replacing
/// the last.
#[debug_handler]
pub async fn grade(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    let (grade, result) = crate::grading::grade_and_persist(&ctx.db, id).await?;
    format::json(GradeResponse {
        grade,
        result: Some(result),
    })
}

/// Fetch the most recent persisted grade for the note identified by `id`.
///
/// Returns 404 when the note has never been graded; `POST` to the same path to
/// grade it.
#[debug_handler]
pub async fn get_grade(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    let grade = crate::grading::latest_grade(&ctx.db, id).await?;
    format::json(GradeResponse {
        grade,
        result: None,
    })
}

/// Build the routes for the inpatient clinical notes resource.
pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/inpatient_clinical_notes/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
        .add("{id}/grade", post(grade))
        .add("{id}/grade", get(get_grade))
}
