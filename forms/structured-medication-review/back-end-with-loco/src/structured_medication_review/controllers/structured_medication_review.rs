#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::structured_medication_reviews::{ActiveModel, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Params {
    pub patient_id: i64,
    pub clinician_id: Option<i64>,
    pub clinician_name: String,
    pub clinician_role: String,
    pub reviewed_at: Option<DateTimeWithTimeZone>,
    pub care_setting: String,
    pub consultation_mode: String,
    pub patient_identifier: String,
    pub age_band: String,
    pub sex: String,
    pub frailty_status: String,
    pub lives_in_care_home: String,
    pub long_term_conditions: String,
    pub presenting_problems: String,
    pub patient_reported_issues: String,
    pub what_matters_to_patient: String,
    pub shared_decisions: String,
    pub monitoring_due: String,
    pub overdue_monitoring_count: Option<i32>,
    pub follow_up_plan: String,
    pub follow_up_date: Option<Date>,
    pub review_completed: String,
    }

impl Params {
    fn update(&self, item: &mut ActiveModel) {
      item.patient_id = Set(self.patient_id);
      item.clinician_id = Set(self.clinician_id);
      item.clinician_name = Set(self.clinician_name.clone());
      item.clinician_role = Set(self.clinician_role.clone());
      item.reviewed_at = Set(self.reviewed_at);
      item.care_setting = Set(self.care_setting.clone());
      item.consultation_mode = Set(self.consultation_mode.clone());
      item.patient_identifier = Set(self.patient_identifier.clone());
      item.age_band = Set(self.age_band.clone());
      item.sex = Set(self.sex.clone());
      item.frailty_status = Set(self.frailty_status.clone());
      item.lives_in_care_home = Set(self.lives_in_care_home.clone());
      item.long_term_conditions = Set(self.long_term_conditions.clone());
      item.presenting_problems = Set(self.presenting_problems.clone());
      item.patient_reported_issues = Set(self.patient_reported_issues.clone());
      item.what_matters_to_patient = Set(self.what_matters_to_patient.clone());
      item.shared_decisions = Set(self.shared_decisions.clone());
      item.monitoring_due = Set(self.monitoring_due.clone());
      item.overdue_monitoring_count = Set(self.overdue_monitoring_count);
      item.follow_up_plan = Set(self.follow_up_plan.clone());
      item.follow_up_date = Set(self.follow_up_date);
      item.review_completed = Set(self.review_completed.clone());
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
        .prefix("api/structured_medication_reviews/")
        .add("/", get(list))
        .add("/", post(add))
        .add("{id}", get(get_one))
        .add("{id}", delete(remove))
        .add("{id}", put(update))
        .add("{id}", patch(update))
}
