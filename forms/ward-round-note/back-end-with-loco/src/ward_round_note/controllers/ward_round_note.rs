#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::ward_round_notes::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub deleted_at: Option<DateTimeWithTimeZone>,
    pub patient_id: i64,
    pub clinician_id: i64,
    pub clinician_name: String,
    pub clinician_grade: String,
    pub reviewed_at: Option<DateTimeWithTimeZone>,
    pub ward: String,
    pub patient_identifier: String,
    pub admission_date: Option<Date>,
    pub primary_diagnosis: String,
    pub overnight_events: String,
    pub no_overnight_events: String,
    pub problem_list: String,
    pub examination_summary: String,
    pub news2_total: Option<i32>,
    pub news2_single_param_three: String,
    pub observation_trend: String,
    pub investigations_reviewed: String,
    pub no_investigations_outstanding: String,
    pub abnormal_result_flagged: String,
    pub abnormal_result_actioned: String,
    pub vte_status: String,
    pub vte_prophylaxis_in_place: String,
    pub medication_changes: String,
    pub no_medication_changes: String,
    pub plan_and_jobs: String,
    pub escalation_status: String,
    pub senior_review_present: String,
    pub estimated_discharge_date: Option<Date>,
    pub discharge_not_estimable: String,
    pub clinical_note: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.deleted_at = Set(self.deleted_at);
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_grade = Set(self.clinician_grade.clone());
      item.reviewed_at = Set(self.reviewed_at);
      item.ward = Set(self.ward.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.admission_date = Set(self.admission_date);
      item.primary_diagnosis = Set(self.primary_diagnosis.clone());
      item.overnight_events = Set(self.overnight_events.clone());
      item.no_overnight_events = Set(self.no_overnight_events.clone());
      item.problem_list = Set(self.problem_list.clone());
      item.examination_summary = Set(self.examination_summary.clone());
      item.news2_total = Set(self.news2_total);
      item.news2_single_param_three = Set(self.news2_single_param_three.clone());
      item.observation_trend = Set(self.observation_trend.clone());
      item.investigations_reviewed = Set(self.investigations_reviewed.clone());
      item.no_investigations_outstanding = Set(self.no_investigations_outstanding.clone());
      item.abnormal_result_flagged = Set(self.abnormal_result_flagged.clone());
      item.abnormal_result_actioned = Set(self.abnormal_result_actioned.clone());
      item.vte_status = Set(self.vte_status.clone());
      item.vte_prophylaxis_in_place = Set(self.vte_prophylaxis_in_place.clone());
      item.medication_changes = Set(self.medication_changes.clone());
      item.no_medication_changes = Set(self.no_medication_changes.clone());
      item.plan_and_jobs = Set(self.plan_and_jobs.clone());
      item.escalation_status = Set(self.escalation_status.clone());
      item.senior_review_present = Set(self.senior_review_present.clone());
      item.estimated_discharge_date = Set(self.estimated_discharge_date);
      item.discharge_not_estimable = Set(self.discharge_not_estimable.clone());
      item.clinical_note = Set(self.clinical_note.clone());
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
        .prefix("api/ward_round_notes/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
