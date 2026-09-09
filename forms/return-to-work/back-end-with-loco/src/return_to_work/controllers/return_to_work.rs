#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::return_to_works::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub employer_id: i64,
    pub status: String,
    pub statement_kind: String,
    pub assessment_date: Option<Date>,
    pub assessment_time: Option<String>,
    pub absence_first_day: Option<Date>,
    pub absence_total_calendar_days: Option<i32>,
    pub prior_med3_reference: String,
    pub prior_self_certification_reference: String,
    pub primary_diagnosis_text: String,
    pub primary_diagnosis_snomed: String,
    pub primary_diagnosis_icd10: String,
    pub comorbid_conditions: String,
    pub mechanism: String,
    pub workplace_cause: String,
    pub riddor_reference: String,
    pub current_medications: String,
    pub ongoing_therapy: String,
    pub last_consultation_date: Option<Date>,
    pub anticipated_recovery_trajectory: String,
    pub specialist_followup_required: String,
    pub mobility: String,
    pub manual_handling_capacity_kg: Option<f64>,
    pub cognition: String,
    pub mood: String,
    pub sleep: String,
    pub pain_score_0_10: Option<i32>,
    pub driving_capacity: String,
    pub standing_tolerance_minutes: Option<i32>,
    pub sitting_tolerance_minutes: Option<i32>,
    pub screen_tolerance_minutes: Option<i32>,
    pub adl_independence: String,
    pub fitness_statement_computed: String,
    pub fitness_statement_final: String,
    pub clinician_override: String,
    pub clinician_override_reason: String,
    pub clinician_confidence: String,
    pub valid_from: Option<Date>,
    pub valid_until: Option<Date>,
    pub validity_weeks: Option<i32>,
    pub reassessment_required: String,
    pub phased_return_applicable: String,
    pub phased_return_template: String,
    pub phased_return_target_date: Option<Date>,
    pub phased_return_schedule_json: serde_json::Value,
    pub phased_return_support_contact: String,
    pub workstation_review_required: String,
    pub additional_adjustments_text: String,
    pub review_location: String,
    pub review_date: Option<Date>,
    pub occupational_health_referral_made: String,
    pub dvla_notification_required: String,
    pub employer_oh_notified: String,
    pub return_to_work_meeting_scheduled: String,
    pub maternity_certificate_reference: String,
    pub final_notes: String,
    pub signature_svg: String,
    pub signed_at: Option<DateTimeWithTimeZone>,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.employer_id = Set(self.employer_id);
      item.status = Set(self.status.clone());
      item.statement_kind = Set(self.statement_kind.clone());
      item.assessment_date = Set(self.assessment_date);
      item.assessment_time = Set(self.assessment_time.clone());
      item.absence_first_day = Set(self.absence_first_day);
      item.absence_total_calendar_days = Set(self.absence_total_calendar_days);
      item.prior_med3_reference = Set(self.prior_med3_reference.clone());
      item.prior_self_certification_reference = Set(self.prior_self_certification_reference.clone());
      item.primary_diagnosis_text = Set(self.primary_diagnosis_text.clone());
      item.primary_diagnosis_snomed = Set(self.primary_diagnosis_snomed.clone());
      item.primary_diagnosis_icd10 = Set(self.primary_diagnosis_icd10.clone());
      item.comorbid_conditions = Set(self.comorbid_conditions.clone());
      item.mechanism = Set(self.mechanism.clone());
      item.workplace_cause = Set(self.workplace_cause.clone());
      item.riddor_reference = Set(self.riddor_reference.clone());
      item.current_medications = Set(self.current_medications.clone());
      item.ongoing_therapy = Set(self.ongoing_therapy.clone());
      item.last_consultation_date = Set(self.last_consultation_date);
      item.anticipated_recovery_trajectory = Set(self.anticipated_recovery_trajectory.clone());
      item.specialist_followup_required = Set(self.specialist_followup_required.clone());
      item.mobility = Set(self.mobility.clone());
      item.manual_handling_capacity_kg = Set(self.manual_handling_capacity_kg);
      item.cognition = Set(self.cognition.clone());
      item.mood = Set(self.mood.clone());
      item.sleep = Set(self.sleep.clone());
      item.pain_score_0_10 = Set(self.pain_score_0_10);
      item.driving_capacity = Set(self.driving_capacity.clone());
      item.standing_tolerance_minutes = Set(self.standing_tolerance_minutes);
      item.sitting_tolerance_minutes = Set(self.sitting_tolerance_minutes);
      item.screen_tolerance_minutes = Set(self.screen_tolerance_minutes);
      item.adl_independence = Set(self.adl_independence.clone());
      item.fitness_statement_computed = Set(self.fitness_statement_computed.clone());
      item.fitness_statement_final = Set(self.fitness_statement_final.clone());
      item.clinician_override = Set(self.clinician_override.clone());
      item.clinician_override_reason = Set(self.clinician_override_reason.clone());
      item.clinician_confidence = Set(self.clinician_confidence.clone());
      item.valid_from = Set(self.valid_from);
      item.valid_until = Set(self.valid_until);
      item.validity_weeks = Set(self.validity_weeks);
      item.reassessment_required = Set(self.reassessment_required.clone());
      item.phased_return_applicable = Set(self.phased_return_applicable.clone());
      item.phased_return_template = Set(self.phased_return_template.clone());
      item.phased_return_target_date = Set(self.phased_return_target_date);
      item.phased_return_schedule_json = Set(self.phased_return_schedule_json.clone());
      item.phased_return_support_contact = Set(self.phased_return_support_contact.clone());
      item.workstation_review_required = Set(self.workstation_review_required.clone());
      item.additional_adjustments_text = Set(self.additional_adjustments_text.clone());
      item.review_location = Set(self.review_location.clone());
      item.review_date = Set(self.review_date);
      item.occupational_health_referral_made = Set(self.occupational_health_referral_made.clone());
      item.dvla_notification_required = Set(self.dvla_notification_required.clone());
      item.employer_oh_notified = Set(self.employer_oh_notified.clone());
      item.return_to_work_meeting_scheduled = Set(self.return_to_work_meeting_scheduled.clone());
      item.maternity_certificate_reference = Set(self.maternity_certificate_reference.clone());
      item.final_notes = Set(self.final_notes.clone());
      item.signature_svg = Set(self.signature_svg.clone());
      item.signed_at = Set(self.signed_at);
      }
}

async fn load_item(ctx: &AppContext, id: i64) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn add(State(ctx): State<AppContext>, Json(params): Json<Params>) -> Result<Response> {
    let mut item = ActiveModel {
        ..Default::default()
    };
    params.update(&mut item);
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

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

#[debug_handler]
pub async fn remove(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i64>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/return_to_works/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
